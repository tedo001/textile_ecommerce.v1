"""Runtime configuration for the ML service."""
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Resolve models / data dirs - support both repo-root layout and container layout
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR.parent / "models")).resolve()
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR.parent / "data")).resolve()

MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.getenv("ML_API_KEY")  # Optional shared-secret header

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", f"file:{BASE_DIR}/mlruns")
