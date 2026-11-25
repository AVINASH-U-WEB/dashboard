from app.services.sla_service import (
     paginate_data,
    calculate_sla_metrics,
    parse_iso_datetime,
    get_delay_distribution,
    get_sla_summary,
    get_late_deliveries,
    get_overdue_shipments,
)
from datetime import date


def test_pagination_first_page():
    data = [
        {"id": 1},
        {"id": 2},
        {"id": 3},
        {"id": 4},
        {"id": 5},
    ]

    result = paginate_data(data, page=1, limit=2)

    assert result["data"] == [{"id": 1}, {"id": 2}]
    assert result["meta"]["total"] == 5
    assert result["meta"]["page"] == 1
    assert result["meta"]["limit"] == 2
    assert result["meta"]["total_pages"] == 3
    assert result["meta"]["count"] == 2


def test_pagination_second_page():
    data = [
        {"id": 1},
        {"id": 2},
        {"id": 3},
        {"id": 4},
        {"id": 5},
    ]

    result = paginate_data(data, page=2, limit=2)

    assert result["data"] == [{"id": 3}, {"id": 4}]
    assert result["meta"]["page"] == 2
    assert result["meta"]["count"] == 2


def test_pagination_last_page():
    data = [
        {"id": 1},
        {"id": 2},
        {"id": 3},
        {"id": 4},
        {"id": 5},
    ]

    result = paginate_data(data, page=3, limit=2)

    assert result["data"] == [{"id": 5}]
    assert result["meta"]["count"] == 1
    assert result["meta"]["total_pages"] == 3


def test_pagination_empty_page():
    data = [
        {"id": 1},
        {"id": 2},
        {"id": 3},
    ]

    result = paginate_data(data, page=10, limit=2)

    assert result["data"] == []
    assert result["meta"]["total"] == 3
    assert result["meta"]["page"] == 10
    assert result["meta"]["count"] == 0


def test_pagination_empty_data():
    data = []

    result = paginate_data(data, page=1, limit=10)

    assert result["data"] == []
    assert result["meta"]["total"] == 0
    assert result["meta"]["count"] == 0
    assert result["meta"]["total_pages"] == 0

from app.services.sla_service import calculate_sla_metrics


def test_calculate_sla_metrics_normal_case():
    result = calculate_sla_metrics(
        delivered=100,
        late=20,
        on_time=80,
        late_delays=[2, 4, 6],
    )

    assert result["late_delivery_rate"] == 20.0
    assert result["on_time_delivery_rate"] == 80.0
    assert result["average_late_delay_days"] == 4.0


def test_calculate_sla_metrics_all_on_time():
    result = calculate_sla_metrics(
        delivered=50,
        late=0,
        on_time=50,
        late_delays=[],
    )

    assert result["late_delivery_rate"] == 0.0
    assert result["on_time_delivery_rate"] == 100.0
    assert result["average_late_delay_days"] == 0.0


def test_calculate_sla_metrics_no_delivered_orders():
    result = calculate_sla_metrics(
        delivered=0,
        late=0,
        on_time=0,
        late_delays=[],
    )

    assert result["late_delivery_rate"] == 0.0
    assert result["on_time_delivery_rate"] == 0.0
    assert result["average_late_delay_days"] == 0.0


def test_calculate_sla_metrics_average_delay_rounding():
    result = calculate_sla_metrics(
        delivered=3,
        late=3,
        on_time=0,
        late_delays=[1, 2, 2],
    )

    assert result["late_delivery_rate"] == 100.0
    assert result["on_time_delivery_rate"] == 0.0
    assert result["average_late_delay_days"] == 1.67

from app.services.sla_service import parse_iso_datetime


def test_parse_valid_iso_datetime():
    result = parse_iso_datetime("2018-09-30T12:30:00")

    assert result is not None
    assert result.year == 2018
    assert result.month == 9
    assert result.day == 30
    assert result.hour == 12
    assert result.minute == 30


def test_parse_datetime_with_timezone():
    result = parse_iso_datetime("2018-09-30T12:30:00+05:30")

    assert result is not None
    assert result.tzinfo is not None
    assert result.utcoffset().total_seconds() == 19800


def test_parse_datetime_with_z_timezone():
    result = parse_iso_datetime("2018-09-30T12:30:00Z")

    assert result is not None
    assert result.tzinfo is not None
    assert result.utcoffset().total_seconds() == 0


