"""
pipeline.py
-----------
Entry point for the Olist ETL pipeline.

Execution order
---------------
1. Load raw CSVs           (loaders.load_all)
2. Join into flat orders   (transformers.build_flat_orders)
3. Sliding-window late rate (algorithms.sliding_window.compute_seller_late_rate)
4. Z-score anomaly flags   (algorithms.zscore_anomaly.flag_anomalies)
5. Write to SQLite         (writers.write_to_sqlite)

Configuration
-------------
Reads DB_PATH and DATA_DIR from environment variables (falls back to .env
file via python-dotenv if installed, then to built-in defaults).

Usage
-----
    python -m ingestion.pipeline
    # or
    python pipeline.py
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional: load .env from the backend directory so the pipeline works when
# invoked directly without a process-level environment.
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv  # type: ignore

    _env_file = Path(__file__).resolve().parent.parent / ".env"
    if _env_file.exists():
        load_dotenv(dotenv_path=_env_file, override=False)
        print(f"[pipeline] Loaded env from {_env_file}")
except ImportError:
    pass  # python-dotenv not installed; rely on process environment


def _resolve_config() -> tuple[str, str]:
    """Return (data_dir, db_path) from environment with fallback defaults."""
    data_dir = os.environ.get("DATA_DIR", "data/")
    db_path  = os.environ.get("DB_PATH",  "olist.db")
    return data_dir, db_path


def run_pipeline() -> None:
    """Execute all ETL steps in order and report timing."""
    t_start = time.perf_counter()

    data_dir, db_path = _resolve_config()
    print("=" * 60)
    print("[pipeline] Olist ETL — starting")
    print(f"[pipeline]   DATA_DIR = {data_dir}")
    print(f"[pipeline]   DB_PATH  = {db_path}")
    print("=" * 60)

    # -- Step 1: Load CSVs --------------------------------------------------
    print("\n[pipeline] Step 1/4 — Loading CSVs …")
    t0 = time.perf_counter()
    from ingestion.loaders import load_all  # noqa: E402

    try:
        frames = load_all(data_dir)
    except FileNotFoundError as exc:
        print(f"\n❌ Error: {exc}")
        print("\n💡 Dataset not found in data/. You can download it automatically with:")
        print("    python download_data.py --run-pipeline")
        sys.exit(1)
    print(f"[pipeline] Step 1 done in {time.perf_counter() - t0:.1f}s")

    # -- Step 2: Transform / join -------------------------------------------
    print("\n[pipeline] Step 2/4 — Joining into flat orders …")
    t0 = time.perf_counter()
    from ingestion.transformers import build_flat_orders  # noqa: E402

    df = build_flat_orders(frames)
    print(f"[pipeline] Step 2 done in {time.perf_counter() - t0:.1f}s")

    # -- Step 3: Sliding-window seller late rate ----------------------------
    print("\n[pipeline] Step 3/4 — Computing seller late rate (sliding window) …")
    t0 = time.perf_counter()
    from ingestion.algorithms.sliding_window import compute_seller_late_rate  # noqa: E402

    df = compute_seller_late_rate(df)
    print(f"[pipeline] Step 3 done in {time.perf_counter() - t0:.1f}s")

    # -- Step 4: Z-score anomaly detection ----------------------------------
    print("\n[pipeline] Step 4/4 — Flagging anomalies (z-score) …")
    t0 = time.perf_counter()
    from ingestion.algorithms.zscore_anomaly import flag_anomalies  # noqa: E402

    df = flag_anomalies(df)
    print(f"[pipeline] Step 4 done in {time.perf_counter() - t0:.1f}s")

    # -- Step 5: Write to SQLite --------------------------------------------
    print("\n[pipeline] Step 5/5 — Writing to SQLite …")
    t0 = time.perf_counter()
    from ingestion.writers import write_to_sqlite  # noqa: E402

    write_to_sqlite(df, db_path=db_path)
    print(f"[pipeline] Step 5 done in {time.perf_counter() - t0:.1f}s")

    # -- Summary ------------------------------------------------------------
    elapsed = time.perf_counter() - t_start
    print("\n" + "=" * 60)
    print(f"[pipeline] ETL complete in {elapsed:.1f}s")
    print(f"[pipeline]   Rows written : {len(df):,}")
    print(f"[pipeline]   Database     : {Path(db_path).resolve()}")

    # Quick sanity: dashboard metrics
    delivered_pct = (df["order_status"] == "delivered").mean() * 100
    late_pct      = df["is_late"].mean() * 100
    anomaly_pct   = df["is_anomaly"].mean() * 100
    on_time_pct   = 100.0 - late_pct

    print(f"\n[pipeline]   Delivered %  : {delivered_pct:.1f}%")
    print(f"[pipeline]   Late %       : {late_pct:.1f}%")
    print(f"[pipeline]   On-time %    : {on_time_pct:.1f}%")
    print(f"[pipeline]   Anomaly %    : {anomaly_pct:.1f}%")
    print("=" * 60)


if __name__ == "__main__":
    # Allow running as `python pipeline.py` from the backend/ directory
    # by adding backend/ to sys.path so relative imports resolve.
    _backend_dir = Path(__file__).resolve().parent.parent
    if str(_backend_dir) not in sys.path:
        sys.path.insert(0, str(_backend_dir))

    run_pipeline()
