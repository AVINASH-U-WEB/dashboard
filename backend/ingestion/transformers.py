"""
transformers.py
---------------
Joins all Olist DataFrames into one flat 'orders' DataFrame ready for the
dashboard and anomaly algorithms.

Output columns
--------------
order_id, customer_id, order_status,
order_purchase_timestamp, order_approved_at,
order_delivered_carrier_date, order_delivered_customer_date,
order_estimated_delivery_date,
customer_city, customer_state,
seller_id, seller_state,
product_category_name,          # English translation
product_id, price, freight_value,
review_score, review_comment_message,
delivery_lag_days,              # float: delivered - estimated (negative = early)
is_late                         # int: 1 if delivery_lag_days > 0, else 0
"""

from __future__ import annotations

from typing import Dict

import numpy as np
import pandas as pd


def build_flat_orders(frames: Dict[str, pd.DataFrame]) -> pd.DataFrame:
    """
    Join the raw Olist DataFrames into a single flat DataFrame.

    Parameters
    ----------
    frames : dict[str, pd.DataFrame]
        Output of ``loaders.load_all``.

    Returns
    -------
    pd.DataFrame
        Flat, denormalised orders table.
    """
    # ------------------------------------------------------------------ #
    #  Unpack raw frames                                                   #
    # ------------------------------------------------------------------ #
    orders       = frames["orders"].copy()
    customers    = frames["customers"].copy()
    order_items  = frames["order_items"].copy()
    order_payments = frames["order_payments"].copy()
    order_reviews  = frames["order_reviews"].copy()
    products     = frames["products"].copy()
    sellers      = frames["sellers"].copy()
    category_tr  = frames["category_translation"].copy()

    # ------------------------------------------------------------------ #
    #  Ensure datetime dtypes on orders                                    #
    # ------------------------------------------------------------------ #
    ts_cols = [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ]
    for col in ts_cols:
        if col in orders.columns and not pd.api.types.is_datetime64_any_dtype(orders[col]):
            orders[col] = pd.to_datetime(orders[col], errors="coerce")

    # ------------------------------------------------------------------ #
    #  Flatten order_items → one representative row per order              #
    #  (pick first item; aggregation happens in the API layer)             #
    # ------------------------------------------------------------------ #
    # Keep only the first item per order to avoid row explosion
    items_first = (
        order_items
        .sort_values(["order_id", "order_item_id"])
        .drop_duplicates(subset=["order_id"], keep="first")
        [["order_id", "product_id", "seller_id", "price", "freight_value"]]
    )

    # ------------------------------------------------------------------ #
    #  Flatten reviews → one per order (pick highest score if multiple)    #
    # ------------------------------------------------------------------ #
    reviews_flat = (
        order_reviews
        .sort_values(["order_id", "review_score"], ascending=[True, False])
        .drop_duplicates(subset=["order_id"], keep="first")
        [["order_id", "review_score", "review_comment_message"]]
    )

    # ------------------------------------------------------------------ #
    #  Translate product categories to English                             #
    # ------------------------------------------------------------------ #
    products_en = products.merge(
        category_tr[["product_category_name", "product_category_name_english"]],
        on="product_category_name",
        how="left",
    )
    products_en["product_category_name"] = products_en["product_category_name_english"].fillna(products_en["product_category_name"])
    products_en = products_en[["product_id", "product_category_name"]]

    # ------------------------------------------------------------------ #
    #  Seller state lookup                                                 #
    # ------------------------------------------------------------------ #
    sellers_state = sellers[["seller_id", "seller_state"]].drop_duplicates("seller_id")

    # ------------------------------------------------------------------ #
    #  Customer city / state lookup                                        #
    # ------------------------------------------------------------------ #
    customers_loc = customers[
        ["customer_id", "customer_city", "customer_state"]
    ].drop_duplicates("customer_id")

    # ------------------------------------------------------------------ #
    #  Build flat DataFrame via sequential left joins                      #
    # ------------------------------------------------------------------ #
    df = (
        orders
        .merge(customers_loc,  on="customer_id",  how="left")
        .merge(items_first,    on="order_id",      how="left")
        .merge(sellers_state,  on="seller_id",     how="left")
        .merge(products_en,    on="product_id",    how="left")
        .merge(reviews_flat,   on="order_id",      how="left")
    )

    # ------------------------------------------------------------------ #
    #  Derived columns                                                     #
    # ------------------------------------------------------------------ #
    # delivery_lag_days: positive → late, negative → early
    df["delivery_lag_days"] = (
        (df["order_delivered_customer_date"] - df["order_estimated_delivery_date"])
        .dt.total_seconds()
        .div(86_400)       # seconds → days
    )

    df["is_late"] = (df["delivery_lag_days"] > 0).astype(int)

    # ------------------------------------------------------------------ #
    #  Select & order final columns                                        #
    # ------------------------------------------------------------------ #
    final_cols = [
        "order_id",
        "customer_id",
        "order_status",
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
        "customer_city",
        "customer_state",
        "seller_id",
        "seller_state",
        "product_category_name",
        "product_id",
        "price",
        "freight_value",
        "review_score",
        "review_comment_message",
        "delivery_lag_days",
        "is_late",
    ]

    # Keep only columns that exist (guards against schema drift)
    existing = [c for c in final_cols if c in df.columns]
    df = df[existing].reset_index(drop=True)

    print(
        f"[transformers] Flat orders built: {len(df):,} rows, "
        f"{len(df.columns)} cols"
    )
    return df
