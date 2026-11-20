from fastapi import APIRouter, Depends, Query
from datetime import date

from app.core.memory_store import OrderMemoryStore
from app.api.v1.routes.orders import get_store
from app.services.sla_service import (
    get_sla_summary,
    get_late_deliveries,
    get_delay_distribution,
    get_monthly_delivery_trends,
    get_overdue_shipments,
    get_regional_sla_performance,
    get_seller_sla_performance,
    get_anomaly_analysis,
)


router = APIRouter(
    prefix="/sla",
    tags=["SLA & Escalation"],
)


@router.get("/summary")
def sla_summary(
    store: OrderMemoryStore = Depends(get_store),
):
    return get_sla_summary(store)

@router.get("/late-deliveries")
def late_deliveries(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    store: OrderMemoryStore = Depends(get_store),
):
    return get_late_deliveries(
        store=store,
        page=page,
        limit=limit,
    )

@router.get("/delay-distribution")
def delay_distribution(
    store: OrderMemoryStore = Depends(get_store),
):
    return get_delay_distribution(store)

@router.get("/monthly-trends")
def monthly_delivery_trends(
    store: OrderMemoryStore = Depends(get_store),
):
    return get_monthly_delivery_trends(store)

@router.get("/overdue-shipments")
def overdue_shipments(
    as_of_date: date,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    store: OrderMemoryStore = Depends(get_store),
):
    return get_overdue_shipments(
        store=store,
        as_of_date=as_of_date,
        page=page,
        limit=limit,
    )

@router.get("/regional-performance")
def regional_sla_performance(
    store: OrderMemoryStore = Depends(get_store),
):
    return get_regional_sla_performance(store)

@router.get("/seller-performance")
def seller_sla_performance(
    min_orders: int = Query(10, ge=1),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    store: OrderMemoryStore = Depends(get_store),
):
    return get_seller_sla_performance(
        store=store,
        min_orders=min_orders,
        page=page,
        limit=limit,
    )

@router.get("/anomaly-analysis")
def anomaly_analysis(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    store: OrderMemoryStore = Depends(get_store),
):
    return get_anomaly_analysis(
        store=store,
        page=page,
        limit=limit,
    )