from fastapi import APIRouter, HTTPException, Query

from app.schemas.customer import (
    CustomerProfileOut,
    CustomerOrdersResponse,
    CustomerSummaryOut,
    CustomerPaymentsResponse,
)
from app.services.customer_service import (
    get_customer_profile,
    get_customer_orders,
    get_customer_summary,
    get_customer_payments,
)

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
)


@router.get(
    "/{customer_unique_id}",
    response_model=CustomerProfileOut,
)
def get_customer(
    customer_unique_id: str,
) -> CustomerProfileOut:

    customer = get_customer_profile(customer_unique_id)

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_unique_id}' not found",
        )

    return CustomerProfileOut(**customer)


@router.get(
    "/{customer_unique_id}/orders",
    response_model=CustomerOrdersResponse,
)
def get_customer_order_history(
    customer_unique_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> CustomerOrdersResponse:

    result = get_customer_orders(
        customer_unique_id=customer_unique_id,
        page=page,
        limit=limit,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_unique_id}' not found",
        )

    return CustomerOrdersResponse(**result)


@router.get(
    "/{customer_unique_id}/summary",
    response_model=CustomerSummaryOut,
)
def get_customer_summary_endpoint(
    customer_unique_id: str,
) -> CustomerSummaryOut:

    result = get_customer_summary(customer_unique_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_unique_id}' not found",
        )

    return CustomerSummaryOut(**result)


@router.get(
    "/{customer_unique_id}/payments",
    response_model=CustomerPaymentsResponse,
)
def get_customer_payment_breakdown(
    customer_unique_id: str,
) -> CustomerPaymentsResponse:

    result = get_customer_payments(customer_unique_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_unique_id}' not found",
        )

    return CustomerPaymentsResponse(**result)