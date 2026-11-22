
import pytest


BASE_URL = "/api/v1/customers"


def test_get_customer_profile(client):
    response = client.get(f"{BASE_URL}/u1")

    assert response.status_code == 200

    data = response.json()

    assert data["customer_unique_id"] == "u1"
    assert data["record_count"] == 2

    records = data["customer_records"]

    assert len(records) == 2
    assert records[0]["customer_id"] == "c1"
    assert records[0]["customer_zip_code_prefix"] == "01234"
    assert records[1]["customer_id"] == "c2"


def test_get_unknown_customer_profile(client):
    response = client.get(f"{BASE_URL}/unknown")

    assert response.status_code == 404


def test_get_customer_orders_with_pagination(client):
    response = client.get(
        f"{BASE_URL}/u1/orders",
        params={"page": 1, "limit": 2},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["customer_unique_id"] == "u1"
    assert data["total_orders"] == 3
    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["total_pages"] == 2

    assert len(data["orders"]) == 2
    assert data["orders"][0]["order_id"] == "order3"
    assert data["orders"][1]["order_id"] == "order2"


def test_get_customer_orders_second_page(client):
    response = client.get(
        f"{BASE_URL}/u1/orders",
        params={"page": 2, "limit": 2},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_orders"] == 3
    assert len(data["orders"]) == 1
    assert data["orders"][0]["order_id"] == "order1"


def test_customer_without_orders(client):
    response = client.get(f"{BASE_URL}/u2/orders")

    assert response.status_code == 200

    data = response.json()

    assert data["total_orders"] == 0
    assert data["total_pages"] == 0
    assert data["orders"] == []


def test_unknown_customer_order_history(client):
    response = client.get(f"{BASE_URL}/unknown/orders")

    assert response.status_code == 404


def test_invalid_pagination(client):
    invalid_page = client.get(
        f"{BASE_URL}/u1/orders",
        params={"page": 0},
    )

    invalid_limit = client.get(
        f"{BASE_URL}/u1/orders",
        params={"limit": 101},
    )

    assert invalid_page.status_code == 422
    assert invalid_limit.status_code == 422


def test_customer_summary(client):
    response = client.get(f"{BASE_URL}/u1/summary")

    assert response.status_code == 200

    data = response.json()

    assert data["total_orders"] == 3
    assert data["lifetime_spend"] == 250.0
    assert data["average_order_value"] == 83.33

    assert data["first_purchase"] == "2018-01-10 10:00:00"
    assert data["last_purchase"] == "2018-03-20 15:00:00"


def test_customer_summary_without_orders(client):
    response = client.get(f"{BASE_URL}/u2/summary")

    assert response.status_code == 200

    data = response.json()

    assert data["total_orders"] == 0
    assert data["lifetime_spend"] == 0.0
    assert data["average_order_value"] == 0.0
    assert data["first_purchase"] is None
    assert data["last_purchase"] is None


def test_customer_payment_breakdown(client):
    response = client.get(f"{BASE_URL}/u1/payments")

    assert response.status_code == 200

    data = response.json()

    assert data["customer_unique_id"] == "u1"
    assert data["total_payment_value"] == 250.0

    methods = {
        item["payment_type"]: item
        for item in data["payment_methods"]
    }

    assert methods["credit_card"]["payment_count"] == 2
    assert methods["credit_card"]["total_amount"] == 180.0
    assert methods["credit_card"]["percentage"] == 72.0

    assert methods["voucher"]["payment_count"] == 1
    assert methods["voucher"]["total_amount"] == 20.0
    assert methods["voucher"]["percentage"] == 8.0

    assert methods["boleto"]["payment_count"] == 1
    assert methods["boleto"]["total_amount"] == 50.0
    assert methods["boleto"]["percentage"] == 20.0


def test_customer_without_payments(client):
    response = client.get(f"{BASE_URL}/u2/payments")

    assert response.status_code == 200

    data = response.json()

    assert data["total_payment_value"] == 0.0
    assert data["payment_methods"] == []


def test_unknown_customer_payments(client):
    response = client.get(f"{BASE_URL}/unknown/payments")

    assert response.status_code == 404



def test_unknown_customer_summary(client):
    response = client.get(f"{BASE_URL}/unknown/summary")

    assert response.status_code == 404
    assert response.json()["detail"] == "Customer 'unknown' not found"
