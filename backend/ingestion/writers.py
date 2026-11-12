"""
writers.py
----------
Writes the flat orders DataFrame to a SQLite database.

Features
--------
* WAL journal mode for concurrent read access.
* Drops and re-creates the `orders` table on each run (full refresh).
* Batch inserts in chunks of 1 000 rows per transaction for efficiency.
* Creates indexes on the columns used most by the API / dashboard:
    - order_status
    - order_purchase_timestamp
    - is_anomaly
    - seller_id
    - customer_id
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Union

import pandas as pd


# Columns that need covering indexes for fast dashboard queries
INDEXED_COLUMNS = [
    "order_status",
    "order_purchase_timestamp",
    "is_anomaly",
    "seller_id",
    "customer_id",
]

# Batch size (rows per SQLite transaction)
BATCH_SIZE = 1_000


def _get_ddl(df: pd.DataFrame) -> str:
    """Generate a CREATE TABLE statement from the DataFrame's dtypes."""

    type_map = {
        "int64":   "INTEGER",
        "int32":   "INTEGER",
        "float64": "REAL",
        "float32": "REAL",
        "bool":    "INTEGER",
        "object":  "TEXT",
        "datetime64[ns]": "TEXT",
    }

    col_defs = []
    for col, dtype in df.dtypes.items():
        sql_type = type_map.get(str(dtype), "TEXT")
        col_defs.append(f"    {col}  {sql_type}")

    return "CREATE TABLE IF NOT EXISTS orders (\n" + ",\n".join(col_defs) + "\n);"


def write_to_sqlite(
    df: pd.DataFrame,
    db_path: Union[str, Path] = "olist.db",
) -> None:
    """
    Persist *df* to the ``orders`` table in the SQLite database at *db_path*.

    Parameters
    ----------
    df : pd.DataFrame
        Fully enriched flat orders table (output of the pipeline).
    db_path : str or Path
        File path for the SQLite database (created if absent).
    """
    db_path = Path(db_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # Serialise datetimes to ISO strings so SQLite stores them as TEXT
    df = df.copy()
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime("%Y-%m-%d %H:%M:%S")

    con = sqlite3.connect(str(db_path))
    try:
        con.execute("PRAGMA journal_mode=WAL;")
        con.execute("PRAGMA synchronous=NORMAL;")

        # Full refresh: drop and recreate
        con.execute("DROP TABLE IF EXISTS orders;")
        con.execute(_get_ddl(df))
        con.commit()

        # Batch insert
        columns      = list(df.columns)
        placeholders = ", ".join("?" * len(columns))
        insert_sql   = f"INSERT INTO orders ({', '.join(columns)}) VALUES ({placeholders})"

        total_rows = len(df)
        inserted   = 0

        for start in range(0, total_rows, BATCH_SIZE):
            batch = df.iloc[start : start + BATCH_SIZE]
            # Convert each row to a plain Python tuple (sqlite3 requirement)
            rows = [
                tuple(
                    None if pd.isna(v) else (v.isoformat() if hasattr(v, "isoformat") else v)
                    for v in row
                )
                for row in batch.itertuples(index=False, name=None)
            ]
            con.executemany(insert_sql, rows)
            con.commit()
            inserted += len(rows)
            print(f"[writers] Inserted {inserted:,} / {total_rows:,} rows …", end="\r")

        print(f"\n[writers] Insert complete: {inserted:,} rows → {db_path}")

        # Create indexes
        for col in INDEXED_COLUMNS:
            if col in df.columns:
                idx_name = f"idx_orders_{col}"
                con.execute(
                    f"CREATE INDEX IF NOT EXISTS {idx_name} ON orders ({col});"
                )
        con.commit()
        print(f"[writers] Indexes created on: {', '.join(INDEXED_COLUMNS)}")

    finally:
        con.close()
