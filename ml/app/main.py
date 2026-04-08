"""FastAPI entry point for the Threadly ML service."""
from __future__ import annotations

import time

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from . import schemas
from .config import API_KEY
from .model_registry import registry
from .services import demand, image_search, recommender, review_detector

app = FastAPI(
    title="Threadly ML API",
    version="1.0.0",
    description="Recommendations, demand forecasting, fake review detection and image search.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Lightweight latency / count metrics (per process) ----------
_metrics = {"requests": 0, "latency_ms_sum": 0.0, "errors": 0}


@app.middleware("http")
async def latency_middleware(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception:
        _metrics["errors"] += 1
        raise
    elapsed = (time.time() - start) * 1000
    _metrics["requests"] += 1
    _metrics["latency_ms_sum"] += elapsed
    response.headers["X-Process-Time-ms"] = f"{elapsed:.2f}"
    return response


def _check_api_key(x_api_key: str | None):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ---------- Routes ----------
@app.get("/health")
def health():
    return {"status": "ok", "service": "threadly-ml"}


@app.get("/metrics")
def metrics():
    avg_latency = (
        _metrics["latency_ms_sum"] / _metrics["requests"] if _metrics["requests"] else 0
    )
    return {
        "process": {
            "requests": _metrics["requests"],
            "errors": _metrics["errors"],
            "avg_latency_ms": round(avg_latency, 2),
        },
        "models": registry.metrics(),
    }


@app.post("/recommend", response_model=schemas.RecommendResponse)
def recommend_endpoint(
    body: schemas.RecommendRequest, x_api_key: str | None = Header(default=None)
):
    _check_api_key(x_api_key)
    return recommender.recommend(body.user_id, body.product_id, body.k)


@app.post("/predict-demand", response_model=schemas.DemandResponse)
def predict_demand_endpoint(
    body: schemas.DemandRequest, x_api_key: str | None = Header(default=None)
):
    _check_api_key(x_api_key)
    return demand.predict(body.product_id, body.horizon_days)


@app.post("/detect-review", response_model=schemas.ReviewResponse)
def detect_review_endpoint(
    body: schemas.ReviewRequest, x_api_key: str | None = Header(default=None)
):
    _check_api_key(x_api_key)
    return review_detector.detect(body.text)


@app.post("/image-search")
async def image_search_endpoint(
    image: UploadFile = File(...), x_api_key: str | None = Header(default=None)
):
    _check_api_key(x_api_key)
    content = await image.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 5MB)")
    return image_search.search(content)
