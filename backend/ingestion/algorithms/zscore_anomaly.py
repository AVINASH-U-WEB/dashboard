"""
zscore_anomaly.py
-----------------
Flags delivery anomalies using per-category z-score analysis on
`delivery_lag_days`.

Algorithm
---------
For each product_category_name group:
  1. Compute mean (μ) and standard deviation (σ) of delivery_lag_days
     (NaN rows are excluded from statistics but kept in output as NaN).
  2. z = (delivery_lag_days - μ) / σ
  3. is_anomaly = 1 if |z| > 2 else 0.

Rows with NaN delivery_lag_days or unknown category receive NaN z-score
and is_anomaly = 0.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def flag_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add ``zscore_in_category`` and ``is_anomaly`` columns to *df*.

    Parameters
    ----------
    df : pd.DataFrame
        Flat orders DataFrame (output of sliding_window or transformers).
        Must contain: ``product_category_name``, ``delivery_lag_days``.

    Returns
    -------
    pd.DataFrame
        Input DataFrame with two new columns:
        - ``zscore_in_category`` (float): z-score within the product category.
        - ``is_anomaly`` (int, 0/1): 1 when |z| > 2.
    """
    required = {"product_category_name", "delivery_lag_days"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"[zscore_anomaly] Missing columns: {missing}")

    df = df.copy()

    def _zscore(series: pd.Series) -> pd.Series:
        """Return z-scores for a series; returns NaN when std == 0."""
        mean = series.mean()
        std  = series.std(ddof=0)          # population std for stability
        if std == 0 or np.isnan(std):
            return pd.Series(np.nan, index=series.index)
        return (series - mean) / std

    # Compute z-score per category (NaN lag_days propagate as NaN z-score)
    df["zscore_in_category"] = (
        df.groupby("product_category_name", sort=False)["delivery_lag_days"]
        .transform(_zscore)
    )

    # Flag anomaly: |z| > 2; rows with NaN z-score get 0
    df["is_anomaly"] = (
        df["zscore_in_category"].abs().gt(2).astype(int)
    )
    # Rows where z-score is NaN are not anomalies
    df.loc[df["zscore_in_category"].isna(), "is_anomaly"] = 0

    n_anomalies = int(df["is_anomaly"].sum())
    total       = len(df)
    pct         = 100.0 * n_anomalies / total if total else 0.0
    print(
        f"[zscore_anomaly] Anomalies flagged: {n_anomalies:,} / {total:,} "
        f"({pct:.2f}%)"
    )
    return df
