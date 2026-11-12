from __future__ import annotations

"""Domain types for orders."""

from enum import Enum
from typing import Optional
from dataclasses import dataclass


class OrderStatus(str, Enum):
    created = "created"
    approved = "approved"
    invoiced = "invoiced"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    unavailable = "unavailable"


@dataclass
class Order:
    order_id: str
    customer_id: str
    order_status: str
    order_purchase_timestamp: Optional[str]
    order_approved_at: Optional[str]
    order_delivered_carrier_date: Optional[str]
    order_delivered_customer_date: Optional[str]
    order_estimated_delivery_date: Optional[str]
    customer_city: Optional[str]
    customer_state: Optional[str]
    seller_id: Optional[str]
    seller_state: Optional[str]
    product_category_name: Optional[str]
    product_id: Optional[str]
    price: Optional[float]
    freight_value: Optional[float]
    review_score: Optional[float]
    review_comment_message: Optional[str]
    seller_late_rate: Optional[float]
    delivery_lag_days: Optional[float]
    zscore_in_category: Optional[float]
    is_anomaly: Optional[int]
    is_late: Optional[int]
