from __future__ import annotations

"""LRU-cached wrapper around OrderMemoryStore.filter().

Because lru_cache requires hashable arguments and a hashable return
value, we:
  - Accept only primitive / None arguments (already hashable).
  - Return a tuple of frozensets … actually a tuple of plain dicts is NOT
    hashable, so we convert each dict to a tuple of sorted items (frozenset
    of key-value pairs would work but tuples preserve order).

Callers should convert the returned tuple back to list[dict] as needed.
"""

import functools
from typing import Optional

from app.core.memory_store import OrderMemoryStore

# Module-level store reference — set by main.py after startup.
_store: Optional[OrderMemoryStore] = None


def set_store(store: OrderMemoryStore) -> None:
    """Inject the store and clear the cache when the store changes."""
    global _store
    _store = store
    cached_filter.cache_clear()


@functools.lru_cache(maxsize=256)
def cached_filter(
    status: Optional[str],
    from_date: Optional[str],
    to_date: Optional[str],
    is_anomaly: Optional[int],
    is_late: Optional[int],
) -> tuple[tuple, ...]:
    """Cached filter — returns tuple of tuples (each inner tuple = sorted dict items)."""
    if _store is None:
        return ()
    results = _store.filter(
        status=status,
        from_date=from_date,
        to_date=to_date,
        is_anomaly=is_anomaly,
        is_late=is_late,
    )
    # Convert each dict to a hashable tuple of (key, value) pairs sorted by key
    return tuple(tuple(sorted(o.items())) for o in results)


def dict_from_items(items: tuple) -> dict:
    """Reconstruct a dict from sorted (key, value) pairs."""
    return dict(items)
