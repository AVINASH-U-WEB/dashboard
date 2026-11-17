import sqlite3

from app.config import settings


def get_customer_profile(customer_unique_id: str) -> dict | None:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        rows = conn.execute(
            """
            SELECT
                customer_id,
                customer_zip_code_prefix,
                customer_city,
                customer_state
            FROM customers
            WHERE customer_unique_id = ?
            ORDER BY customer_id
            """,
            (customer_unique_id,),
        ).fetchall()

        if not rows:
            return None

        customer_records = []

        for row in rows:
            zip_prefix = row["customer_zip_code_prefix"]

            customer_records.append({
                "customer_id": row["customer_id"],
                "customer_zip_code_prefix": (
                    str(zip_prefix).zfill(5)
                    if zip_prefix is not None
                    else None
                ),
                "customer_city": row["customer_city"],
                "customer_state": row["customer_state"],
            })

        return {
            "customer_unique_id": customer_unique_id,
            "record_count": len(customer_records),
            "customer_records": customer_records,
        }

    finally:
        conn.close()

def get_customer_orders(
    customer_unique_id: str,
    page: int,
    limit: int,
) -> dict | None:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        # Check whether this customer exists.
        customer = conn.execute(
            """
            SELECT 1
            FROM customers
            WHERE customer_unique_id = ?
            LIMIT 1
            """,
            (customer_unique_id,),
        ).fetchone()

        if customer is None:
            return None

        # Count all orders belonging to this customer.
        total_orders = conn.execute(
            """
            SELECT COUNT(*)
            FROM source_orders AS o
            INNER JOIN customers AS c
                ON c.customer_id = o.customer_id
            WHERE c.customer_unique_id = ?
            """,
            (customer_unique_id,),
        ).fetchone()[0]

        # Calculate the number of records to skip.
        offset = (page - 1) * limit

        # Fetch the requested page.
        rows = conn.execute(
            """
            SELECT
                o.order_id,
                o.order_status,
                o.order_purchase_timestamp,
                o.order_approved_at,
                o.order_delivered_carrier_date,
                o.order_delivered_customer_date,
                o.order_estimated_delivery_date
            FROM source_orders AS o
            INNER JOIN customers AS c
                ON c.customer_id = o.customer_id
            WHERE c.customer_unique_id = ?
            ORDER BY
                o.order_purchase_timestamp DESC,
                o.order_id DESC
            LIMIT ? OFFSET ?
            """,
            (customer_unique_id, limit, offset),
        ).fetchall()

        total_pages = (
            (total_orders + limit - 1) // limit
            if total_orders
            else 0
        )

        return {
            "customer_unique_id": customer_unique_id,
            "total_orders": total_orders,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "orders": [dict(row) for row in rows],
        }

    finally:
        conn.close()

def get_customer_summary(customer_unique_id: str) -> dict | None:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        # First, check whether the customer exists.
        customer = conn.execute(
            """
            SELECT 1
            FROM customers
            WHERE customer_unique_id = ?
            LIMIT 1
            """,
            (customer_unique_id,),
        ).fetchone()

        if customer is None:
            return None

        # Calculate one payment total per order, then summarize
        # all orders belonging to this customer.
        row = conn.execute(
            """
            WITH customer_orders AS (
                SELECT
                    c.customer_unique_id,
                    o.order_id,
                    o.order_purchase_timestamp
                FROM customers AS c
                INNER JOIN source_orders AS o
                    ON c.customer_id = o.customer_id
                WHERE c.customer_unique_id = ?
            ),
            payment_totals AS (
                SELECT
                    order_id,
                    SUM(payment_value) AS order_total
                FROM order_payments
                GROUP BY order_id
            )
            SELECT
                COUNT(co.order_id) AS total_orders,
                COALESCE(SUM(pt.order_total), 0.0) AS lifetime_spend,
                MIN(co.order_purchase_timestamp) AS first_purchase,
                MAX(co.order_purchase_timestamp) AS last_purchase
            FROM customer_orders AS co
            LEFT JOIN payment_totals AS pt
                ON co.order_id = pt.order_id
            """,
            (customer_unique_id,),
        ).fetchone()

        total_orders = row["total_orders"]
        lifetime_spend = round(float(row["lifetime_spend"]), 2)

        average_order_value = (
            round(lifetime_spend / total_orders, 2)
            if total_orders
            else 0.0
        )

        return {
            "customer_unique_id": customer_unique_id,
            "total_orders": total_orders,
            "lifetime_spend": lifetime_spend,
            "average_order_value": average_order_value,
            "first_purchase": row["first_purchase"],
            "last_purchase": row["last_purchase"],
        }

    finally:
        conn.close()

def get_customer_payments(customer_unique_id: str) -> dict | None:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        # Check customer existence.
        customer = conn.execute(
            """
            SELECT 1
            FROM customers
            WHERE customer_unique_id = ?
            LIMIT 1
            """,
            (customer_unique_id,),
        ).fetchone()

        if customer is None:
            return None

        # Find payment totals grouped by payment method.
        rows = conn.execute(
            """
            WITH customer_orders AS (
                SELECT o.order_id
                FROM customers AS c
                INNER JOIN source_orders AS o
                    ON c.customer_id = o.customer_id
                WHERE c.customer_unique_id = ?
            )
            SELECT
                p.payment_type,
                COUNT(*) AS payment_count,
                SUM(p.payment_value) AS total_amount
            FROM customer_orders AS co
            INNER JOIN order_payments AS p
                ON co.order_id = p.order_id
            GROUP BY p.payment_type
            ORDER BY total_amount DESC
            """,
            (customer_unique_id,),
        ).fetchall()

        total_payment_value = sum(
            float(row["total_amount"] or 0)
            for row in rows
        )

        payment_methods = []

        for row in rows:
            amount = round(float(row["total_amount"] or 0), 2)

            percentage = (
                round(amount / total_payment_value * 100, 2)
                if total_payment_value > 0
                else 0.0
            )

            payment_methods.append({
                "payment_type": row["payment_type"],
                "payment_count": row["payment_count"],
                "total_amount": amount,
                "percentage": percentage,
            })

        return {
            "customer_unique_id": customer_unique_id,
            "total_payment_value": round(total_payment_value, 2),
            "payment_methods": payment_methods,
        }

    finally:
        conn.close()