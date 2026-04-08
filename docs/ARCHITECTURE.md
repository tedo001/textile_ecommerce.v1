# Architecture

## Service boundaries

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │  HTTPS  │  Node/Express API    │
│   (Vercel)          │ ──────▶ │  (Render/Railway)    │
└─────────────────────┘         └─────┬────────────────┘
                                      │
                          ┌───────────┴────────────┐
                          ▼                        ▼
                ┌──────────────────┐     ┌────────────────────┐
                │  MongoDB Atlas   │     │  FastAPI ML Service│
                │ (users, orders…) │     │  (Render)          │
                └──────────────────┘     └─────┬──────────────┘
                                               │
                                               ▼
                                    ┌───────────────────────┐
                                    │ /models/*.joblib      │
                                    │ (mtime hot-reload)    │
                                    └───────────────────────┘
```

The frontend never talks directly to the ML service — the backend acts as a
thin proxy. This means:

- The ML service can sit on a private network behind a shared-secret API key.
- The backend can hydrate ML responses (e.g. expand product IDs to full
  documents from MongoDB) before they reach the browser.
- We can A/B test or shadow-route traffic at the proxy without touching the UI.

## Data flow

1. **User activity** is logged on the backend (`/api/activity/track` and
   automatic logging from product views, cart actions, purchases). Each event
   is written to `Activity` in MongoDB.
2. The **GitHub Actions retrain workflow** exports new activity, runs the
   Python pipeline (`ml/training/data_pipeline.py`), and trains all four
   models.
3. New `.joblib` artifacts are committed back to `models/`.
4. The `ModelRegistry` in the FastAPI service watches mtimes and hot-reloads
   on the next request.
5. The frontend's "Recommended for you", "Trending now", review-flagging and
   image-search features all consume the new models without a restart.

## Why these models?

| Capability        | Algorithm                            | Why                                                                              |
|-------------------|--------------------------------------|----------------------------------------------------------------------------------|
| Recommendations   | Item-item collaborative filtering    | Strong baseline, no cold-start for items already in catalog, interpretable.      |
| Demand forecast   | Gradient-boosted regressor (sklearn) | Handles weekly seasonality, robust to small datasets, fast to retrain.           |
| Fake review       | TF-IDF + Logistic Regression         | Tiny model size, fast inference, transparent feature weights for moderators.    |
| Image search      | Colour histogram + cosine similarity | No GPU required, fits free-tier hosts. Same interface as a CNN-based version.   |

Each model can be swapped for a heavier alternative (LightFM, Prophet,
DistilBERT, CLIP) without touching the FastAPI route signatures.
