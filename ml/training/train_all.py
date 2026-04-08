"""Run every training job in sequence.

Used by the GitHub Actions retraining workflow and by `make train`.
"""
from __future__ import annotations

from training import (
    build_image_index,
    data_pipeline,
    generate_sample_data,
    train_demand,
    train_recommender,
    train_review_detector,
)


def main():
    print("=" * 60)
    print("[0/5] Ensuring sample data exists")
    generate_sample_data.main()

    print("=" * 60)
    print("[1/5] Running data pipeline")
    data_pipeline.main()

    print("=" * 60)
    print("[2/5] Training recommender")
    train_recommender.train()

    print("=" * 60)
    print("[3/5] Training demand model")
    train_demand.train()

    print("=" * 60)
    print("[4/5] Training review detector")
    train_review_detector.train()

    print("=" * 60)
    print("[5/5] Building image index")
    build_image_index.build()

    print("=" * 60)
    print("All training jobs done.")


if __name__ == "__main__":
    main()