def test_parse_invalid_datetime():
    result = parse_iso_datetime("invalid-date")

    assert result is None


def test_parse_none_value():
    result = parse_iso_datetime(None)

    assert result is None


def test_parse_empty_string():
    result = parse_iso_datetime("")

    assert result is None

from app.services.sla_service import get_delay_distribution


class FakeOrderStore:
    def __init__(self, orders):
        self.orders = orders

    def filter(self, **kwargs):
        filtered_orders = self.orders

        for key, value in kwargs.items():
            filtered_orders = [
                order
                for order in filtered_orders
                if order.get(key) == value
            ]

        return filtered_orders


def test_delay_distribution_bucket_boundaries():
    orders = [
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 2},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 3},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 3.1},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 7},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 7.1},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 14},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 14.1},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 30},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 30.1},
    ]

    store = FakeOrderStore(orders)

    result = get_delay_distribution(store)

    assert result["total_late_orders"] == 9

    counts = [
        bucket["count"]
        for bucket in result["distribution"]
    ]

    assert counts == [2, 2, 2, 2, 1]


def test_delay_distribution_percentages():
    orders = [
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 1},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 2},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 4},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 8},
        {"status": "delivered", "is_late": 1, "delivery_lag_days": 20},
    ]

    store = FakeOrderStore(orders)

    result = get_delay_distribution(store)

    percentages = [
        bucket["percentage"]
        for bucket in result["distribution"]
    ]

    assert percentages == [40.0, 20.0, 20.0, 20.0, 0.0]

def test_delay_distribution_empty_data():
    store = FakeOrderStore([])

    result = get_delay_distribution(store)

    assert result["total_late_orders"] == 0

    for bucket in result["distribution"]:
        assert bucket["count"] == 0
        assert bucket["percentage"] == 0.0

from app.services.sla_service import get_sla_summary


def test_sla_summary_normal_case():
    orders = [
        {"order_status": "delivered", "is_late": 1, "delivery_lag_days": 4},
        {"order_status": "delivered", "is_late": 1, "delivery_lag_days": 8},
        {"order_status": "delivered", "is_late": 1, "delivery_lag_days": None},
        {"order_status": "delivered", "is_late": 0, "delivery_lag_days": 0},
        {"order_status": "delivered", "is_late": 0, "delivery_lag_days": 0},
        {"order_status": "shipped", "is_late": None, "delivery_lag_days": None},
        {"order_status": "canceled", "is_late": None, "delivery_lag_days": None},
    ]

    store = FakeOrderStore(orders)

    result = get_sla_summary(store)

    assert result["total_orders"] == 7
    assert result["delivered_orders"] == 5
    assert result["late_deliveries"] == 3
    assert result["on_time_deliveries"] == 2

    assert result["late_delivery_rate"] == 60.0
    assert result["on_time_delivery_rate"] == 40.0

    # Only delays 4 and 8 are included.
    # The late order with a missing delay is excluded from average calculation.
    assert result["average_late_delay_days"] == 6.0


def test_sla_summary_empty_dataset():
    store = FakeOrderStore([])

    result = get_sla_summary(store)

    assert result["total_orders"] == 0
    assert result["delivered_orders"] == 0
    assert result["late_deliveries"] == 0
    assert result["on_time_deliveries"] == 0
    assert result["late_delivery_rate"] == 0.0
    assert result["on_time_delivery_rate"] == 0.0
    assert result["average_late_delay_days"] == 0.0


def test_sla_summary_no_delivered_orders():
    orders = [
        {"order_status": "shipped", "is_late": None, "delivery_lag_days": None},
        {"order_status": "canceled", "is_late": None, "delivery_lag_days": None},
        {"order_status": "processing", "is_late": None, "delivery_lag_days": None},
    ]

    store = FakeOrderStore(orders)

    result = get_sla_summary(store)

    assert result["total_orders"] == 3
    assert result["delivered_orders"] == 0
    assert result["late_deliveries"] == 0
    assert result["on_time_deliveries"] == 0
    assert result["late_delivery_rate"] == 0.0
    assert result["on_time_delivery_rate"] == 0.0
    assert result["average_late_delay_days"] == 0.0

from app.services.sla_service import get_late_deliveries

