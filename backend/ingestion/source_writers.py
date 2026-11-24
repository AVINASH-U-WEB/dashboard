
from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd


CUSTOMER_COLUMNS = [
    "customer_id",
    "customer_unique_id",
    "customer_zip_code_prefix",
    "customer_city",
    "customer_state",
]

ORDER_COLUMNS = [
    "order_id",
    "customer_id",
    "order_status",
    "order_purchase_timestamp",
    "order_approved_at",
    "order_delivered_carrier_date",
    "order_delivered_customer_date",
    "order_estimated_delivery_date",
]

PAYMENT_COLUMNS = [
    "order_id",
    "payment_sequential",
    "payment_type",
    "payment_installments",
    "payment_value",
]


def _validate_frames(frames: dict[str, pd.DataFrame]) -> None:
    """Validate required datasets, columns and primary keys."""

    checks = [
        ("customers", CUSTOMER_COLUMNS, ["customer_id"]),
        ("orders", ORDER_COLUMNS, ["order_id"]),
        (
            "order_payments",
            PAYMENT_COLUMNS,
            ["order_id", "payment_sequential"],
        ),
    ]

    for name, columns, keys in checks:
        if name not in frames:
            raise ValueError(f"Missing dataset: {name}")

        df = frames[name]

        missing_columns = set(columns) - set(df.columns)

        if missing_columns:
            raise ValueError(
                f"{name} is missing columns: {sorted(missing_columns)}"
            )

        if df[keys].isna().any().any():
            raise ValueError(f"{name} contains missing primary-key values")

        if df.duplicated(subset=keys).any():
            raise ValueError(f"{name} contains duplicate primary keys")

    # Validate foreign-key relationships before touching the database.
    customer_ids = set(frames["customers"]["customer_id"])
    order_ids = set(frames["orders"]["order_id"])

    invalid_orders = set(frames["orders"]["customer_id"]) - customer_ids

    if invalid_orders:
        raise ValueError(
            f"Orders reference {len(invalid_orders)} unknown customers"
        )

    invalid_payments = set(frames["order_payments"]["order_id"]) - order_ids

    if invalid_payments:
        raise ValueError(
            f"Payments reference {len(invalid_payments)} unknown orders"
        )


def _sqlite_value(value):
    """Convert pandas and NumPy values into SQLite-compatible values."""

    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat(sep=" ")

    if hasattr(value, "item"):
        return value.item()

    return value


def _records(
    df: pd.DataFrame,
    columns: list[str],
) -> list[tuple]:
    """Convert selected DataFrame columns into SQLite records."""

    return [
        tuple(_sqlite_value(value) for value in row)
        for row in df[columns].itertuples(index=False, name=None)
    ]


