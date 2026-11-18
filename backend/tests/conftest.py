
import sqlite3

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Create an isolated SQLite database and FastAPI test client."""

    db_path = tmp_path / "test_customers.db"

    conn = sqlite3.connect(db_path)

    conn.executescript("""
        CREATE TABLE orders (
            order_id TEXT PRIMARY KEY
        );

        CREATE TABLE customers (
            customer_id TEXT PRIMARY KEY,
            customer_unique_id TEXT NOT NULL,
            customer_zip_code_prefix TEXT,
            customer_city TEXT,
            customer_state TEXT
        );

        CREATE TABLE source_orders (
            order_id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            order_status TEXT NOT NULL,
            order_purchase_timestamp TEXT,
            order_approved_at TEXT,
            order_delivered_carrier_date TEXT,
            order_delivered_customer_date TEXT,
            order_estimated_delivery_date TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        );

        CREATE TABLE order_payments (
            order_id TEXT NOT NULL,
            payment_sequential INTEGER NOT NULL,
            payment_type TEXT,
            payment_installments INTEGER,
            payment_value REAL,
            PRIMARY KEY (order_id, payment_sequential),
            FOREIGN KEY (order_id) REFERENCES source_orders(order_id)
        );
    """)

    conn.executemany(
        """
        INSERT INTO customers (
            customer_id,
            customer_unique_id,
            customer_zip_code_prefix,
            customer_city,
            customer_state
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        [
            ("c1", "u1", "01234", "alpha", "SP"),
            ("c2", "u1", "54321", "beta", "RJ"),
            ("c3", "u2", "06789", "gamma", "MG"),
        ],
    )

    conn.executemany(
        """
        INSERT INTO source_orders (
            order_id,
            customer_id,
            order_status,
            order_purchase_timestamp
        )
        VALUES (?, ?, ?, ?)
        """,
        [
            ("order1", "c1", "delivered", "2018-01-10 10:00:00"),
            ("order2", "c2", "delivered", "2018-02-15 12:00:00"),
            ("order3", "c1", "canceled", "2018-03-20 15:00:00"),
        ],
    )

    conn.executemany(
        """
        INSERT INTO order_payments (
            order_id,
            payment_sequential,
            payment_type,
            payment_installments,
            payment_value
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        [
            ("order1", 1, "credit_card", 2, 100.0),
            ("order1", 2, "voucher", 1, 20.0),
            ("order2", 1, "credit_card", 3, 80.0),
            ("order3", 1, "boleto", 1, 50.0),
        ],
    )

    conn.commit()
    conn.close()

    # Make the application use this test database.
    monkeypatch.setattr(settings, "db_path", str(db_path))

    with TestClient(app) as test_client:
        yield test_client
