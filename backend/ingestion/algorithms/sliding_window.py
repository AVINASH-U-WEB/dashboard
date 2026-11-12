"""
sliding_window.py
-----------------
Computes a per-seller late-delivery rate using a sliding window of the last
30 orders (sorted by order_purchase_timestamp).

Algorithm
---------
For each seller_id:
  1. Sort orders by order_purchase_timestamp ascending.
  2. For every row i, compute the mean of is_late over the window
     [max(0, i-29) .. i]  (i.e. up to the last 30 orders including row i).
  3. Store the result in the new column `seller_late_rate`.

The window shrinks naturally at the beginning of each seller's history
(min_periods=1 ensures we always get a value).
"""

from __future__ import annotations

import pandas as pd


def compute_seller_late_rate(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add ``seller_late_rate`` column to *df* using a 30-order sliding window
    per seller.

    Parameters
    ----------
    df : pd.DataFrame
        Flat orders DataFrame produced by ``transformers.build_flat_orders``.
        Must contain columns: ``seller_id``, ``order_purchase_timestamp``,
        ``is_late``.

    Returns
    -------
    pd.DataFrame
        Same DataFrame with an additional ``seller_late_rate`` column
        (float, 0.0–1.0).  Row order is restored to the original index.
    """
    required = {"seller_id", "order_purchase_timestamp", "is_late"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"[sliding_window] Missing columns: {missing}")

    df = df.copy()

    # Sort globally by seller then timestamp so the rolling window is correct
    sort_idx = df.sort_values(
        ["seller_id", "order_purchase_timestamp"],
        na_position="last",
    ).index

    df_sorted = df.loc[sort_idx].copy()

    # Rolling mean within each seller group, window = 30, min 1 observation
    df_sorted["seller_late_rate"] = (
        df_sorted
        .groupby("seller_id", sort=False)["is_late"]
        .transform(lambda s: s.rolling(window=30, min_periods=1).mean())
    )

    # Restore original row order
    df_out = df_sorted.sort_index()

    # Sanity: fill sellers with no seller_id (NaN) with global mean
    global_mean = df_out["is_late"].mean()
    df_out["seller_late_rate"] = df_out["seller_late_rate"].fillna(global_mean)

    print(
        f"[sliding_window] seller_late_rate computed for "
        f"{df_out['seller_id'].nunique():,} sellers."
    )
    return df_out
