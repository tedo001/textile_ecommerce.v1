"""Generate larger synthetic datasets for offline training when no real data exists.

Run this once to seed `data/sales.csv`, augment `data/activity.csv` and create
`data/reviews.csv` if they're missing or too small. The pipelines tolerate
existing files - only the missing pieces are written.
"""
from __future__ import annotations

import math
import random
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

from app.config import DATA_DIR

random.seed(42)
np.random.seed(42)

PRODUCTS = [f"p{i}" for i in range(1, 9)]
USERS = [f"u{i}" for i in range(1, 21)]


def gen_sales(days: int = 60):
    out_path = DATA_DIR / "sales.csv"
    if out_path.exists():
        existing = pd.read_csv(out_path)
        if len(existing) >= 200:
            return
    rows = []
    base_date = datetime(2026, 2, 1)
    for pid in PRODUCTS:
        baseline = random.uniform(2, 12)
        weekly_amp = random.uniform(0.4, 1.8)
        trend = random.uniform(-0.02, 0.05)
        for d in range(days):
            day = base_date + timedelta(days=d)
            seasonal = 1 + weekly_amp * math.sin(2 * math.pi * d / 7)
            units = max(0, baseline * seasonal + trend * d + np.random.normal(0, 1))
            rows.append({"product_id": pid, "day": day.strftime("%Y-%m-%d"), "units": round(units, 2)})
    pd.DataFrame(rows).to_csv(out_path, index=False)
    print(f"Wrote {len(rows)} sales rows → {out_path}")


def gen_reviews():
    out_path = DATA_DIR / "reviews.csv"
    if out_path.exists():
        existing = pd.read_csv(out_path)
        if len(existing) >= 40:
            return
    real = [
        "Lovely fabric, soft touch and the colour is exactly as shown.",
        "Stitching is neat and the fit is perfect for me.",
        "I have washed it twice and the colour has not faded.",
        "Beautiful saree, comfortable to drape, received many compliments.",
        "The kurta is comfortable in summer, breathable cotton.",
        "Material quality is decent for the price, would buy again.",
        "Shipping was quick and packaging was eco-friendly.",
        "Good handloom finish, you can see the craftsmanship.",
        "The shirt fits true to size and the linen is genuine.",
        "Honestly worth it. Sturdy weave, no loose threads.",
        "Pleasantly surprised by how soft it is after the first wash.",
        "Color matches the photo, will recommend to friends.",
        "The dupatta has a nice fall and the border is elegant.",
        "Fabric is heavy in a good way, feels premium.",
        "Bought for a wedding gift, was very well received.",
        "Slim fit is accurate, no need to size up.",
        "Took longer to ship but the product is great.",
        "Soft, breathable, and the colour does not bleed.",
        "Beautiful block prints, slight irregularities add charm.",
        "Will definitely order again, the quality is consistent.",
    ]
    fake = [
        "Best product ever!!! buy buy buy!!! 100% original!!!",
        "Amazing amazing amazing fabric click link in bio for discount",
        "Wow super wow super product five stars five stars",
        "Cheapest price guaranteed visit our website now",
        "best best best best best best ever ever ever",
        "Great great great great just buy it now hurry",
        "Loved it!! love love love love love love",
        "Promo code SALE50 use my code for discount",
        "Click here for cashback offer hurry limited time",
        "100 percent original product wow recommended",
        "Five stars five stars five stars five stars",
        "Visit www.example.com for more deals",
        "Buy now buy now buy now best discount available",
        "Wow wow wow excellent excellent excellent",
        "Use code REVIEW10 for ten percent off",
        "100% best 100% original 100% recommended buy",
        "Free shipping free shipping use my coupon",
        "Wow excellent product clicking sharing tagging",
        "Discount discount discount available only today",
        "Best price best price best price guaranteed",
    ]
    rows = [{"text": t, "label": 0} for t in real] + [{"text": t, "label": 1} for t in fake]
    pd.DataFrame(rows).to_csv(out_path, index=False)
    print(f"Wrote {len(rows)} reviews → {out_path}")


def gen_activity():
    out_path = DATA_DIR / "activity.csv"
    if out_path.exists():
        try:
            existing = pd.read_csv(out_path)
            if len(existing) >= 200:
                return
        except Exception:
            pass
    rows = []
    base = datetime(2026, 3, 1)
    weights = ["view", "view", "view", "click", "click", "add_to_cart", "wishlist", "purchase"]
    for _ in range(800):
        u = random.choice(USERS)
        p = random.choice(PRODUCTS)
        e = random.choice(weights)
        ts = base + timedelta(minutes=random.randint(0, 60 * 24 * 30))
        rows.append({"user_id": u, "product_id": p, "event_type": e, "ts": ts.isoformat()})
    pd.DataFrame(rows).to_csv(out_path, index=False)
    print(f"Wrote {len(rows)} activity rows → {out_path}")


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    gen_activity()
    gen_sales()
    gen_reviews()


if __name__ == "__main__":
    main()
