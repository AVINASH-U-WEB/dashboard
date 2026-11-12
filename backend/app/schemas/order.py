from __future__ import annotations

"""Pydantic v2 response schemas."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------------
# OrderOut
# ---------------------------------------------------------------------------

class OrderOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    order_id: str
    customer_id: str
    order_status: str
    order_purchase_timestamp: Optional[str] = None
    order_approved_at: Optional[str] = None
    order_delivered_carrier_date: Optional[str] = None
    order_delivered_customer_date: Optional[str] = None
    order_estimated_delivery_date: Optional[str] = None
    customer_city: Optional[str] = None
    customer_state: Optional[str] = None
    seller_id: Optional[str] = None
    seller_state: Optional[str] = None
    product_category_name: Optional[str] = None
    product_id: Optional[str] = None
    price: Optional[float] = None
    freight_value: Optional[float] = None
    review_score: Optional[float] = None
    review_comment_message: Optional[str] = None
    seller_late_rate: Optional[float] = None
    delivery_lag_days: Optional[float] = None
    zscore_in_category: Optional[float] = None
    is_anomaly: Optional[int] = None
    is_late: Optional[int] = None


# ---------------------------------------------------------------------------
# OrdersResponse
# ---------------------------------------------------------------------------

class PaginationMeta(BaseModel):
    count: int
    total: int = 0
    page: int = 1
    total_pages: int = 1
    limit: int = 25
    next_cursor: Optional[str] = None
    has_more: bool = False


class OrdersResponse(BaseModel):
    data: List[OrderOut]
    meta: PaginationMeta


# ---------------------------------------------------------------------------
# StatsResponse
# ---------------------------------------------------------------------------

class StatsResponse(BaseModel):
    total: int
    by_status: Dict[str, int]
    anomalies: int
    late_deliveries: int
    anomaly_pct: float
    late_pct: float


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

class SearchResult(BaseModel):
    order_id: str
    similarity_score: float
    order_status: Optional[str] = None
    review_comment_message: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
