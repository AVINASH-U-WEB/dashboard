"""
loaders.py
----------
Reads all 9 Olist CSV datasets from a configurable data directory.
Returns a dict mapping logical dataset names to pandas DataFrames.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict

import pandas as pd


# Map of logical name -> CSV filename
DATASETS: Dict[str, str] = {
    "orders":               "olist_orders_dataset.csv",
    "customers":            "olist_customers_dataset.csv",
    "order_items":          "olist_order_items_dataset.csv",
    "order_payments":       "olist_order_payments_dataset.csv",
    "order_reviews":        "olist_order_reviews_dataset.csv",
    "products":             "olist_products_dataset.csv",
    "sellers":              "olist_sellers_dataset.csv",
    "geolocation":          "olist_geolocation_dataset.csv",
    "category_translation": "product_category_name_translation.csv",
}

# Datetime columns to parse per dataset
DATETIME_COLS: Dict[str, list[str]] = {
    "orders": [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ],
}


def load_all(data_dir: str | os.PathLike = "data/") -> Dict[str, pd.DataFrame]:
    """
    Load every Olist CSV from *data_dir* and return a dict of DataFrames.

    Parameters
    ----------
    data_dir : str or Path
        Directory that contains the raw CSV files.

    Returns
    -------
    dict[str, pd.DataFrame]
        Keys are the logical dataset names defined in DATASETS.

    Raises
    ------
    FileNotFoundError
        If any expected CSV is missing from *data_dir*.
    """
    data_path = Path(data_dir).resolve()
    frames: Dict[str, pd.DataFrame] = {}

    for name, filename in DATASETS.items():
        file_path = data_path / filename
        if not file_path.exists():
            raise FileNotFoundError(
                f"[loaders] Expected dataset not found: {file_path}"
            )

        parse_dates = DATETIME_COLS.get(name, False)
        df = pd.read_csv(
            file_path,
            parse_dates=parse_dates if parse_dates else False,
            low_memory=False,
        )
        frames[name] = df
        print(f"[loaders] Loaded '{name}': {len(df):,} rows, {len(df.columns)} cols")

    return frames
