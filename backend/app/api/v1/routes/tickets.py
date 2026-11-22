
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut

from app.services.ticket_service import (
    create_ticket,
    get_tickets,
    get_ticket_by_id,
    update_ticket,
)


router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)


@router.post(
    "",
    response_model=TicketOut,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket_endpoint(ticket: TicketCreate):
    """
    Create a new ticket for an existing order.
    """

    result = create_ticket(ticket.model_dump())

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{ticket.order_id}' not found",
        )

    return result


@router.get(
    "",
    response_model=list[TicketOut],
)
def list_tickets(
    order_id: str | None = Query(default=None, min_length=1),
):
    """
    Retrieve all tickets or filter tickets by order ID.
    """

    return get_tickets(order_id)


@router.get(
    "/{ticket_id}",
    response_model=TicketOut,
)
def retrieve_ticket(ticket_id: int):
    """
    Retrieve a specific ticket using its ticket ID.
    """

    result = get_ticket_by_id(ticket_id)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found",
        )

    return result


@router.patch(
    "/{ticket_id}",
    response_model=TicketOut,
)
def edit_ticket(ticket_id: int, ticket: TicketUpdate):
    """
    Update selected fields of an existing ticket.
    """

    # Include only fields supplied in the request.
    updates = ticket.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided for an update",
        )

    result = update_ticket(ticket_id, updates)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found",
        )

    return result
