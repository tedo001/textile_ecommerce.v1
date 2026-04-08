"""Recommendation service.

Two strategies, picked automatically based on the request:

1. **User-based** (collaborative filtering): when we have a user_id we look up
   that user's row in the precomputed item-item similarity matrix and surface the
   k items most similar to what they've interacted with.

2. **Item-based** (content / co-occurrence): when only a product_id is given we
   surface items that historically co-occur with it.

If no model has been trained yet, the service falls back to a popularity-ranked
list so the front-end always gets *something* useful.
"""
from __future__ import annotations

from typing import List, Optional, Tuple

import numpy as np

from ..model_registry import registry


def _topk(scores: np.ndarray, k: int, exclude: Optional[set] = None) -> List[Tuple[int, float]]:
    if exclude:
        scores = scores.copy()
        for idx in exclude:
            scores[idx] = -np.inf
    if k >= len(scores):
        order = np.argsort(-scores)
    else:
        # argpartition for speed on large item sets
        idx = np.argpartition(-scores, k)[:k]
        order = idx[np.argsort(-scores[idx])]
    return [(int(i), float(scores[i])) for i in order if scores[i] > -np.inf]


def recommend(user_id: Optional[str], product_id: Optional[str], k: int = 8):
    payload = registry.get("recommender")

    # No model yet → return popularity fallback
    if not payload:
        pop = registry.get("popularity") or {}
        items = pop.get("items", [])[:k]
        return {
            "items": [{"product_id": pid, "score": float(score)} for pid, score in items],
            "strategy": "popularity-fallback",
        }

    sim = payload["item_similarity"]            # (n_items, n_items) ndarray
    item_ids: List[str] = payload["item_ids"]   # row index → product_id
    user_history: dict = payload.get("user_history", {})  # user_id → [item_idx]
    item_index = {pid: i for i, pid in enumerate(item_ids)}

    # User-based: weight item similarities by what the user already touched
    if user_id and user_id in user_history:
        seen = user_history[user_id]
        scores = sim[seen].sum(axis=0)
        results = _topk(scores, k, exclude=set(seen))
        return {
            "items": [{"product_id": item_ids[i], "score": s} for i, s in results],
            "strategy": "user-collaborative",
        }

    # Item-based: similar to a single product
    if product_id and product_id in item_index:
        idx = item_index[product_id]
        scores = sim[idx].copy()
        scores[idx] = -np.inf
        results = _topk(scores, k)
        return {
            "items": [{"product_id": item_ids[i], "score": s} for i, s in results],
            "strategy": "item-similarity",
        }

    # Cold start → popular
    pop = registry.get("popularity") or {}
    items = pop.get("items", [])[:k]
    return {
        "items": [{"product_id": pid, "score": float(score)} for pid, score in items],
        "strategy": "popularity-cold-start",
    }
