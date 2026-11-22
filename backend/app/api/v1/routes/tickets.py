
import sqlite3

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.ticket import TicketCreate, TicketOut,TicketUpdate
from database import get_db_connection


router = APIRouter(prefix="/tickets", tags=["tickets"])


# --------------------------------------------------
# POST: Create a ticket
# --------------------------------------------------

@router.post(
    "",
    response_model=TicketOut,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(ticket: TicketCreate):
    connection = get_db_connection()

    try:
        # Check whether the supplied order exists
        order = connection.execute(
            "SELECT order_id FROM orders WHERE order_id = ?",
            (ticket.order_id,),
        ).fetchone()

        if order is None:
            raise HTTPException(
                status_code=404,
                detail=f"Order '{ticket.order_id}' not found",
            )

        # Insert the ticket into the database
        cursor = connection.execute(
            """
            INSERT INTO tickets (order_id, priority, category, notes)
            VALUES (?, ?, ?, ?)
            """,
            (
                ticket.order_id,
                ticket.priority,
                ticket.category,
                ticket.notes,
            ),
        )

        connection.commit()

        # Retrieve the newly created ticket
        created_ticket = connection.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (cursor.lastrowid,),
        ).fetchone()

        return dict(created_ticket)

    except sqlite3.IntegrityError as exc:
        connection.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not create ticket because of a database constraint.",
        ) from exc

    finally:
        connection.close()


# --------------------------------------------------
# GET: Retrieve all tickets
# --------------------------------------------------

@router.get("", response_model=list[TicketOut])
def get_tickets(
    order_id: str | None = Query(default=None, min_length=1),
):
    connection = get_db_connection()

    try:
        if order_id:
            rows = connection.execute(
                """
                SELECT * FROM tickets
                WHERE order_id = ?
                ORDER BY created_at DESC, ticket_id DESC
                """,
                (order_id,),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT * FROM tickets
                ORDER BY created_at DESC, ticket_id DESC
                """
            ).fetchall()

        return [dict(row) for row in rows]

    finally:
        connection.close()


# --------------------------------------------------
# GET: Retrieve one ticket by ID
# --------------------------------------------------

@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int):
    connection = get_db_connection()

    try:
        row = connection.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail=f"Ticket with ID {ticket_id} not found",
            )

        return dict(row)

    finally:
        connection.close()



@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(ticket_id: int, ticket: TicketUpdate):

    connection = get_db_connection()

    try:
        # Check whether the ticket exists
        existing_ticket = connection.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        if existing_ticket is None:
            raise HTTPException(
                status_code=404,
                detail=f"Ticket with ID {ticket_id} not found",
            )

        # Get only the fields supplied by the frontend
        update_data = ticket.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update",
            )

        # Build the update using only permitted column names
        fields = list(update_data.keys())

        set_clause = ", ".join(
            f"{field} = ?" for field in fields
        )

        values = list(update_data.values())
        values.append(ticket_id)

        connection.execute(
            f"UPDATE tickets SET {set_clause} WHERE ticket_id = ?",
            values,
        )

        connection.commit()

        # Return the updated ticket
        updated_ticket = connection.execute(
            "SELECT * FROM tickets WHERE ticket_id = ?",
            (ticket_id,),
        ).fetchone()

        return dict(updated_ticket)

    finally:
        connection.close()

