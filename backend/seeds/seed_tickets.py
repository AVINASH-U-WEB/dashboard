
"""
Seed the tickets table with sample ticket records.

Run from the backend directory:
    python -m seeds.seed_tickets
"""

from database import get_db_connection


def seed_tickets():
    connection = get_db_connection()

    try:
        # Fetch 10 valid order IDs from the existing Olist orders table
        orders = connection.execute(
            """
            SELECT order_id
            FROM orders
            ORDER BY order_id
            LIMIT 10
            """
        ).fetchall()

        if len(orders) < 10:
            print("At least 10 existing orders are required.")
            return

        # Prepare sample ticket records
        sample_tickets = [
            {
                "order_id": orders[0]["order_id"],
                "priority": "High",
                "category": "Delivery",
                "status": "Open",
                "notes": "Customer reported that the order has not arrived yet."
            },
            {
                "order_id": orders[1]["order_id"],
                "priority": "Medium",
                "category": "Refund",
                "status": "In Progress",
                "notes": "Customer requested a refund due to delayed delivery."
            },
            {
                "order_id": orders[2]["order_id"],
                "priority": "Low",
                "category": "Product",
                "status": "Resolved",
                "notes": "Customer reported damage to the product packaging."
            },
            {
                "order_id": orders[3]["order_id"],
                "priority": "High",
                "category": "Payment",
                "status": "Open",
                "notes": "Payment was deducted but order confirmation was not received."
            },
            {
                "order_id": orders[4]["order_id"],
                "priority": "Medium",
                "category": "Order Cancellation",
                "status": "In Progress",
                "notes": "Customer requested cancellation of the order."
            },
            {
                "order_id": orders[5]["order_id"],
                "priority": "Low",
                "category": "Product",
                "status": "Open",
                "notes": "Customer requested additional product information."
            },
            {
                "order_id": orders[6]["order_id"],
                "priority": "High",
                "category": "Delivery",
                "status": "In Progress",
                "notes": "Customer reported missing items in the delivered order."
            },
            {
                "order_id": orders[7]["order_id"],
                "priority": "Medium",
                "category": "Refund",
                "status": "Open",
                "notes": "Customer is waiting for an update about a refund."
            },
            {
                "order_id": orders[8]["order_id"],
                "priority": "Low",
                "category": "General Inquiry",
                "status": "Resolved",
                "notes": "Customer contacted support to clarify order details."
            },
            {
                "order_id": orders[9]["order_id"],
                "priority": "High",
                "category": "Payment",
                "status": "In Progress",
                "notes": "Customer reported an issue with the payment transaction."
            }
        ]

        # Insert sample tickets into the database
        connection.executemany(
            """
            INSERT INTO tickets
                (order_id, priority, category, status, notes)
            VALUES
                (:order_id, :priority, :category, :status, :notes)
            """,
            sample_tickets
        )

        connection.commit()

        print(f"Successfully inserted {len(sample_tickets)} sample tickets.")

        # Display all tickets currently in the database
        rows = connection.execute(
            """
            SELECT *
            FROM tickets
            ORDER BY ticket_id
            """
        ).fetchall()

        print(f"\nTotal tickets in database: {len(rows)}")

        for row in rows:
            print(dict(row))

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    seed_tickets()
