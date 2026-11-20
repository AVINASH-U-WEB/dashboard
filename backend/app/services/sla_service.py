from datetime import date, datetime

from app.core.memory_store import OrderMemoryStore


# ---------------------------------------------------------------------------
# Reusable Helper Functions
# ---------------------------------------------------------------------------

def paginate_data(data: list, page: int, limit: int) -> dict:
    """
    Apply pagination to a list of records.
    """

    total = len(data)

    start = (page - 1) * limit
    paginated_data = data[start:start + limit]

    total_pages = (total + limit - 1) // limit

    return {
        "data": paginated_data,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "count": len(paginated_data),
        },
    }


def calculate_sla_metrics(
    delivered: int,
    late: int,
    on_time: int,
    late_delays: list,
) -> dict:
    """
    Calculate common SLA metrics.
    """

    late_delivery_rate = (
        round((late / delivered) * 100, 2)
        if delivered
        else 0.0
    )

    on_time_delivery_rate = (
        round((on_time / delivered) * 100, 2)
        if delivered
        else 0.0
    )

    average_late_delay_days = (
        round(sum(late_delays) / len(late_delays), 2)
        if late_delays
        else 0.0
    )

    return {
        "late_delivery_rate": late_delivery_rate,
        "on_time_delivery_rate": on_time_delivery_rate,
        "average_late_delay_days": average_late_delay_days,
    }


def parse_iso_datetime(value) -> datetime | None:
    """
    Safely parse an ISO formatted date or datetime.

    Returns None if the value is missing or invalid.
    """

    if not value:
        return None

    try:
        return datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        )

    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# SLA Summary
# ---------------------------------------------------------------------------

def get_sla_summary(store: OrderMemoryStore) -> dict:
    """
    Calculate delivery SLA metrics from the existing order store.
    """

    orders = store.filter()

    delivered_orders = [
        order
        for order in orders
        if order.get("order_status") == "delivered"
    ]

    late_orders = [
        order
        for order in delivered_orders
        if order.get("is_late") == 1
    ]

    on_time_orders = [
        order
        for order in delivered_orders
        if order.get("is_late") == 0
    ]

    delivered_count = len(delivered_orders)
    late_count = len(late_orders)
    on_time_count = len(on_time_orders)

    on_time_delivery_rate = (
        round((on_time_count / delivered_count) * 100, 2)
        if delivered_count
        else 0.0
    )

    late_delivery_rate = (
        round((late_count / delivered_count) * 100, 2)
        if delivered_count
        else 0.0
    )

    late_delays = [
        float(order.get("delivery_lag_days") or 0)
        for order in late_orders
        if order.get("delivery_lag_days") is not None
    ]

    average_late_delay_days = (
        round(sum(late_delays) / len(late_delays), 2)
        if late_delays
        else 0.0
    )

    return {
        "total_orders": len(orders),
        "delivered_orders": delivered_count,
        "late_deliveries": late_count,
        "on_time_deliveries": on_time_count,
        "on_time_delivery_rate": on_time_delivery_rate,
        "late_delivery_rate": late_delivery_rate,
        "average_late_delay_days": average_late_delay_days,
    }


# ---------------------------------------------------------------------------
# Late Deliveries
# ---------------------------------------------------------------------------

