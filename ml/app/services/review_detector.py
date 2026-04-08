"""Fake review detection service.

A simple, well-understood TF-IDF + Logistic Regression NLP pipeline. We picked
this over a heavier transformer because it (a) trains in a couple of seconds on
the modest sample dataset, (b) has interpretable feature weights, and
(c) deploys in <50 MB which fits Render's free tier.
"""
from __future__ import annotations

from ..model_registry import registry


def detect(text: str):
    payload = registry.get("review_detector")
    if not payload:
        # No model loaded → never block users; return neutral score.
        return {"fake_score": 0.0, "is_fake": False, "label": "unknown"}

    pipeline = payload["pipeline"]
    threshold = float(payload.get("threshold", 0.5))
    proba = float(pipeline.predict_proba([text])[0][1])
    return {
        "fake_score": proba,
        "is_fake": proba >= threshold,
        "label": "fake" if proba >= threshold else "real",
    }
