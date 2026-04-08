"""Smoke tests for the FastAPI ML service."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_metrics():
    res = client.get("/metrics")
    assert res.status_code == 200
    body = res.json()
    assert "process" in body
    assert "models" in body


def test_recommend_falls_back_when_untrained():
    res = client.post("/recommend", json={"k": 5})
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert "strategy" in body


def test_detect_review_neutral_when_untrained():
    res = client.post("/detect-review", json={"text": "Great fabric, soft and breathable"})
    assert res.status_code == 200
    body = res.json()
    assert "fake_score" in body
    assert "is_fake" in body
