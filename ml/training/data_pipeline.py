"""Data pipeline: clean → engineer features → emit training datasets.

The pipeline reads three CSVs from $DATA_DIR (which can be regenerated from the
production MongoDB by an export script):

    activity.csv      user_id, product_id, event_type, ts
    sales.csv         product_id, day, units
    reviews.csv       text, label  (label=1 → fake)

…and writes the cleaned/engineered datasets back to $DATA_DIR/processed/.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from app.config import DATA_DIR

PROCESSED = DATA_DIR / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)


def load_activity() -> pd.DataFrame:
    path = DATA_DIR / "activity.csv"
    if not path.exists():
        return pd.DataFrame(columns=["user_id", "product_id", "event_type", "ts"])
    df = pd.read_csv(path, parse_dates=["ts"])
    df = df.dropna(subset=["product_id"])
    return df


def load_sales() -> pd.DataFrame:
    path = DATA_DIR / "sales.csv"
    if not path.exists():
        return pd.DataFrame(columns=["product_id", "day", "units"])
    df = pd.read_csv(path, parse_dates=["day"])
    df["units"] = df["units"].clip(lower=0)
    return df.sort_values(["product_id", "day"])


def load_reviews() -> pd.DataFrame:
    path = DATA_DIR / "reviews.csv"
    if not path.exists():
        return pd.DataFrame(columns=["text", "label"])
    df = pd.read_csv(path)
    df["text"] = df["text"].astype(str).str.strip()
    df = df[df["text"].str.len() > 0]
    return df


def build_user_item_matrix(activity: pd.DataFrame) -> pd.DataFrame:
    """Convert event log to a weighted user×item interaction matrix."""
    weights = {"view": 1.0, "click": 1.5, "add_to_cart": 3.0, "wishlist": 2.0, "purchase": 5.0}
    activity = activity.copy()
    activity["weight"] = activity["event_type"].map(weights).fillna(0.5)
    matrix = (
        activity.groupby(["user_id", "product_id"])["weight"].sum().unstack(fill_value=0.0)
    )
    return matrix


def build_demand_windows(sales: pd.DataFrame, window: int = 14):
    """Sliding-window feature/label arrays for demand forecasting."""
    X, y, histories = [], [], {}
    for pid, group in sales.groupby("product_id"):
        units = group["units"].astype(float).values
        histories[pid] = units.tolist()
        for i in range(len(units) - window):
            X.append(units[i : i + window])
            y.append(units[i + window])
    return np.array(X), np.array(y), histories


def main():
    activity = load_activity()
    sales = load_sales()
    reviews = load_reviews()

    matrix = build_user_item_matrix(activity)
    # Persist cleaned/processed datasets as CSV for portability (no pyarrow dep).
    matrix.to_csv(PROCESSED / "user_item_matrix.csv")
    sales.to_csv(PROCESSED / "sales.csv", index=False)
    reviews.to_csv(PROCESSED / "reviews.csv", index=False)

    print(
        f"Pipeline done — users: {matrix.shape[0]}, items: {matrix.shape[1]}, "
        f"sales rows: {len(sales)}, reviews: {len(reviews)}"
    )


if __name__ == "__main__":
    main()
