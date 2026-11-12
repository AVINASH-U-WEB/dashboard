from __future__ import annotations

"""Orders API router — /api/v1/orders"""

import base64
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.lru_filter import cached_filter, dict_from_items
from app.core.memory_store import OrderMemoryStore
from app.core.search_index import SearchIndex
from app.schemas.order import (
    OrderOut,
    OrdersResponse,
    PaginationMeta,
    SearchResponse,
    SearchResult,
    StatsResponse,
)

router = APIRouter(prefix="/orders", tags=["orders"])

# ---------------------------------------------------------------------------
# Dependencies — singletons injected from main.py
# ---------------------------------------------------------------------------

_store: Optional[OrderMemoryStore] = None
_search_index: Optional[SearchIndex] = None


def get_store() -> OrderMemoryStore:
    if _store is None:
        raise HTTPException(status_code=503, detail="Store not initialised")
    return _store


def get_search_index() -> SearchIndex:
    if _search_index is None:
        raise HTTPException(status_code=503, detail="Search index not initialised")
    return _search_index


# ---------------------------------------------------------------------------
# Cursor helpers
# ---------------------------------------------------------------------------

def _encode_cursor(ts: str, order_id: str) -> str:
    payload = json.dumps({"ts": ts, "id": order_id})
    return base64.urlsafe_b64encode(payload.encode()).decode()


def _decode_cursor(cursor: str) -> dict:
    try:
        payload = base64.urlsafe_b64decode(cursor.encode()).decode()
        return json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cursor token")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("", response_model=OrdersResponse)
def list_orders(
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    is_anomaly: Optional[int] = Query(None, ge=0, le=1),
    is_late: Optional[int] = Query(None, ge=0, le=1),
    page: int = Query(1, ge=1),
    cursor: Optional[str] = Query(None),
    limit: int = Query(25, ge=1, le=500),
    store: OrderMemoryStore = Depends(get_store),
) -> OrdersResponse:
    # Use LRU-cached filter (returns tuple of sorted-item tuples)
    raw = cached_filter(
        status=status,
        from_date=from_date,
        to_date=to_date,
        is_anomaly=is_anomaly,
        is_late=is_late,
    )
    orders: list[dict] = [dict_from_items(items) for items in raw]

    # Sort by purchase_timestamp then order_id for stable pagination
    orders.sort(key=lambda o: (o.get("order_purchase_timestamp") or "", o.get("order_id") or ""))

    total = len(orders)
    total_pages = max(1, (total + limit - 1) // limit)

    # If cursor is provided, use cursor-based slicing; otherwise use page number
    if cursor:
        cur = _decode_cursor(cursor)
        cur_ts = cur.get("ts", "")
        cur_id = cur.get("id", "")
        start_index = 0
        for i, o in enumerate(orders):
            ts = o.get("order_purchase_timestamp") or ""
            oid = o.get("order_id") or ""
            if (ts, oid) > (cur_ts, cur_id):
                start_index = i
                break
        else:
            start_index = len(orders)
        current_page = (start_index // limit) + 1
    else:
        current_page = min(page, total_pages)
        start_index = (current_page - 1) * limit

    page_items = orders[start_index: start_index + limit]
    has_more = (start_index + limit) < total
    next_cursor: Optional[str] = None
    if has_more and page_items:
        last = page_items[-1]
        next_cursor = _encode_cursor(
            last.get("order_purchase_timestamp") or "",
            last.get("order_id") or "",
        )

    return OrdersResponse(
        data=[OrderOut(**o) for o in page_items],
        meta=PaginationMeta(
            count=len(page_items),
            total=total,
            page=current_page,
            total_pages=total_pages,
            limit=limit,
            next_cursor=next_cursor,
            has_more=has_more,
        ),
    )


@router.get("/stats", response_model=StatsResponse)
def get_stats(store: OrderMemoryStore = Depends(get_store)) -> StatsResponse:
    total = store.total
    anomalies = store.anomaly_count
    late = store.late_count
    return StatsResponse(
        total=total,
        by_status=store.by_status_counts,
        anomalies=anomalies,
        late_deliveries=late,
        anomaly_pct=round(anomalies / total * 100, 2) if total else 0.0,
        late_pct=round(late / total * 100, 2) if total else 0.0,
    )


@router.get("/search", response_model=SearchResponse)
def search_orders(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    store: OrderMemoryStore = Depends(get_store),
    search_index: SearchIndex = Depends(get_search_index),
) -> SearchResponse:
    hits = search_index.search(q, top_k=limit)
    results: list[SearchResult] = []
    for hit in hits:
        order = store.get_by_id(hit["order_id"])
        if order:
            results.append(
                SearchResult(
                    order_id=hit["order_id"],
                    similarity_score=hit["score"],
                    order_status=order.get("order_status"),
                    review_comment_message=order.get("review_comment_message"),
                )
            )
    return SearchResponse(query=q, results=results)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: str,
    store: OrderMemoryStore = Depends(get_store),
) -> OrderOut:
    order = store.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return OrderOut(**order)
