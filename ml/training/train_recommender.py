"""Train the item-based collaborative filtering recommender.

We compute an item-item cosine similarity matrix from the weighted user×item
interaction matrix produced by data_pipeline.py. Both the similarity matrix
and a mapping from user_id to interacted item indices are saved together so
the runtime service can serve both user-personalised and item-similarity
recommendations from the same artifact.
"""
from __future__ import annotations

import joblib
import mlflow
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.config import MLFLOW_TRACKING_URI, MODELS_DIR
from training.data_pipeline import build_user_item_matrix, load_activity


def train():
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("threadly-recommender")

    activity = load_activity()
    matrix = build_user_item_matrix(activity)

    if matrix.empty:
        print("No activity data — skipping recommender training")
        return

    arr = matrix.values.astype(np.float32)
    item_ids = matrix.columns.tolist()
    user_ids = matrix.index.tolist()

    sim = cosine_similarity(arr.T)  # (items × items)
    np.fill_diagonal(sim, 0.0)

    user_history = {
        user_ids[i]: [int(j) for j in np.where(arr[i] > 0)[0]] for i in range(len(user_ids))
    }

    # A simple sanity metric: average top-1 similarity
    top1 = float(np.mean(np.max(sim, axis=1))) if sim.size else 0.0

    payload = {
        "item_similarity": sim,
        "item_ids": item_ids,
        "user_history": user_history,
        "metric_name": "avg_top1_similarity",
        "metric_value": top1,
        "version": "1",
    }

    out = MODELS_DIR / "recommender.joblib"
    joblib.dump(payload, out)

    # Also write a popularity fallback artifact
    pop = arr.sum(axis=0)
    pop_items = sorted(zip(item_ids, pop), key=lambda x: -x[1])
    joblib.dump(
        {
            "items": [(pid, float(score)) for pid, score in pop_items],
            "metric_name": "items",
            "metric_value": float(len(pop_items)),
            "version": "1",
        },
        MODELS_DIR / "popularity.joblib",
    )

    with mlflow.start_run(run_name="item-cf"):
        mlflow.log_param("n_items", len(item_ids))
        mlflow.log_param("n_users", len(user_ids))
        mlflow.log_metric("avg_top1_similarity", top1)
        mlflow.log_artifact(str(out))

    print(f"Recommender trained — items={len(item_ids)} users={len(user_ids)} top1={top1:.3f}")


if __name__ == "__main__":
    train()
