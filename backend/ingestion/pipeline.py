
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
7. Initialize Ticketing Module (create tickets table and sample records)

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
import sqlite3
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
# Ticketing Module initialization
# ---------------------------------------------------------------------------

def initialize_ticket_table(db_path: str) -> None:
    """
    Create the tickets table and insert up to 20 sample tickets.

    Uses the same SQLite database as the Olist ETL pipeline.
    Existing ticket records are preserved during future ETL runs.
    """

    conn = sqlite3.connect(db_path)

    try:
        cursor = conn.cursor()

        # STEP 1: Create tickets table if it does not exist.
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                priority TEXT NOT NULL,
                category TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Open',
                notes TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # STEP 2: Create index for faster order-based searches.
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_tickets_order_id
            ON tickets(order_id)
        """)

        conn.commit()

        print("[tickets] Tickets table created or already exists.")

        # STEP 3: Check whether tickets already exist.
        cursor.execute("SELECT COUNT(*) FROM tickets")

        existing_count = cursor.fetchone()[0]

        if existing_count > 0:
            print(
                f"[tickets] Found {existing_count} existing tickets. "
                "Skipping sample insertion."
            )
            return

        # STEP 4: Retrieve actual Olist order IDs.
        cursor.execute("""
            SELECT order_id
            FROM orders
            WHERE order_id IS NOT NULL
            ORDER BY order_id
            LIMIT 20
        """)

        order_ids = [row[0] for row in cursor.fetchall()]

        if not order_ids:
            print(
                "[tickets] No existing order IDs found. "
                "Sample ticket insertion skipped."
            )
            return

        # STEP 5: Define 20 sample tickets.
        sample_tickets = [
            ("High", "Delivery", "Customer reported a delayed delivery.", "Open"),
            ("Medium", "Refund", "Customer requested a refund.", "In Progress"),
            ("Low", "Product", "Customer asked for product information.", "Resolved"),
            ("High", "Payment", "Payment deducted but order confirmation was not received.", "Open"),
            ("Medium", "Order Cancellation", "Customer requested order cancellation.", "In Progress"),
            ("Low", "General Inquiry", "Customer requested assistance with an order.", "Resolved"),
            ("High", "Delivery", "Customer reported that the package was not delivered.", "Open"),
            ("Medium", "Product", "Customer reported receiving a damaged product.", "In Progress"),
            ("Low", "Payment", "Customer requested a payment receipt.", "Resolved"),
            ("High", "Refund", "Customer has not received the refund.", "Open"),
            ("Medium", "Delivery", "Customer requested an updated delivery date.", "In Progress"),
            ("Low", "General Inquiry", "Customer asked about the return policy.", "Resolved"),
            ("High", "Product", "Customer received an incorrect product.", "Open"),
            ("Medium", "Order Cancellation", "Customer requested cancellation before shipment.", "In Progress"),
            ("Low", "Payment", "Customer asked about available payment methods.", "Resolved"),
            ("High", "Delivery", "Customer reported a missing package.", "Open"),
            ("Medium", "Refund", "Customer asked about refund processing time.", "In Progress"),
            ("Low", "Product", "Customer requested product specifications.", "Resolved"),
            ("High", "Payment", "Customer reported an unsuccessful payment.", "Open"),
            ("Medium", "General Inquiry", "Customer requested help with an order.", "In Progress"),
        ]

        # STEP 6: Prepare records using existing order IDs.
        ticket_records = []

        for index, ticket in enumerate(sample_tickets[:20]):

            order_id = order_ids[index % len(order_ids)]

            priority, category, notes, status = ticket

            ticket_records.append(
                (order_id, priority, category, status, notes)
            )

        # STEP 7: Insert sample tickets.
        cursor.executemany("""
            INSERT INTO tickets (
                order_id,
                priority,
                category,
                status,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        """, ticket_records)

        conn.commit()

        print(
            f"[tickets] Successfully inserted "
            f"{len(ticket_records)} sample tickets."
        )

    except sqlite3.Error as error:
        conn.rollback()

        print(f"[tickets] Database error: {error}")

        raise

    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Main ETL pipeline
# ---------------------------------------------------------------------------

def run_pipeline() -> None:
    """Execute all seven ETL and initialization steps."""

    t_start = time.perf_counter()

    data_dir, db_path = _resolve_config()

    print("=" * 60)
    print("[pipeline] Olist ETL starting")
    print(f"[pipeline] DATA_DIR = {data_dir}")
    print(f"[pipeline] DB_PATH  = {db_path}")
    print("=" * 60)

    # STEP 1: Load CSV datasets

    print("\n[pipeline] Step 1/7 - Loading CSV datasets...")
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

    print("\n[pipeline] Step 2/7 - Building flat orders...")
    t0 = time.perf_counter()

    from ingestion.transformers import build_flat_orders

    df = build_flat_orders(frames)

    print(f"[pipeline] Step 2 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 3: Calculate seller late rates

    print("\n[pipeline] Step 3/7 - Computing seller late rates...")
    t0 = time.perf_counter()

    from ingestion.algorithms.sliding_window import (
        compute_seller_late_rate,
    )

    df = compute_seller_late_rate(df)

    print(f"[pipeline] Step 3 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 4: Detect anomalies

    print("\n[pipeline] Step 4/7 - Detecting anomalies...")
    t0 = time.perf_counter()

    from ingestion.algorithms.zscore_anomaly import flag_anomalies

    df = flag_anomalies(df)

    print(f"[pipeline] Step 4 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 5: Write enriched orders

    print("\n[pipeline] Step 5/7 - Writing enriched orders...")
    t0 = time.perf_counter()

    from ingestion.writers import write_to_sqlite

    write_to_sqlite(df, db_path=db_path)

    print(f"[pipeline] Step 5 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 6: Write normalized source tables

    print("\n[pipeline] Step 6/7 - Writing normalized source tables...")
    t0 = time.perf_counter()

    from ingestion.source_writers import write_source_tables

    source_counts = write_source_tables(
        frames,
        db_path=db_path,
    )

    for table, count in source_counts.items():
        print(f"[pipeline] {table}: {count:,} rows")

    print(f"[pipeline] Step 6 completed in {time.perf_counter() - t0:.1f}s")

    # STEP 7: Initialize Ticketing Module

    print("\n[pipeline] Step 7/7 - Initializing Ticketing Module...")
    t0 = time.perf_counter()

    initialize_ticket_table(db_path)

    print(f"[pipeline] Step 7 completed in {time.perf_counter() - t0:.1f}s")

    # -----------------------------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------------------------

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
