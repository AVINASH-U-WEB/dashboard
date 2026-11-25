
import logging
import sqlite3

from app.config import settings

logger = logging.getLogger(__name__)


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

        offset = (page - 1) * limit

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

        row = conn.execute(
            """
            WITH customer_orders AS (
                SELECT
                    c.customer_unique_id,
                    o.order_id,
                    o.order_status,
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
            ),

            ranked_orders AS (
                SELECT
                    order_status,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            order_purchase_timestamp DESC,
                            order_id DESC
                    ) AS order_rank
                FROM customer_orders
            )

            SELECT
                COUNT(co.order_id) AS total_orders,

                COALESCE(
                    SUM(pt.order_total),
                    0.0
                ) AS lifetime_spend,

                COUNT(
                    DISTINCT CASE
                        WHEN pt.order_total IS NOT NULL
                        THEN co.order_id
                    END
                ) AS payment_order_count,

                MIN(
                    co.order_purchase_timestamp
                ) AS first_purchase,

                MAX(
                    co.order_purchase_timestamp
                ) AS last_purchase,

                (
                    SELECT order_status
                    FROM ranked_orders
                    WHERE order_rank = 1
                ) AS last_order_status

            FROM customer_orders AS co

            LEFT JOIN payment_totals AS pt
                ON co.order_id = pt.order_id
            """,
            (customer_unique_id,),
        ).fetchone()

        total_orders = row["total_orders"]
        payment_order_count = row["payment_order_count"]

        lifetime_spend = round(
            float(row["lifetime_spend"] or 0),
            2,
        )

        average_order_value = (
            round(
                lifetime_spend / payment_order_count,
                2,
            )
            if payment_order_count
            else 0.0
        )

        customer_type = (
            "Returning"
            if total_orders > 1
            else "New"
        )

        return {
            "customer_unique_id": customer_unique_id,
            "total_orders": total_orders,
            "lifetime_spend": lifetime_spend,
            "average_order_value": average_order_value,
            "first_purchase": row["first_purchase"],
            "last_purchase": row["last_purchase"],
            "customer_type": customer_type,
            "last_order_status": row["last_order_status"],
        }

    finally:
        conn.close()


def get_customer_payments(customer_unique_id: str) -> dict | None:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
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
            amount = round(
                float(row["total_amount"] or 0),
                2,
            )

            percentage = (
                round(
                    amount / total_payment_value * 100,
                    2,
                )
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
            "total_payment_value": round(
                total_payment_value,
                2,
            ),
            "payment_methods": payment_methods,
        }

    finally:
        conn.close()


# ---------------------------------------------------------
# CUSTOMER DIRECTORY
# Reads precomputed customer_directory_summary table.
# One row per customer_unique_id.
# ---------------------------------------------------------


def get_customer_directory_meta() -> dict:
    """
    Return aggregate customer directory counts and distinct represented states
    from precomputed customer_directory_summary.
    """
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        counts = conn.execute(
            """
            SELECT
                COUNT(*) AS total_customers,
                COALESCE(SUM(CASE WHEN customer_type = 'Returning' THEN 1 ELSE 0 END), 0) AS returning_customers,
                COALESCE(SUM(CASE WHEN customer_type = 'New' THEN 1 ELSE 0 END), 0) AS new_customers
            FROM customer_directory_summary
            """
        ).fetchone()

        state_rows = conn.execute(
            """
            SELECT DISTINCT upper(trim(customer_state)) AS state
            FROM customer_directory_summary
            WHERE customer_state IS NOT NULL
              AND trim(customer_state) != ''
            ORDER BY state ASC
            """
        ).fetchall()

        return {
            "total_customers": int(counts["total_customers"] or 0),
            "returning_customers": int(counts["returning_customers"] or 0),
            "new_customers": int(counts["new_customers"] or 0),
            "states": [row["state"] for row in state_rows],
        }
    finally:
        conn.close()


