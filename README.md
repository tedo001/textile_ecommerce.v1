# Threadly — Textile eCommerce + MLOps Platform

A production-ready eCommerce web application for a textile business with built-in
machine-learning capabilities (recommendations, demand forecasting, fake-review detection,
and image-based search).

```
┌────────────┐    REST    ┌────────────┐    REST    ┌────────────┐
│  Next.js   │ ─────────▶ │  Express   │ ─────────▶ │  FastAPI   │
│  Frontend  │            │  Backend   │            │  ML Service│
└────────────┘            └─────┬──────┘            └─────┬──────┘
                                │                          │
                                ▼                          ▼
                        ┌────────────┐            ┌────────────┐
                        │  MongoDB   │            │  MLflow +  │
                        │ (Firestore │            │  Models    │
                        │  optional) │            │            │
                        └────────────┘            └────────────┘
```

## Repository Layout

```
.
├── frontend/        # Next.js 14 + Tailwind storefront & admin dashboard
├── backend/         # Node.js / Express REST API (auth, products, orders, activity)
├── ml/              # FastAPI ML service + training pipelines
├── data/            # Sample datasets used for training and demos
├── models/          # Saved model artifacts (pickle / joblib)
├── .github/         # CI/CD workflows (lint, test, retrain)
├── docker-compose.yml
└── README.md
```

## Quick Start (Local)

> Requirements: Node.js ≥ 18, Python ≥ 3.10, MongoDB (local or Atlas).

```bash
# 1. Clone & install
git clone https://github.com/tedo001/textile_ecommerce.v1.git
cd textile_ecommerce.v1

# 2. Backend
cd backend
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # populate demo products
npm run dev                # http://localhost:5000

# 3. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000

# 4. ML Service
cd ../ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python training/train_all.py   # trains and saves models to ../models
uvicorn app.main:app --reload --port 8000
```

Or, with Docker:

```bash
docker-compose up --build
```

## Features

### Storefront
- Email + Google authentication (JWT)
- Product browsing with filters (category, price, popularity)
- Smart search powered by ML
- Cart, checkout, order history, wishlist
- Personalized **"Recommended for you"** section
- **"Trending now"** powered by demand forecasting
- Product reviews with **fake review detection**
- Image-based search ("upload a fabric, find similar")

### Admin
- CRUD product management
- Order management
- Analytics dashboard (sales, top products, model accuracy)
- Trigger model retraining

### MLOps
- **Recommendations** — collaborative filtering on user activity
- **Demand prediction** — gradient-boosted regressor over historical sales
- **Fake review detection** — TF-IDF + logistic regression NLP classifier
- **Image search** — color-histogram embeddings + cosine similarity
- MLflow experiment tracking
- DVC-ready dataset versioning
- Auto-retrain GitHub Action (cron + manual)
- Monitoring endpoint exposing model accuracy / latency

## Environment Variables

See `backend/.env.example`, `frontend/.env.example`, and `ml/.env.example`.

| Service  | Variable           | Description                              |
|----------|--------------------|------------------------------------------|
| backend  | `MONGO_URI`        | MongoDB connection string                |
| backend  | `JWT_SECRET`       | Secret used to sign auth tokens          |
| backend  | `GOOGLE_CLIENT_ID` | Google OAuth client id                   |
| backend  | `ML_API_URL`       | URL of the FastAPI ML service            |
| frontend | `NEXT_PUBLIC_API_URL` | URL of the Express backend             |
| ml       | `MODELS_DIR`       | Folder where trained models live         |
| ml       | `MLFLOW_TRACKING_URI` | MLflow tracking server (optional)     |

## Deployment

| Component | Recommended Host | How                                              |
|-----------|------------------|--------------------------------------------------|
| frontend  | Vercel           | `vercel --prod` from `frontend/`                 |
| backend   | Render / Railway | Dockerfile in `backend/`                         |
| ml        | Render / Railway | Dockerfile in `ml/`                              |
| db        | MongoDB Atlas    | Set `MONGO_URI` in backend env                   |

See `docs/DEPLOYMENT.md` for step-by-step instructions.

##  Testing

```bash
cd backend && npm test
cd ml && pytest
cd frontend && npm test
```

##  License

MIT