def test_get_late_deliveries_filters_and_sorts():
    orders = [
        {
            "order_id": "A",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 5,
        },
        {
            "order_id": "B",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 15,
        },
        {
            "order_id": "C",
            "status": "delivered",
            "is_late": 0,
            "delivery_lag_days": 0,
        },
        {
            "order_id": "D",
            "status": "shipped",
            "is_late": 1,
            "delivery_lag_days": 20,
        },
        {
            "order_id": "E",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 10,
        },
    ]

    store = FakeOrderStore(orders)

    result = get_late_deliveries(store, page=1, limit=10)

    returned_ids = [
        order["order_id"]
        for order in result["data"]
    ]

    assert returned_ids == ["B", "E", "A"]
    assert result["meta"]["total"] == 3


def test_get_late_deliveries_pagination():
    orders = [
        {
            "order_id": f"ORDER{i}",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": i,
        }
        for i in range(1, 6)
    ]

    store = FakeOrderStore(orders)

    page_1 = get_late_deliveries(store, page=1, limit=2)
    page_2 = get_late_deliveries(store, page=2, limit=2)

    page_1_ids = [
        order["order_id"]
        for order in page_1["data"]
    ]

    page_2_ids = [
        order["order_id"]
        for order in page_2["data"]
    ]

    assert page_1_ids == ["ORDER5", "ORDER4"]
    assert page_2_ids == ["ORDER3", "ORDER2"]

    assert page_1["meta"]["total"] == 5
    assert page_2["meta"]["total"] == 5


def test_get_late_deliveries_empty_result():
    store = FakeOrderStore([])

    result = get_late_deliveries(store, page=1, limit=10)

    assert result["data"] == []
    assert result["meta"]["total"] == 0
    assert result["meta"]["count"] == 0


def test_get_late_deliveries_tie_breaker():
    orders = [
        {
            "order_id": "A",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 10,
        },
        {
            "order_id": "C",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 10,
        },
        {
            "order_id": "B",
            "status": "delivered",
            "is_late": 1,
            "delivery_lag_days": 10,
        },
    ]

    store = FakeOrderStore(orders)

    result = get_late_deliveries(store, page=1, limit=10)

    returned_ids = [
        order["order_id"]
        for order in result["data"]
    ]

    # Sorting uses reverse=True for both delay and order_id.
    assert returned_ids == ["C", "B", "A"]

def test_get_overdue_shipments_identifies_overdue_orders():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-05T00:00:00",
        },
        {
            "order_id": "order_2",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-12T00:00:00",
        },
        {
            "order_id": "order_3",
            "status": "delivered",
            "order_estimated_delivery_date": "2024-01-01T00:00:00",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
    )

    assert result["total_overdue_shipments"] == 1
    assert result["data"][0]["order_id"] == "order_1"


def test_get_overdue_shipments_calculates_days_overdue():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-05T00:00:00",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
    )

    assert result["data"][0]["days_overdue"] == 5


def test_get_overdue_shipments_excludes_estimated_date_today():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-10T00:00:00",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
    )

    assert result["total_overdue_shipments"] == 0
    assert result["data"] == []


def test_get_overdue_shipments_skips_invalid_dates():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "invalid-date",
        },
        {
            "order_id": "order_2",
            "status": "shipped",
            "order_estimated_delivery_date": None,
        },
        {
            "order_id": "order_3",
            "status": "shipped",
            "order_estimated_delivery_date": "",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
    )

    assert result["total_overdue_shipments"] == 0
    assert result["data"] == []


def test_get_overdue_shipments_pagination():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-01T00:00:00",
        },
        {
            "order_id": "order_2",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-02T00:00:00",
        },
        {
            "order_id": "order_3",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-03T00:00:00",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
        page=2,
        limit=1,
    )

    assert result["meta"]["total"] == 3
    assert result["meta"]["page"] == 2
    assert result["meta"]["limit"] == 1
    assert len(result["data"]) == 1


def test_get_overdue_shipments_most_overdue_first():
    orders = [
        {
            "order_id": "order_1",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-08T00:00:00",
        },
        {
            "order_id": "order_2",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-01T00:00:00",
        },
        {
            "order_id": "order_3",
            "status": "shipped",
            "order_estimated_delivery_date": "2024-01-05T00:00:00",
        },
    ]

    store = FakeOrderStore(orders)

    result = get_overdue_shipments(
        store,
        as_of_date=date(2024, 1, 10),
    )

    order_ids = [
        order["order_id"]
        for order in result["data"]
    ]

    assert order_ids == ["order_2", "order_3", "order_1"]
