
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class TicketCreate(BaseModel):
    """Fields required when creating a ticket."""

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


class TicketOut(BaseModel):
    """Structure returned by the ticket API."""

    ticket_id: int
    order_id: str
    priority: str
    category: str
    status: str
    notes: str
    created_at: str


from pydantic import BaseModel, Field, field_validator

class TicketUpdate(BaseModel):
    """Fields that can be updated on an existing ticket."""

    priority: str | None = Field(default=None, min_length=1, max_length=30)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    status: str | None = Field(default=None, min_length=1, max_length=30)
    notes: str | None = Field(default=None, min_length=1, max_length=2000)

    @field_validator("priority", "category", "status", "notes")
    @classmethod
    def strip_whitespace(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty")

        return value