def write_source_tables(
    frames: dict[str, pd.DataFrame],
    db_path: str = "olist.db",
) -> dict[str, int]:
    """
    Refresh normalized customer source tables and customer directory summary.

    All source-table and summary changes occur in one transaction.
    The existing reporting 'orders' table is never modified.
    """

    _validate_frames(frames)

    customers = frames["customers"].copy()
    orders = frames["orders"]
    payments = frames["order_payments"]

    # Preserve leading zeros in Brazilian ZIP-code prefixes.
    customers["customer_zip_code_prefix"] = (
        customers["customer_zip_code_prefix"]
        .map(
            lambda value: (
                None if pd.isna(value) else str(int(value)).zfill(5)
                if isinstance(value, (int, float))
                else str(value).zfill(5)
            )
        )
    )

    database_path = Path(db_path).resolve()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(database_path)

    try:
        conn.execute("PRAGMA foreign_keys = ON")

        with conn:
            # ---------------------------------------------------------
            # 1. Create normalized source tables
            # ---------------------------------------------------------

            conn.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    customer_id TEXT PRIMARY KEY,
                    customer_unique_id TEXT NOT NULL,
                    customer_zip_code_prefix TEXT,
                    customer_city TEXT,
                    customer_state TEXT
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS source_orders (
                    order_id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    order_status TEXT NOT NULL,
                    order_purchase_timestamp TEXT,
                    order_approved_at TEXT,
                    order_delivered_carrier_date TEXT,
                    order_delivered_customer_date TEXT,
                    order_estimated_delivery_date TEXT,
                    FOREIGN KEY (customer_id)
                        REFERENCES customers(customer_id)
                        ON DELETE CASCADE
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS order_payments (
                    order_id TEXT NOT NULL,
                    payment_sequential INTEGER NOT NULL,
                    payment_type TEXT NOT NULL,
                    payment_installments INTEGER NOT NULL,
                    payment_value REAL NOT NULL,
                    PRIMARY KEY (order_id, payment_sequential),
                    FOREIGN KEY (order_id)
                        REFERENCES source_orders(order_id)
                        ON DELETE CASCADE
                )
            """)

            # ---------------------------------------------------------
            # 2. Create customer directory summary table
            # ---------------------------------------------------------

            conn.execute("""
                CREATE TABLE IF NOT EXISTS customer_directory_summary (
                    customer_unique_id TEXT PRIMARY KEY,
                    customer_city TEXT,
                    customer_state TEXT,
                    customer_zip_code_prefix TEXT,
                    record_count INTEGER NOT NULL DEFAULT 0,
                    total_orders INTEGER NOT NULL DEFAULT 0,
                    lifetime_spend REAL NOT NULL DEFAULT 0,
                    average_order_value REAL NOT NULL DEFAULT 0,
                    first_purchase TEXT,
                    last_purchase TEXT,
                    customer_type TEXT NOT NULL,
                    last_order_status TEXT
                )
            """)

            # ---------------------------------------------------------
            # 3. Refresh source data
            # ---------------------------------------------------------

            # Delete derived summary before refreshing its source data.
            conn.execute("DELETE FROM customer_directory_summary")

            # Delete child records before parent records.
            conn.execute("DELETE FROM order_payments")
            conn.execute("DELETE FROM source_orders")
            conn.execute("DELETE FROM customers")

            conn.executemany(
                """
                INSERT INTO customers (
                    customer_id,
                    customer_unique_id,
                    customer_zip_code_prefix,
                    customer_city,
                    customer_state
                ) VALUES (?, ?, ?, ?, ?)
                """,
                _records(customers, CUSTOMER_COLUMNS),
            )

            conn.executemany(
                """
                INSERT INTO source_orders (
                    order_id,
                    customer_id,
                    order_status,
                    order_purchase_timestamp,
                    order_approved_at,
                    order_delivered_carrier_date,
                    order_delivered_customer_date,
                    order_estimated_delivery_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                _records(orders, ORDER_COLUMNS),
            )

            conn.executemany(
                """
                INSERT INTO order_payments (
                    order_id,
                    payment_sequential,
                    payment_type,
                    payment_installments,
                    payment_value
                ) VALUES (?, ?, ?, ?, ?)
                """,
                _records(payments, PAYMENT_COLUMNS),
            )

            # ---------------------------------------------------------
            # 4. Build customer directory summary
            # ---------------------------------------------------------

            conn.execute("""
                WITH payment_totals AS (
                    SELECT
                        order_id,
                        SUM(payment_value) AS order_payment_total
                    FROM order_payments
                    GROUP BY order_id
                ),

                customer_orders AS (
                    SELECT
                        c.customer_unique_id,
                        c.customer_id,
                        c.customer_city,
                        c.customer_state,
                        c.customer_zip_code_prefix,

                        so.order_id,
                        so.order_status,
                        so.order_purchase_timestamp,

                        COALESCE(pt.order_payment_total, 0)
                            AS order_payment_total,

                        CASE
                            WHEN pt.order_id IS NOT NULL THEN 1
                            ELSE 0
                        END AS has_payment

                    FROM customers c

                    LEFT JOIN source_orders so
                        ON so.customer_id = c.customer_id

                    LEFT JOIN payment_totals pt
                        ON pt.order_id = so.order_id
                ),

                customer_summary AS (
                    SELECT
                        customer_unique_id,

                        COUNT(DISTINCT customer_id) AS record_count,

                        COUNT(DISTINCT order_id) AS total_orders,

                        SUM(order_payment_total) AS lifetime_spend,

                        SUM(has_payment) AS payment_order_count,

                        MIN(order_purchase_timestamp) AS first_purchase,

                        MAX(order_purchase_timestamp) AS last_purchase

                    FROM customer_orders

                    GROUP BY customer_unique_id
                ),

                ranked_locations AS (
                    SELECT
                        customer_unique_id,
                        customer_city,
                        customer_state,
                        customer_zip_code_prefix,
                        order_status,

                        ROW_NUMBER() OVER (
                            PARTITION BY customer_unique_id
                            ORDER BY
                                order_purchase_timestamp DESC,
                                order_id DESC,
                                customer_id DESC
                        ) AS row_num

                    FROM customer_orders
                )

                INSERT INTO customer_directory_summary (
                    customer_unique_id,
                    customer_city,
                    customer_state,
                    customer_zip_code_prefix,
                    record_count,
                    total_orders,
                    lifetime_spend,
                    average_order_value,
                    first_purchase,
                    last_purchase,
                    customer_type,
                    last_order_status
                )

                SELECT
                    summary.customer_unique_id,

                    location.customer_city,
                    location.customer_state,
                    location.customer_zip_code_prefix,

                    summary.record_count,
                    summary.total_orders,
                    summary.lifetime_spend,

                    CASE
                        WHEN summary.payment_order_count > 0
                        THEN summary.lifetime_spend
                             / summary.payment_order_count
                        ELSE 0
                    END,

                    summary.first_purchase,
                    summary.last_purchase,

                    CASE
                        WHEN summary.total_orders <= 1 THEN 'New'
                        ELSE 'Returning'
                    END,

                    location.order_status

                FROM customer_summary summary

                LEFT JOIN ranked_locations location
                    ON location.customer_unique_id =
                       summary.customer_unique_id
                    AND location.row_num = 1
            """)

            # ---------------------------------------------------------
            # 5. Create indexes
            # ---------------------------------------------------------

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_customers_unique_id
                ON customers(customer_unique_id)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_source_orders_customer
                ON source_orders(customer_id)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_source_orders_purchase
                ON source_orders(order_purchase_timestamp)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_payments_order
                ON order_payments(order_id)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_customer_summary_state
                ON customer_directory_summary(customer_state)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_customer_summary_last_purchase
                ON customer_directory_summary(last_purchase)
            """)

            # ---------------------------------------------------------
            # 6. Validate foreign keys
            # ---------------------------------------------------------

            violations = conn.execute(
                "PRAGMA foreign_key_check"
            ).fetchall()

            if violations:
                raise sqlite3.IntegrityError(
                    f"Foreign key violations: {violations[:5]}"
                )

        return {
            "customers": len(customers),
            "source_orders": len(orders),
            "order_payments": len(payments),
        }

    finally:
        conn.close()
