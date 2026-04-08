"""In-process registry that lazy-loads pickled models from disk.

Trained artifacts live in $MODELS_DIR (one .joblib per model). Each model file is
a dict with at least:
    {"model": <sklearn estimator>, "metric_name": "...", "metric_value": 0.87, "version": "1"}

The registry watches the file mtimes and hot-reloads automatically when a new
training run produces a new artifact - this is what enables the auto-retrain
loop in the GitHub Actions workflow.
"""
from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional

import joblib

from .config import MODELS_DIR


@dataclass
class ModelEntry:
    name: str
    path: Path
    payload: Optional[Dict[str, Any]] = None
    loaded_at: float = 0.0
    mtime: float = 0.0


class ModelRegistry:
    """Thread-safe lazy model loader with mtime-based hot reloading."""

    def __init__(self, models_dir: Path = MODELS_DIR):
        self.models_dir = models_dir
        self._entries: Dict[str, ModelEntry] = {}
        self._lock = threading.RLock()

    def _entry(self, name: str) -> ModelEntry:
        if name not in self._entries:
            self._entries[name] = ModelEntry(name=name, path=self.models_dir / f"{name}.joblib")
        return self._entries[name]

    def get(self, name: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            entry = self._entry(name)
            if not entry.path.exists():
                return None
            current_mtime = entry.path.stat().st_mtime
            if entry.payload is None or current_mtime > entry.mtime:
                entry.payload = joblib.load(entry.path)
                entry.mtime = current_mtime
                entry.loaded_at = time.time()
            return entry.payload

    def metrics(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for path in self.models_dir.glob("*.joblib"):
            name = path.stem
            payload = self.get(name) or {}
            out[name] = {
                "metric_name": payload.get("metric_name"),
                "metric_value": payload.get("metric_value"),
                "version": payload.get("version", "1"),
                "loaded_at": self._entry(name).loaded_at,
            }
        return out


registry = ModelRegistry()
