"""Image-based similarity search.

We embed each product image as a normalised colour histogram and store the
matrix on disk during training. At query time we compute the same histogram on
the uploaded image and rank by cosine similarity.

This is intentionally lightweight (no torch/CUDA) so it runs on free tiers, but
the interface is the same shape a CNN-embedding model would expose, so it can
be swapped out without touching the API contract.
"""
from __future__ import annotations

from io import BytesIO
from typing import List

import numpy as np
from PIL import Image

from ..model_registry import registry

BINS = 8  # 8 bins per channel → 512-dim embedding


def _embed(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize((128, 128))
    arr = np.asarray(img)
    hist, _ = np.histogramdd(
        arr.reshape(-1, 3),
        bins=(BINS, BINS, BINS),
        range=((0, 256), (0, 256), (0, 256)),
    )
    vec = hist.flatten().astype(np.float32)
    n = np.linalg.norm(vec)
    return vec / n if n > 0 else vec


def search(image_bytes: bytes, k: int = 8):
    payload = registry.get("image_index")
    if not payload:
        return {"items": []}
    embeddings = payload["embeddings"]
    product_ids: List[str] = payload["product_ids"]
    query = _embed(Image.open(BytesIO(image_bytes)))
    sims = embeddings @ query
    order = np.argsort(-sims)[:k]
    return {
        "items": [{"product_id": product_ids[i], "score": float(sims[i])} for i in order],
    }
