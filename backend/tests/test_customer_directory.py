
import sqlite3

import pytest

from app.services import customer_service


@pytest.fixture
def customer_directory_db(tmp_path, monkeypatch):
    db_path = tmp_path / "customer_directory_test.db"

    conn = sqlite3.connect(db_path)

    conn.executescript("""
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
            order_status TEXT,
            order_purchase_timestamp TEXT
        );

        CREATE TABLE order_payments (
            order_id TEXT NOT NULL,
            payment_sequential INTEGER NOT NULL,
            payment_value REAL NOT NULL,
            PRIMARY KEY (order_id, payment_sequential)
        );

        CREATE TABLE customer_directory_summary (
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
        );
    """)

    # ---------------------------------------------------------
    # 1. Insert customer records
    # ---------------------------------------------------------

    conn.executemany(
        """
        INSERT INTO customers VALUES (?, ?, ?, ?, ?)
        """,
        [
            ("c-1", "u-1", "01234", "Sao Paulo", "SP"),
            ("c-2", "u-1", "54321", "Campinas", "SP"),
            ("c-3", "u-2", "11111", "Rio de Janeiro", "RJ"),
        ],
    )

    # ---------------------------------------------------------
    # 2. Insert orders
    # ---------------------------------------------------------

    conn.executemany(
        """
        INSERT INTO source_orders VALUES (?, ?, ?, ?)
        """,
        [
            ("o-1", "c-1", "delivered", "2020-01-01 10:00:00"),
            ("o-2", "c-2", "delivered", "2020-02-01 10:00:00"),
            ("o-3", "c-3", "shipped", "2020-03-01 10:00:00"),
        ],
    )

    # ---------------------------------------------------------
    # 3. Insert payment records
    # ---------------------------------------------------------

    # o-1 has two payment rows.
    # Its actual order payment total is 100, not two orders.

    conn.executemany(
        """
        INSERT INTO order_payments VALUES (?, ?, ?)
        """,
        [
            ("o-1", 1, 40.0),
            ("o-1", 2, 60.0),
            ("o-2", 1, 50.0),
            ("o-3", 1, 30.0),
        ],
    )

    # ---------------------------------------------------------
    # 4. Populate customer directory summary
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

                o.order_id,
                o.order_status,
                o.order_purchase_timestamp,

                COALESCE(pt.order_payment_total, 0)
                    AS order_payment_total,

                CASE
                    WHEN pt.order_id IS NOT NULL THEN 1
                    ELSE 0
                END AS has_payment

            FROM customers c

            LEFT JOIN source_orders o
                ON o.customer_id = c.customer_id

            LEFT JOIN payment_totals pt
                ON pt.order_id = o.order_id
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

    conn.commit()
    conn.close()

    # Point the service at the temporary test database.
    monkeypatch.setattr(
        customer_service.settings,
        "db_path",
        str(db_path),
    )


# ---------------------------------------------------------
# BASIC DIRECTORY TESTS
# ---------------------------------------------------------

def test_customer_directory_returns_unique_customers(
    customer_directory_db,
):
    result = customer_service.get_customers()

    assert result["total"] == 2
    assert len(result["items"]) == 2


def test_customer_directory_aggregates_repeat_customers(
    customer_directory_db,
):
    result = customer_service.get_customers(search="u-1")

    customer = result["items"][0]

    assert customer["customer_unique_id"] == "u-1"
    assert customer["record_count"] == 2
    assert customer["total_orders"] == 2
    assert customer["lifetime_spend"] == 150.0


def test_customer_directory_uses_latest_location(
    customer_directory_db,
):
    result = customer_service.get_customers(search="u-1")

    customer = result["items"][0]

    assert customer["customer_city"] == "Campinas"
    assert customer["customer_state"] == "SP"
    assert customer["customer_zip_code_prefix"] == "54321"


# ---------------------------------------------------------
# SEARCH AND FILTER TESTS
# ---------------------------------------------------------

def test_customer_directory_searches_city(
    customer_directory_db,
):
    result = customer_service.get_customers(search="campinas")

    assert result["total"] == 1
    assert result["items"][0]["customer_unique_id"] == "u-1"


def test_customer_directory_filters_state(
    customer_directory_db,
):
    result = customer_service.get_customers(state="RJ")

    assert result["total"] == 1
    assert result["items"][0]["customer_unique_id"] == "u-2"


# ---------------------------------------------------------
# PAGINATION TESTS
# ---------------------------------------------------------

