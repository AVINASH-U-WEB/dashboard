
import sqlite3

from app.config import settings


def get_db_connection():
    connection = sqlite3.connect(settings.db_path)

    # Enable foreign-key enforcement for this connection
    connection.execute("PRAGMA foreign_keys = ON")

    # Return database rows as dictionary-like objects
    connection.row_factory = sqlite3.Row

    return connection
