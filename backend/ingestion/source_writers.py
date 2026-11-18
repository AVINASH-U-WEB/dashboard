
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
    Refresh normalized customer source tables.

    All source-table changes occur in one transaction.
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
