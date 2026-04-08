"""Build the image-search index.

Walks $DATA_DIR/product_images/<product_id>/*.jpg, computes a colour-histogram
embedding for each image, and saves a (n × dim) ndarray plus the matching
product id list. The runtime service uses cosine similarity at query time.
"""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from PIL import Image

from app.config import DATA_DIR, MODELS_DIR
from app.services.image_search import _embed


def build():
    images_dir = DATA_DIR / "product_images"
    if not images_dir.exists():
        print(f"No images at {images_dir} — skipping image index build")
        return

    embeddings, product_ids = [], []
    for product_dir in sorted(p for p in images_dir.iterdir() if p.is_dir()):
        for image_path in sorted(product_dir.glob("*")):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            try:
                emb = _embed(Image.open(image_path))
            except Exception as exc:
                print(f"Skipping {image_path}: {exc}")
                continue
            embeddings.append(emb)
            product_ids.append(product_dir.name)

    if not embeddings:
        print("No usable images found — skipping")
        return

    matrix = np.vstack(embeddings).astype(np.float32)
    payload = {
        "embeddings": matrix,
        "product_ids": product_ids,
        "metric_name": "n_images",
        "metric_value": float(len(product_ids)),
        "version": "1",
    }
    joblib.dump(payload, MODELS_DIR / "image_index.joblib")
    print(f"Image index built — {len(product_ids)} images, dim={matrix.shape[1]}")


if __name__ == "__main__":
    build()