def test_customer_directory_pagination(
    customer_directory_db,
):
    first_page = customer_service.get_customers(
        page=1,
        limit=1,
    )

    second_page = customer_service.get_customers(
        page=2,
        limit=1,
    )

    assert first_page["total"] == 2
    assert first_page["total_pages"] == 2
    assert len(first_page["items"]) == 1
    assert len(second_page["items"]) == 1

    assert (
        first_page["items"][0]["customer_unique_id"]
        != second_page["items"][0]["customer_unique_id"]
    )


# ---------------------------------------------------------
# SORTING TESTS
# ---------------------------------------------------------

def test_customer_directory_sorts_by_lifetime_spend(
    customer_directory_db,
):
    result = customer_service.get_customers(
        sort_by="lifetime_spend",
        sort_order="desc",
    )

    assert result["items"][0]["customer_unique_id"] == "u-1"
    assert result["items"][0]["lifetime_spend"] == 150.0


# ---------------------------------------------------------
# ADDITIONAL CUSTOMER METRICS TESTS
# ---------------------------------------------------------

def test_customer_directory_returns_additional_metrics(
    customer_directory_db,
):
    result = customer_service.get_customers(search="u-1")

    customer = result["items"][0]

    assert customer["first_purchase"] == "2020-01-01 10:00:00"
    assert customer["last_purchase"] == "2020-02-01 10:00:00"

    assert customer["total_orders"] == 2
    assert customer["lifetime_spend"] == 150.0
    assert customer["average_order_value"] == 75.0

    assert customer["customer_type"] == "Returning"
    assert customer["last_order_status"] == "delivered"


def test_customer_directory_identifies_new_customer(
    customer_directory_db,
):
    result = customer_service.get_customers(search="u-2")

    customer = result["items"][0]

    assert customer["customer_type"] == "New"
    assert customer["total_orders"] == 1
    assert customer["average_order_value"] == 30.0
    assert customer["last_order_status"] == "shipped"


# ---------------------------------------------------------
# EMPTY RESULT TEST
# ---------------------------------------------------------

def test_customer_directory_returns_empty_results(
    customer_directory_db,
):
    result = customer_service.get_customers(
        search="customer-does-not-exist",
    )

    assert result["total"] == 0
    assert result["items"] == []
    assert result["total_pages"] == 0


def test_customer_directory_searches_zip_prefix(
    customer_directory_db,
):
    result = customer_service.get_customers(search="54321")

    assert result["total"] == 1
    assert result["items"][0]["customer_unique_id"] == "u-1"


def test_customer_directory_filters_customer_type(
    customer_directory_db,
):
    returning = customer_service.get_customers(customer_type="Returning")
    assert returning["total"] == 1
    assert returning["items"][0]["customer_unique_id"] == "u-1"

    new_only = customer_service.get_customers(customer_type="New")
    assert new_only["total"] == 1
    assert new_only["items"][0]["customer_unique_id"] == "u-2"


def test_customer_directory_combines_search_state_and_type(
    customer_directory_db,
):
    match = customer_service.get_customers(
        search="54321",
        state="SP",
        customer_type="Returning",
    )
    assert match["total"] == 1
    assert match["items"][0]["customer_unique_id"] == "u-1"

    mismatch = customer_service.get_customers(
        search="54321",
        state="RJ",
        customer_type="Returning",
    )
    assert mismatch["total"] == 0
    assert mismatch["items"] == []


def test_customer_directory_meta_returns_counts_and_states(
    customer_directory_db,
):
    meta = customer_service.get_customer_directory_meta()

    assert meta["total_customers"] == 2
    assert meta["returning_customers"] == 1
    assert meta["new_customers"] == 1
    assert meta["states"] == ["RJ", "SP"]


def test_customer_directory_routes_meta_and_combined_filters(
    customer_directory_db,
):
    from app.api.v1.routes import customers as customers_routes

    route_paths = [route.path for route in customers_routes.router.routes]
    assert route_paths.index("/customers/meta") < route_paths.index(
        "/customers/{customer_unique_id}"
    )

    meta_out = customers_routes.get_directory_meta()
    assert meta_out.model_dump() == {
        "total_customers": 2,
        "returning_customers": 1,
        "new_customers": 1,
        "states": ["RJ", "SP"],
    }

    list_out = customers_routes.list_customers(
        page=1,
        limit=20,
        search="54321",
        state="SP",
        customer_type="Returning",
        sort_by="last_purchase",
        sort_order="desc",
    )
    payload = list_out.model_dump()
    assert payload["total"] == 1
    assert payload["items"][0]["customer_unique_id"] == "u-1"
