"""Centralized SQLite connection management for the backend."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Generator

from app.config import settings


@contextmanager
def get_db_connection(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    """Yield a configured SQLite connection with row factory and foreign keys enabled."""
    conn = sqlite3.connect(db_path or settings.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI dependency yielding a managed SQLite database connection."""
    with get_db_connection() as conn:
        yield conn
