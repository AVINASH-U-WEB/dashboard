
"""
pipeline.py
-----------
Entry point for the Olist ETL pipeline.

Execution order
---------------
1. Load raw CSV datasets
2. Transform datasets into flat orders
3. Calculate seller late rates
4. Detect order anomalies
5. Write enriched orders to SQLite
6. Write normalized customer source tables

Configuration
-------------
Reads DB_PATH and DATA_DIR from environment variables.
Defaults to backend/data and backend/olist.db.

Usage
-----
    python -m ingestion.pipeline
    python pipeline.py
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path


# ---------------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------------

try:
    from dotenv import load_dotenv

    _env_file = Path(__file__).resolve().parent.parent / ".env"

    if _env_file.exists():
        load_dotenv(dotenv_path=_env_file, override=False)
        print(f"[pipeline] Loaded env from {_env_file}")

except ImportError:
    pass


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def _resolve_config() -> tuple[str, str]:
    """Resolve absolute paths for the data directory and database."""

    backend_dir = Path(__file__).resolve().parent.parent

    data_dir = Path(
        os.environ.get("DATA_DIR", "data")
    ).expanduser()

    db_path = Path(
        os.environ.get("DB_PATH", "olist.db")
    ).expanduser()

    if not data_dir.is_absolute():
        data_dir = backend_dir / data_dir

    if not db_path.is_absolute():
        db_path = backend_dir / db_path

    return str(data_dir.resolve()), str(db_path.resolve())


# ---------------------------------------------------------------------------
# Main ETL pipeline
# ---------------------------------------------------------------------------

def run_pipeline() -> None:
    """Execute all six ETL steps."""

    t_start = time.perf_counter()

    data_dir, db_path = _resolve_config()

    print("=" * 60)
    print("[pipeline] Olist ETL starting")
    print(f"[pipeline] DATA_DIR = {data_dir}")
    print(f"[pipeline] DB_PATH  = {db_path}")
    print("=" * 60)

    # STEP 1: Load CSV datasets

    print("\n[pipeline] Step 1/6 - Loading CSV datasets...")
    t0 = time.perf_counter()

    from ingestion.loaders import load_all

    try:
        frames = load_all(data_dir)

    except FileNotFoundError as exc:
        print(f"\nError: {exc}")
        print("Check whether the Olist datasets exist in the data directory.")
        sys.exit(1)

    print(f"[pipeline] Step 1 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 2: Transform and join datasets

    print("\n[pipeline] Step 2/6 - Building flat orders...")
    t0 = time.perf_counter()

    from ingestion.transformers import build_flat_orders

    df = build_flat_orders(frames)

    print(f"[pipeline] Step 2 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 3: Calculate seller late rates

    print("\n[pipeline] Step 3/6 - Computing seller late rates...")
    t0 = time.perf_counter()

    from ingestion.algorithms.sliding_window import (
        compute_seller_late_rate,
    )

    df = compute_seller_late_rate(df)

    print(f"[pipeline] Step 3 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 4: Detect anomalies

    print("\n[pipeline] Step 4/6 - Detecting anomalies...")
    t0 = time.perf_counter()

    from ingestion.algorithms.zscore_anomaly import flag_anomalies

    df = flag_anomalies(df)

    print(f"[pipeline] Step 4 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 5: Write enriched orders

    print("\n[pipeline] Step 5/6 - Writing enriched orders...")
    t0 = time.perf_counter()

    from ingestion.writers import write_to_sqlite

    write_to_sqlite(df, db_path=db_path)

    print(f"[pipeline] Step 5 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 6: Write normalized source tables

    print("\n[pipeline] Step 6/6 - Writing normalized source tables...")
    t0 = time.perf_counter()

    from ingestion.source_writers import write_source_tables

    source_counts = write_source_tables(
        frames,
        db_path=db_path,
    )

    for table, count in source_counts.items():
        print(f"[pipeline] {table}: {count:,} rows")

    print(f"[pipeline] Step 6 completed in {time.perf_counter() - t0:.1f}s")

    # SUMMARY

    elapsed = time.perf_counter() - t_start

    print("\n" + "=" * 60)
    print(f"[pipeline] ETL completed in {elapsed:.1f}s")
    print(f"[pipeline] Orders written: {len(df):,}")
    print(f"[pipeline] Database: {db_path}")

    delivered_pct = (
        (df["order_status"] == "delivered").mean() * 100
    )

    late_pct = df["is_late"].mean() * 100
    anomaly_pct = df["is_anomaly"].mean() * 100
    on_time_pct = 100.0 - late_pct

    print(f"\n[pipeline] Delivered % : {delivered_pct:.1f}%")
    print(f"[pipeline] Late %      : {late_pct:.1f}%")
    print(f"[pipeline] On-time %   : {on_time_pct:.1f}%")
    print(f"[pipeline] Anomaly %   : {anomaly_pct:.1f}%")

    print("=" * 60)


# ---------------------------------------------------------------------------
# Script entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    backend_dir = Path(__file__).resolve().parent.parent

    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    run_pipeline()