def get_customers(
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    state: str | None = None,
    customer_type: str | None = None,
    sort_by: str = "last_purchase",
    sort_order: str = "desc",
) -> dict:
    """
    Return a paginated directory of unique customers.

    Reads precomputed customer metrics instead of recalculating
    aggregations from the normalized source tables.

    Search supports customer_unique_id, city, ZIP prefix and state.
    """

    # -----------------------------------------------------
    # 1. Validate pagination
    # -----------------------------------------------------

    page = max(1, page)
    limit = max(1, min(limit, 100))

    # -----------------------------------------------------
    # 2. Allowlist sorting columns
    # -----------------------------------------------------

    sort_columns = {
        "customer_unique_id": "customer_unique_id",
        "customer_city": "customer_city",
        "total_orders": "total_orders",
        "lifetime_spend": "lifetime_spend",
        "average_order_value": "average_order_value",
        "first_purchase": "first_purchase",
        "last_purchase": "last_purchase",
        "customer_type": "customer_type",
        "last_order_status": "last_order_status",
    }

    sort_column = sort_columns.get(
        sort_by,
        "last_purchase",
    )

    direction = (
        "ASC"
        if sort_order.lower() == "asc"
        else "DESC"
    )

    # -----------------------------------------------------
    # 3. Normalize search filters
    # -----------------------------------------------------

    search = search.strip() if search and search.strip() else None
    state = state.strip().upper() if state and state.strip() else None
    customer_type = (
        customer_type.strip().capitalize()
        if customer_type and customer_type.strip()
        else None
    )

    where_clause = """
        WHERE (
            ? IS NULL

            OR instr(
                lower(customer_unique_id),
                lower(?)
            ) > 0

            OR instr(
                lower(COALESCE(customer_city, '')),
                lower(?)
            ) > 0

            OR instr(
                lower(COALESCE(customer_zip_code_prefix, '')),
                lower(?)
            ) > 0

            OR instr(
                lower(COALESCE(customer_state, '')),
                lower(?)
            ) > 0
        )

        AND (
            ? IS NULL

            OR upper(
                COALESCE(customer_state, '')
            ) = ?
        )

        AND (
            ? IS NULL

            OR lower(
                COALESCE(customer_type, '')
            ) = lower(?)
        )
    """

    query_params = (
        search,
        search,
        search,
        search,
        search,
        state,
        state,
        customer_type,
        customer_type,
    )

    offset = (page - 1) * limit

    # -----------------------------------------------------
    # 4. Connect to database
    # -----------------------------------------------------

    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        # -------------------------------------------------
        # 5. Count matching customers
        # -------------------------------------------------

        total = conn.execute(
            f"""
            SELECT COUNT(*)
            FROM customer_directory_summary
            {where_clause}
            """,
            query_params,
        ).fetchone()[0]

        # -------------------------------------------------
        # 6. Fetch requested page
        # -------------------------------------------------

        rows = conn.execute(
            f"""
            SELECT
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

            FROM customer_directory_summary

            {where_clause}

            ORDER BY
                {sort_column} {direction},
                customer_unique_id ASC

            LIMIT ? OFFSET ?
            """,
            (*query_params, limit, offset),
        ).fetchall()

        # -------------------------------------------------
        # 7. Format API response
        # -------------------------------------------------

        items = []

        for row in rows:
            item = dict(row)

            zip_prefix = item["customer_zip_code_prefix"]

            item["customer_zip_code_prefix"] = (
                str(zip_prefix).zfill(5)
                if zip_prefix is not None
                else None
            )

            item["lifetime_spend"] = round(
                float(item["lifetime_spend"] or 0),
                2,
            )

            item["average_order_value"] = round(
                float(item["average_order_value"] or 0),
                2,
            )

            items.append(item)

        total_pages = (
            (total + limit - 1) // limit
            if total
            else 0
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    finally:
        conn.close()
