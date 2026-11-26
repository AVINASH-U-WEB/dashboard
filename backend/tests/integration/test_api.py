
"""
test_api.py
-----------
Automated integration tests for the Olist Backend API.

Tests health, statistics, pagination, anomaly filtering,
TF-IDF search, and individual order retrieval.
"""

import time

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    """
    Create one TestClient for this test module.

    The context manager triggers FastAPI lifespan startup
    and shutdown. The database and in-memory order store
    are initialized during startup.
    """
    with TestClient(app) as test_client:
        yield test_client


def test_health(client):
    print("[1/6] Testing /health ...")

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data.get("status") == "ok"
    assert data.get("orders_loaded", 0) > 90000

    print(f"PASS (Loaded {data.get('orders_loaded'):,} orders)")


def test_stats(client):
    print("[2/6] Testing /api/v1/orders/stats ...")

    start = time.time()

    response = client.get("/api/v1/orders/stats")

    elapsed = (time.time() - start) * 1000

    assert response.status_code == 200

    data = response.json()

    assert data.get("total", 0) > 90000
    assert "by_status" in data
    assert "anomalies" in data

    print(
        f"PASS ({elapsed:.1f}ms - "
        f"Total: {data['total']:,}, "
        f"Anomalies: {data['anomalies']:,})"
    )


def test_orders_pagination(client):
    print("[3/6] Testing /api/v1/orders (Pagination) ...")

    response = client.get(
        "/api/v1/orders",
        params={"page": 1, "limit": 25},
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body.get("data", [])) == 25

    meta = body.get("meta", {})

    assert meta.get("page") == 1
    assert meta.get("total_pages", 0) > 3000

    print(
        f"PASS (Retrieved 25 orders, "
        f"Total Pages: {meta.get('total_pages'):,})"
    )


def test_filter_anomalies(client):
    print("[4/6] Testing anomaly filtering ...")

    response = client.get(
        "/api/v1/orders",
        params={"is_anomaly": 1, "limit": 10},
    )

    assert response.status_code == 200

    data = response.json().get("data", [])

    for order in data:
        assert order.get("is_anomaly") == 1

    print(f"PASS (Verified {len(data)} anomaly records)")


def test_search(client):
    print("[5/6] Testing TF-IDF search ...")

    start = time.time()

    response = client.get(
        "/api/v1/orders/search",
        params={"q": "atrasou", "limit": 5},
    )

    elapsed = (time.time() - start) * 1000

    assert response.status_code == 200

    results = response.json().get("results", [])

    assert len(results) > 0

    print(
        f"PASS ({elapsed:.1f}ms - "
        f"Top score: {results[0]['similarity_score']:.3f})"
    )


def test_single_order(client):
    print("[6/6] Testing individual order retrieval ...")

    # First, retrieve one order ID.
    list_response = client.get(
        "/api/v1/orders",
        params={"limit": 1},
    )

    assert list_response.status_code == 200

    orders = list_response.json()["data"]

    assert len(orders) > 0

    order_id = orders[0]["order_id"]

    # Retrieve that individual order.
    response = client.get(f"/api/v1/orders/{order_id}")

    assert response.status_code == 200
    assert response.json().get("order_id") == order_id

    print(f"PASS (Order {order_id[:8]}... fetched)")