"""Pydantic request/response schemas for the ML API."""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    k: int = Field(default=8, ge=1, le=50)


class RecommendItem(BaseModel):
    product_id: str
    score: float


class RecommendResponse(BaseModel):
    items: List[RecommendItem]
    strategy: str


class DemandRequest(BaseModel):
    product_id: str
    horizon_days: int = Field(default=7, ge=1, le=90)


class DemandPoint(BaseModel):
    day: int
    expected_units: float


class DemandResponse(BaseModel):
    product_id: str
    forecast: List[DemandPoint]
    total_expected: float


class ReviewRequest(BaseModel):
    text: str


class ReviewResponse(BaseModel):
    fake_score: float
    is_fake: bool
    label: str
