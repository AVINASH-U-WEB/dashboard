"""
test_api.py
-----------
Comprehensive automated test suite for the Olist Backend API & In-Memory Engine.
Verifies all endpoints, response contracts, filtering, and performance.
"""

import sys
import time
import requests

BASE_URL = "http://localhost:8000"

def test_health():
    print("[1/6] Testing /health ...", end=" ")
    res = requests.get(f"{BASE_URL}/health", timeout=5)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data.get("status") == "ok", "Health status not ok"
    assert data.get("orders_loaded", 0) > 90000, f"Expected >90k orders, got {data.get('orders_loaded')}"
    print(f"PASS (Loaded {data.get('orders_loaded'):,} orders)")

def test_stats():
    print("[2/6] Testing /api/v1/orders/stats ...", end=" ")
    start = time.time()
    res = requests.get(f"{BASE_URL}/api/v1/orders/stats", timeout=5)
    elapsed = (time.time() - start) * 1000
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data.get("total", 0) > 90000, "Invalid total order count"
    assert "by_status" in data, "Missing by_status"
    assert "anomalies" in data, "Missing anomalies"
    print(f"PASS ({elapsed:.1f}ms - Total: {data['total']:,}, Anomalies: {data['anomalies']:,})")

def test_orders_pagination():
    print("[3/6] Testing /api/v1/orders (Pagination) ...", end=" ")
    res = requests.get(f"{BASE_URL}/api/v1/orders?page=1&limit=25", timeout=5)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    body = res.json()
    assert len(body.get("data", [])) == 25, "Expected exactly 25 items"
    meta = body.get("meta", {})
    assert meta.get("page") == 1, "Page should be 1"
    assert meta.get("total_pages", 0) > 3000, "Invalid total_pages"
    print(f"PASS (Retrieved 25 orders, Total Pages: {meta.get('total_pages'):,})")

def test_filter_anomalies():
    print("[4/6] Testing /api/v1/orders?is_anomaly=1 ...", end=" ")
    res = requests.get(f"{BASE_URL}/api/v1/orders?is_anomaly=1&limit=10", timeout=5)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json().get("data", [])
    for order in data:
        assert order.get("is_anomaly") == 1, "Expected all returned orders to be anomalies"
    print(f"PASS (Verified anomaly flag filtering on {len(data)} items)")

def test_search():
    print("[5/6] Testing /api/v1/orders/search (TF-IDF Engine) ...", end=" ")
    start = time.time()
    res = requests.get(f"{BASE_URL}/api/v1/orders/search?q=atrasou&limit=5", timeout=5)
    elapsed = (time.time() - start) * 1000
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    results = res.json().get("results", [])
    assert len(results) > 0, "Expected search results for common query 'atrasou'"
    print(f"PASS ({elapsed:.1f}ms - Top score: {results[0]['similarity_score']:.3f})")

def test_single_order():
    print("[6/6] Testing /api/v1/orders/{order_id} ...", end=" ")
    # Grab an ID from list
    res_list = requests.get(f"{BASE_URL}/api/v1/orders?limit=1", timeout=5)
    order_id = res_list.json()["data"][0]["order_id"]
    res = requests.get(f"{BASE_URL}/api/v1/orders/{order_id}", timeout=5)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json().get("order_id") == order_id, "Order ID mismatch"
    print(f"PASS (Order {order_id[:8]}... fetched)")

def run_all():
    print("=" * 60)
    print("🚀 OLIST API VERIFICATION & CONTRACT SUITE")
    print(f"Target: {BASE_URL}")
    print("=" * 60)
    try:
        test_health()
        test_stats()
        test_orders_pagination()
        test_filter_anomalies()
        test_search()
        test_single_order()
        print("=" * 60)
        print("✅ ALL TESTS PASSED SUCCESSFULLY! (0 Failures)")
        print("=" * 60)
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: FastAPI backend is not running!")
        print("Start it with: uvicorn app.main:app --port 8000")
        sys.exit(1)
    except AssertionError as err:
        print(f"\n❌ TEST FAILED: {err}")
        sys.exit(1)

if __name__ == "__main__":
    run_all()

