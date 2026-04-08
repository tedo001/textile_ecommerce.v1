"""Demand forecasting service.

We train a single gradient-boosted regressor that takes the past 14 days of
unit-sales as features and predicts the next day. To produce a multi-day
forecast we recursively feed predictions back into the input window.

Falls back to a 7-day moving average when the model isn't available.
"""
from __future__ import annotations

from typing import List

import numpy as np

from ..model_registry import registry

WINDOW = 14


def _moving_average(history: List[float], horizon: int) -> List[float]:
    if not history:
        return [0.0] * horizon
    avg = float(np.mean(history[-7:]))
    return [avg] * horizon


def predict(product_id: str, horizon_days: int = 7):
    payload = registry.get("demand")
    if not payload:
        return {
            "product_id": product_id,
            "forecast": [{"day": d + 1, "expected_units": v} for d, v in enumerate(_moving_average([], horizon_days))],
            "total_expected": 0.0,
        }

    model = payload["model"]
    histories: dict = payload.get("histories", {})
    history = histories.get(product_id, [])

    if len(history) < WINDOW:
        # Not enough data for this SKU - fall back gracefully
        forecast = _moving_average(history, horizon_days)
    else:
        window = list(history[-WINDOW:])
        forecast = []
        for _ in range(horizon_days):
            x = np.array(window[-WINDOW:]).reshape(1, -1)
            yhat = float(max(0.0, model.predict(x)[0]))
            forecast.append(yhat)
            window.append(yhat)

    return {
        "product_id": product_id,
        "forecast": [{"day": d + 1, "expected_units": float(v)} for d, v in enumerate(forecast)],
        "total_expected": float(sum(forecast)),
    }
