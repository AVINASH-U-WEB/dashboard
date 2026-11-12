from __future__ import annotations

import bisect
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional


class OrderMemoryStore:
    """In-memory store for fast order filtering using hash index + binary search."""

    def __init__(self, orders: list[dict]) -> None:
        self._orders: list[dict] = orders
        # id -> order dict
        self._id_index: Dict[str, dict] = {o["order_id"]: o for o in orders}
        # status -> list of orders (hash index, O(1) lookup)
        self._status_index: defaultdict[str, list[dict]] = defaultdict(list)
        for o in orders:
            self._status_index[o.get("order_status", "")].append(o)

        # sorted list of (timestamp_str, order) for bisect
        # We sort by order_purchase_timestamp (ISO string sorts correctly)
        def _ts(o: dict) -> str:
            return o.get("order_purchase_timestamp") or ""

        self._sorted_orders: list[dict] = sorted(orders, key=_ts)
        self._sorted_ts: list[str] = [_ts(o) for o in self._sorted_orders]

    # ------------------------------------------------------------------
    # Filtering
    # ------------------------------------------------------------------

    def filter(
        self,
        status: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        is_anomaly: Optional[int] = None,
        is_late: Optional[int] = None,
    ) -> list[dict]:
        # 1. Status hash lookup
        if status:
            candidates: list[dict] = list(self._status_index.get(status, []))
        else:
            candidates = list(self._sorted_orders)

        # 2. Date range via bisect on the sorted list (only when no status filter
        #    so we can use the already-sorted list; otherwise filter inline)
        if from_date or to_date:
            if status:
                # Filter inline on sub-list
                lo = from_date or ""
                hi = to_date or "\xff"
                candidates = [
                    o for o in candidates
                    if lo <= (o.get("order_purchase_timestamp") or "") <= hi
                ]
            else:
                # Use bisect on the globally sorted list
                lo = from_date or ""
                hi = to_date or "\xff"
                left = bisect.bisect_left(self._sorted_ts, lo)
                right = bisect.bisect_right(self._sorted_ts, hi)
                candidates = list(self._sorted_orders[left:right])

        # 3. Anomaly / late filters
        if is_anomaly is not None:
            candidates = [o for o in candidates if o.get("is_anomaly") == is_anomaly]
        if is_late is not None:
            candidates = [o for o in candidates if o.get("is_late") == is_late]

        return candidates

    # ------------------------------------------------------------------
    # Single lookup
    # ------------------------------------------------------------------

    def get_by_id(self, order_id: str) -> Optional[dict]:
        return self._id_index.get(order_id)

    # ------------------------------------------------------------------
    # Aggregate properties
    # ------------------------------------------------------------------

    @property
    def total(self) -> int:
        return len(self._orders)

    @property
    def by_status_counts(self) -> Dict[str, int]:
        return {k: len(v) for k, v in self._status_index.items()}

    @property
    def anomaly_count(self) -> int:
        return sum(1 for o in self._orders if o.get("is_anomaly") == 1)

    @property
    def late_count(self) -> int:
        return sum(1 for o in self._orders if o.get("is_late") == 1)
