from pydantic import BaseModel, ConfigDict


class CustomerRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: str
    customer_zip_code_prefix: str | None = None
    customer_city: str | None = None
    customer_state: str | None = None


class CustomerProfileOut(BaseModel):
    customer_unique_id: str
    record_count: int
    customer_records: list[CustomerRecordOut]

class CustomerOrderOut(BaseModel):
    order_id: str
    order_status: str
    order_purchase_timestamp: str | None = None
    order_approved_at: str | None = None
    order_delivered_carrier_date: str | None = None
    order_delivered_customer_date: str | None = None
    order_estimated_delivery_date: str | None = None


class CustomerOrdersResponse(BaseModel):
    customer_unique_id: str
    total_orders: int
    page: int
    limit: int
    total_pages: int
    orders: list[CustomerOrderOut]

class CustomerSummaryOut(BaseModel):
    customer_unique_id: str
    total_orders: int
    lifetime_spend: float
    average_order_value: float
    first_purchase: str | None = None
    last_purchase: str | None = None
    customer_type: str
    last_order_status: str | None = None

class CustomerPaymentMethodOut(BaseModel):
    payment_type: str
    payment_count: int
    total_amount: float
    percentage: float


class CustomerPaymentsResponse(BaseModel):
    customer_unique_id: str
    total_payment_value: float
    payment_methods: list[CustomerPaymentMethodOut]


class CustomerDirectoryItemOut(BaseModel):
    customer_unique_id: str
    customer_city: str | None = None
    customer_state: str | None = None
    customer_zip_code_prefix: str | None = None

    record_count: int
    total_orders: int
    lifetime_spend: float
    average_order_value: float

    first_purchase: str | None = None
    last_purchase: str | None = None
    customer_type: str
    last_order_status: str | None = None


class CustomerDirectoryResponse(BaseModel):
    items: list[CustomerDirectoryItemOut]
    total: int
    page: int
    limit: int
    total_pages: int