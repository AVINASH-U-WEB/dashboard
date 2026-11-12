from __future__ import annotations

"""TF-IDF search index over order review comments."""

from typing import Optional

import numpy as np


class SearchIndex:
    """Builds a TF-IDF matrix over review comments and answers cosine-similarity queries."""

    def __init__(self, orders: list[dict]) -> None:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity as _cos_sim

        self._cos_sim = _cos_sim
        self._orders = orders

        # Keep only orders that have a non-empty review
        self._indexed_orders: list[dict] = [
            o for o in orders
            if o.get("review_comment_message") and str(o["review_comment_message"]).strip()
        ]

        if not self._indexed_orders:
            self._vectorizer = None
            self._matrix = None
            return

        self._vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
        )
        corpus = [str(o["review_comment_message"]) for o in self._indexed_orders]
        self._matrix = self._vectorizer.fit_transform(corpus)

    # ------------------------------------------------------------------

    def search(self, query: str, top_k: int = 20) -> list[dict]:
        """Return top_k orders ranked by cosine similarity to *query*.

        Returns list of {"order_id": str, "score": float}.
        """
        if self._vectorizer is None or self._matrix is None or not query.strip():
            return []

        q_vec = self._vectorizer.transform([query])
        sims = self._cos_sim(q_vec, self._matrix).flatten()

        # argsort descending
        top_indices = np.argsort(sims)[::-1][:top_k]

        results: list[dict] = []
        for idx in top_indices:
            score = float(sims[idx])
            if score <= 0.0:
                break
            o = self._indexed_orders[idx]
            results.append({"order_id": o["order_id"], "score": score})

        return results
