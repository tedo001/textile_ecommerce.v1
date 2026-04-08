"""Train the fake review detector.

A TF-IDF + Logistic Regression NLP pipeline. Tiny, transparent, and good
enough on the demo dataset to prove out the end-to-end MLOps loop.
"""
from __future__ import annotations

import joblib
import mlflow
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.config import MLFLOW_TRACKING_URI, MODELS_DIR
from training.data_pipeline import load_reviews


def train():
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("threadly-reviews")

    df = load_reviews()
    if df.empty or df["label"].nunique() < 2:
        print("Not enough labelled review data — skipping")
        return

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"].values, df["label"].astype(int).values, test_size=0.2, random_state=42, stratify=df["label"]
    )

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=20000)),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    f1 = float(f1_score(y_test, preds))

    payload = {
        "pipeline": pipeline,
        "threshold": 0.5,
        "metric_name": "f1",
        "metric_value": f1,
        "version": "1",
    }
    out = MODELS_DIR / "review_detector.joblib"
    joblib.dump(payload, out)

    with mlflow.start_run(run_name="tfidf-logreg"):
        mlflow.log_param("ngram_range", "1,2")
        mlflow.log_metric("f1", f1)
        mlflow.log_artifact(str(out))

    print(f"Review detector trained — f1={f1:.3f}")


if __name__ == "__main__":
    train()
