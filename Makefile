.PHONY: help install backend frontend ml train seed up down test

help:
	@echo "Available targets:"
	@echo "  install   Install all dependencies (backend + frontend + ml)"
	@echo "  seed      Seed MongoDB with demo products and admin user"
	@echo "  train     Run the full ML training pipeline"
	@echo "  up        Start everything with docker-compose"
	@echo "  down      Stop docker-compose"
	@echo "  test      Run all test suites"

install:
	cd backend && npm install
	cd frontend && npm install
	cd ml && pip install -r requirements.txt

seed:
	cd backend && npm run seed

train:
	cd ml && python -m training.train_all

backend:
	cd backend && npm run dev

frontend:
	cd frontend && npm run dev

ml:
	cd ml && uvicorn app.main:app --reload --port 8000

up:
	docker-compose up --build

down:
	docker-compose down

test:
	cd backend && npm test --silent
	cd ml && pytest -q
