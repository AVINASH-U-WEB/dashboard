
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TicketCreate(BaseModel):
    """
    Schema for creating a new ticket.
    """

    model_config = ConfigDict(extra="forbid")

    order_id: str = Field(min_length=1)
    priority: str = Field(min_length=1, max_length=30)
    category: str = Field(min_length=1, max_length=100)
    notes: str = Field(min_length=1, max_length=2000)

    @field_validator("order_id", "priority", "category", "notes")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty")

        return value


class TicketUpdate(BaseModel):
    """
    Schema for updating an existing ticket.

    All fields are optional because PATCH allows
    updating only selected fields.
    """

    model_config = ConfigDict(extra="forbid")

    priority: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    notes: str | None = Field(
        default=None,
        min_length=1,
        max_length=2000,
    )

    @field_validator("priority", "category", "status", "notes")
    @classmethod
    def strip_whitespace(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("This field cannot be null")

        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty")

        return value


class TicketOut(BaseModel):
    """
    Schema for returning ticket information through the API.
    """

    ticket_id: int
    order_id: str
    priority: str
    category: str
    status: str
    notes: str
    created_at: str
