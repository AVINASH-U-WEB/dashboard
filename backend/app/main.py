from __future__ import annotations

"""FastAPI application entry point."""

import sqlite3
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.lru_filter import set_store
from app.core.memory_store import OrderMemoryStore
from app.core.search_index import SearchIndex
import app.api.v1.routes.orders as orders_module

# ---------------------------------------------------------------------------
# Module-level singletons
# ---------------------------------------------------------------------------

store: OrderMemoryStore | None = None
search_index: SearchIndex | None = None


# ---------------------------------------------------------------------------
# Startup / shutdown
# ---------------------------------------------------------------------------

def _load_orders_from_sqlite(db_path: str) -> list[dict]:
    """Read all rows from the orders table and return as list of dicts."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute("SELECT * FROM orders")
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load store and search index on startup."""
    global store, search_index

    print(f"[startup] Loading orders from {settings.db_path} …")
    try:
        orders = _load_orders_from_sqlite(settings.db_path)
    except Exception as exc:
        print(f"[startup] WARNING: could not load DB ({exc}). Starting with empty store.")
        orders = []

    print(f"[startup] Loaded {len(orders)} orders. Building memory store …")
    store = OrderMemoryStore(orders)
    set_store(store)

    # Inject singletons into the router module
    orders_module._store = store

    print("[startup] Building TF-IDF search index …")
    search_index = SearchIndex(orders)
    orders_module._search_index = search_index

    print("[startup] Ready.")
    yield
    # shutdown — nothing to clean up
    print("[shutdown] Bye.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Olist Order Explorer API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api.v1.routes.orders import router as orders_router  # noqa: E402

app.include_router(orders_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", tags=["health"])
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "orders_loaded": store.total if store else 0,
    }