def get_late_deliveries(
    store: OrderMemoryStore,
    page: int = 1,
    limit: int = 25,
) -> dict:
    """
    Retrieve delivered orders that were late,
    sorted by largest delivery delay first.
    """

    orders = store.filter(
        status="delivered",
        is_late=1,
    )

    # Largest delivery delay first.
    # Order ID provides deterministic ordering for ties.
    orders.sort(
        key=lambda order: (
            float(order.get("delivery_lag_days") or 0),
            order.get("order_id", ""),
        ),
        reverse=True,
    )

    return paginate_data(
        data=orders,
        page=page,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# Delay Distribution
# ---------------------------------------------------------------------------

def get_delay_distribution(store: OrderMemoryStore) -> dict:
    """
    Categorize late delivered orders based on delivery delay.
    """

    late_orders = store.filter(
        status="delivered",
        is_late=1,
    )

    buckets = [
        {"label": "0–3 days", "count": 0},
        {"label": ">3–7 days", "count": 0},
        {"label": ">7–14 days", "count": 0},
        {"label": ">14–30 days", "count": 0},
        {"label": ">30 days", "count": 0},
    ]

    for order in late_orders:
        delay = float(order.get("delivery_lag_days") or 0)

        if delay <= 3:
            buckets[0]["count"] += 1

        elif delay <= 7:
            buckets[1]["count"] += 1

        elif delay <= 14:
            buckets[2]["count"] += 1

        elif delay <= 30:
            buckets[3]["count"] += 1

        else:
            buckets[4]["count"] += 1

    total_late = len(late_orders)

    for bucket in buckets:
        bucket["percentage"] = (
            round((bucket["count"] / total_late) * 100, 2)
            if total_late
            else 0.0
        )

    return {
        "total_late_orders": total_late,
        "distribution": buckets,
    }


# ---------------------------------------------------------------------------
# Monthly Delivery Trends
# ---------------------------------------------------------------------------

def get_monthly_delivery_trends(store: OrderMemoryStore) -> dict:
    """
    Calculate monthly delivery performance trends
    using the actual customer delivery date.
    """

    orders = store.filter(status="delivered")

    monthly_data = {}

    for order in orders:
        delivered_date = order.get(
            "order_delivered_customer_date"
        )

        delivered_datetime = parse_iso_datetime(delivered_date)

        if delivered_datetime is None:
            continue

        month = delivered_datetime.strftime("%Y-%m")

        if month not in monthly_data:
            monthly_data[month] = {
                "delivered_orders": 0,
                "late_deliveries": 0,
                "on_time_deliveries": 0,
            }

        monthly_data[month]["delivered_orders"] += 1

        if order.get("is_late") == 1:
            monthly_data[month]["late_deliveries"] += 1

        else:
            monthly_data[month]["on_time_deliveries"] += 1

    monthly_trends = []

    for month, metrics in sorted(monthly_data.items()):
        delivered = metrics["delivered_orders"]
        late = metrics["late_deliveries"]
        on_time = metrics["on_time_deliveries"]

        monthly_trends.append({
            "month": month,
            "delivered_orders": delivered,
            "late_deliveries": late,
            "on_time_deliveries": on_time,

            "on_time_delivery_rate": (
                round((on_time / delivered) * 100, 2)
                if delivered
                else 0.0
            ),

            "late_delivery_rate": (
                round((late / delivered) * 100, 2)
                if delivered
                else 0.0
            ),
        })

    return {
        "total_delivered_orders": len(orders),
        "monthly_trends": monthly_trends,
    }


# ---------------------------------------------------------------------------
# Overdue Shipments
# ---------------------------------------------------------------------------

def get_overdue_shipments(
    store: OrderMemoryStore,
    as_of_date: date,
    page: int = 1,
    limit: int = 25,
) -> dict:
    """
    Find shipped orders whose estimated delivery date
    has passed as of the selected reference date.
    """

    shipped_orders = store.filter(status="shipped")

    overdue_orders = []

    for order in shipped_orders:
        estimated_date = order.get(
            "order_estimated_delivery_date"
        )

        estimated_datetime = parse_iso_datetime(estimated_date)

        if estimated_datetime is None:
            continue

        estimated_date_only = estimated_datetime.date()

        if estimated_date_only < as_of_date:
            order_copy = order.copy()

            order_copy["days_overdue"] = (
                as_of_date - estimated_date_only
            ).days

            overdue_orders.append(order_copy)

    # Most overdue shipments first.
    # Order ID provides deterministic ordering for ties.
    overdue_orders.sort(
        key=lambda order: (
            order["days_overdue"],
            order.get("order_id", ""),
        ),
        reverse=True,
    )

    pagination = paginate_data(
        data=overdue_orders,
        page=page,
        limit=limit,
    )

    return {
        "reference_date": as_of_date.isoformat(),
        "total_overdue_shipments": pagination["meta"]["total"],
        **pagination,
    }


# ---------------------------------------------------------------------------
# Regional SLA Performance
# ---------------------------------------------------------------------------

def get_regional_sla_performance(store: OrderMemoryStore) -> dict:
    """
    Calculate delivery SLA performance grouped by customer state.
    """

    delivered_orders = store.filter(status="delivered")

    regional_data = {}

    for order in delivered_orders:
        state = order.get("customer_state") or "Unknown"

        if state not in regional_data:
            regional_data[state] = {
                "delivered_orders": 0,
                "late_deliveries": 0,
                "on_time_deliveries": 0,
                "late_delays": [],
            }

        metrics = regional_data[state]

        metrics["delivered_orders"] += 1

        if order.get("is_late") == 1:
            metrics["late_deliveries"] += 1

            delay = order.get("delivery_lag_days")

            if delay is not None:
                metrics["late_delays"].append(
                    float(delay)
                )

        else:
            metrics["on_time_deliveries"] += 1

    regions = []

    for state, metrics in regional_data.items():
        delivered = metrics["delivered_orders"]
        late = metrics["late_deliveries"]
        on_time = metrics["on_time_deliveries"]
        late_delays = metrics["late_delays"]

        sla_metrics = calculate_sla_metrics(
            delivered=delivered,
            late=late,
            on_time=on_time,
            late_delays=late_delays,
        )

        regions.append({
            "customer_state": state,
            "delivered_orders": delivered,
            "late_deliveries": late,
            "on_time_deliveries": on_time,
            **sla_metrics,
        })

    # Alphabetical ordering first.
    regions.sort(
        key=lambda region: region["customer_state"]
    )

    # Then worst late-delivery rate first.
    # Stable sorting preserves alphabetical order for ties.
    regions.sort(
        key=lambda region: (
            region["late_delivery_rate"],
            region["late_deliveries"],
        ),
        reverse=True,
    )

    return {
        "total_delivered_orders": len(delivered_orders),
        "regions": regions,
    }


# ---------------------------------------------------------------------------
# Seller SLA Performance
# ---------------------------------------------------------------------------

def get_seller_sla_performance(
    store: OrderMemoryStore,
    min_orders: int = 10,
    page: int = 1,
    limit: int = 25,
) -> dict:
    """
    Calculate delivery SLA performance grouped by seller.

    Only include sellers with at least min_orders
    delivered orders.
    """

    delivered_orders = store.filter(status="delivered")

    seller_data = {}

    for order in delivered_orders:
        seller_id = order.get("seller_id")

        if not seller_id:
            continue

        if seller_id not in seller_data:
            seller_data[seller_id] = {
                "seller_id": seller_id,
                "seller_state": order.get("seller_state"),
                "delivered_orders": 0,
                "late_deliveries": 0,
                "on_time_deliveries": 0,
                "late_delays": [],
            }

        metrics = seller_data[seller_id]

        metrics["delivered_orders"] += 1

        if order.get("is_late") == 1:
            metrics["late_deliveries"] += 1

            delay = order.get("delivery_lag_days")

            if delay is not None:
                metrics["late_delays"].append(
                    float(delay)
                )

        else:
            metrics["on_time_deliveries"] += 1

    sellers = []

    for seller in seller_data.values():
        delivered = seller["delivered_orders"]

        # Ignore sellers with too few delivered orders.
        if delivered < min_orders:
            continue

        late = seller["late_deliveries"]
        on_time = seller["on_time_deliveries"]
        late_delays = seller["late_delays"]

        sla_metrics = calculate_sla_metrics(
            delivered=delivered,
            late=late,
            on_time=on_time,
            late_delays=late_delays,
        )

        sellers.append({
            "seller_id": seller["seller_id"],
            "seller_state": seller["seller_state"],
            "delivered_orders": delivered,
            "late_deliveries": late,
            "on_time_deliveries": on_time,
            **sla_metrics,
        })

    # Alphabetical ordering first.
    sellers.sort(
        key=lambda seller: seller["seller_id"]
    )

    # Worst late-delivery performance first.
    # Stable sorting preserves alphabetical order for ties.
    sellers.sort(
        key=lambda seller: (
            seller["late_delivery_rate"],
            seller["late_deliveries"],
        ),
        reverse=True,
    )

    pagination = paginate_data(
        data=sellers,
        page=page,
        limit=limit,
    )

    return {
        "total_sellers": len(sellers),
        "min_orders": min_orders,
        **pagination,
    }


# ---------------------------------------------------------------------------
# Anomaly Analysis
# ---------------------------------------------------------------------------

def get_anomaly_analysis(
    store: OrderMemoryStore,
    page: int = 1,
    limit: int = 25,
) -> dict:
    """
    Analyze anomalous delivered orders using the existing
    is_anomaly and zscore_in_category fields.
    """

    delivered_orders = store.filter(status="delivered")

    anomalous_orders = [
        order
        for order in delivered_orders
        if order.get("is_anomaly") == 1
    ]

    late_anomalies = [
        order
        for order in anomalous_orders
        if order.get("is_late") == 1
    ]

    # Sort by absolute anomaly score, highest first.
    anomalous_orders.sort(
        key=lambda order: (
            abs(
                float(order.get("zscore_in_category") or 0)
            ),
            order.get("order_id", ""),
        ),
        reverse=True,
    )

    total_delivered = len(delivered_orders)
    total_anomalies = len(anomalous_orders)

    anomaly_rate = (
        round((total_anomalies / total_delivered) * 100, 2)
        if total_delivered
        else 0.0
    )

    pagination = paginate_data(
        data=anomalous_orders,
        page=page,
        limit=limit,
    )

    return {
        "total_delivered_orders": total_delivered,
        "total_anomalous_orders": total_anomalies,
        "late_anomalous_orders": len(late_anomalies),
        "anomaly_rate": anomaly_rate,
        **pagination,
    }