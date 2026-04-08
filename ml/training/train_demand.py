"""Train the demand forecasting model.

Gradient-boosted regressor over a 14-day rolling window. We log MAE to MLflow
and save the per-product histories alongside the estimator so the runtime
service can recursively roll forward predictions.
"""
from __future__ import annotations

import joblib
import mlflow
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from app.config import MLFLOW_TRACKING_URI, MODELS_DIR
from training.data_pipeline import build_demand_windows, load_sales

WINDOW = 14


def train():
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("threadly-demand")

    sales = load_sales()
    if sales.empty:
        print("No sales data — skipping demand training")
        return

    X, y, histories = build_demand_windows(sales, window=WINDOW)
    if len(X) < 20:
        print(f"Not enough sales windows ({len(X)}) — skipping")
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=200, max_depth=3, learning_rate=0.05)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, preds))

    payload = {
        "model": model,
        "histories": histories,
        "window": WINDOW,
        "metric_name": "mae",
        "metric_value": mae,
        "version": "1",
    }
    out = MODELS_DIR / "demand.joblib"
    joblib.dump(payload, out)

    with mlflow.start_run(run_name="gbr-demand"):
        mlflow.log_param("window", WINDOW)
        mlflow.log_param("n_estimators", 200)
        mlflow.log_metric("mae", mae)
        mlflow.log_artifact(str(out))

    print(f"Demand model trained — windows={len(X)} mae={mae:.3f}")


if __name__ == "__main__":
    train()
