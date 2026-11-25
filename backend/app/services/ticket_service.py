
import sqlite3
from typing import Any

from app.config import settings


def create_ticket(ticket: dict[str, Any]) -> dict[str, Any] | None:
    """
    Create a new ticket for an existing order.

    Returns the created ticket as a dictionary.
    Returns None if the order does not exist.
    """

    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        # Check whether the supplied order ID exists.
        order = conn.execute(
            "SELECT order_id FROM orders WHERE order_id = ?",
            (ticket["order_id"],),
        ).fetchone()

        if order is None:
            return None

        # Insert the new ticket.
        # The database automatically assigns ticket_id and created_at.
        # The status column uses its database default: Open.
        cursor = conn.execute(
            """
            INSERT INTO tickets (order_id, priority, category, notes)
            VALUES (?, ?, ?, ?)
            """,
            (
                ticket["order_id"],
                ticket["priority"],
                ticket["category"],
                ticket["notes"],
            ),
        )

        conn.commit()

        # Retrieve the newly created ticket.
        row = conn.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (cursor.lastrowid,),
        ).fetchone()

        return dict(row) if row else None

    finally:
        conn.close()


def get_tickets(order_id: str | None = None) -> list[dict[str, Any]]:
    """
    Retrieve all tickets.

    If order_id is provided, retrieve only tickets
    associated with that order.
    """

    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        if order_id:
            rows = conn.execute(
                """
                SELECT *
                FROM tickets
                WHERE order_id = ?
                ORDER BY created_at DESC
                """,
                (order_id,),
            ).fetchall()

        else:
            rows = conn.execute(
                """
                SELECT *
                FROM tickets
                ORDER BY created_at DESC
                """
            ).fetchall()

        return [dict(row) for row in rows]

    finally:
        conn.close()


def get_ticket_by_id(ticket_id: int) -> dict[str, Any] | None:
    """
    Retrieve one ticket using its ticket ID.

    Returns None if the ticket does not exist.
    """

    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        row = conn.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        return dict(row) if row else None

    finally:
        conn.close()


def update_ticket(
    ticket_id: int,
    updates: dict[str, Any],
) -> dict[str, Any] | None:
    """
    Update an existing ticket.

    Only priority, category, status, and notes can be updated.
    Returns None if the ticket does not exist.
    """

    allowed_fields = {"priority", "category", "status", "notes"}

    # Keep only fields that are allowed to be updated.
    updates = {
        key: value
        for key, value in updates.items()
        if key in allowed_fields
    }

    if not updates:
        return None

    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row

    try:
        # Check whether the ticket exists.
        existing_ticket = conn.execute(
            "SELECT ticket_id FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        if existing_ticket is None:
            return None

        # Build the UPDATE statement using allowed column names.
        # Values are passed separately as SQL parameters.
        set_clause = ", ".join(
            f"{column} = ?" for column in updates
        )

        values = list(updates.values())
        values.append(ticket_id)

        conn.execute(
            f"""
            UPDATE tickets
            SET {set_clause}
            WHERE ticket_id = ?
            """,
            values,
        )

        conn.commit()

        # Return the updated ticket.
        row = conn.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        return dict(row) if row else None

    finally:
        conn.close()
