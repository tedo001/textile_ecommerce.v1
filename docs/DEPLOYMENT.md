# Deployment Guide

This walks you through getting Threadly running in production.

## 1. Database — MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Allowlist `0.0.0.0/0` (or your hosts).
3. Create a user, copy the connection string into `MONGO_URI`.

## 2. Backend — Render / Railway

The backend ships with a Dockerfile, so any container host works.

**Render** (recommended for the free tier):

1. New → Web Service → connect this repo, root directory `backend`.
2. Build: `docker build`. Start: `node src/server.js`.
3. Add environment variables from `backend/.env.example`.
4. Deploy. Render gives you `https://<name>.onrender.com`.

## 3. ML Service — Render / Railway

1. New → Web Service → root directory `ml`.
2. Same procedure - the Dockerfile installs all Python deps.
3. Set `MODELS_DIR=/app/models`, `DATA_DIR=/app/data`.
4. Persistent disk: mount `/app/models` so retrained artifacts survive restarts.
5. After deploy, copy the URL into the backend's `ML_API_URL` env var.

## 4. Frontend — Vercel

```bash
cd frontend
npx vercel link
npx vercel env add NEXT_PUBLIC_API_URL
npx vercel --prod
```

Vercel auto-detects Next.js and builds.

## 5. CORS / API gateway

Set `CORS_ORIGIN` on the backend to your Vercel URL (you can list multiple,
comma-separated). The frontend only ever talks to the backend, never directly
to the ML service, so the ML service can stay on a private network.

## 6. Auto-retraining

The `retrain.yml` GitHub Action runs every Sunday and on `workflow_dispatch`:

- Re-runs the data pipeline
- Retrains every model
- Commits updated `.joblib` artifacts back to `/models/`
- The ML service hot-reloads them on next request (mtime watch)

For zero-downtime production retraining, instead of committing models to git,
push them to S3 and have the ML service pull on startup or on a schedule.

## 7. Monitoring

- `GET /api/health` on the backend (uptime checks)
- `GET /health` on the ML service
- `GET /metrics` on the ML service (avg latency + per-model metric)
- Admin dashboard at `/admin` shows revenue, top products, ML accuracy

## 8. First-run checklist

- [ ] Seed the database: `cd backend && npm run seed`
- [ ] Train models at least once: `cd ml && python -m training.train_all`
- [ ] Sign in as `admin@threadly.test` / `admin12345`
- [ ] Change the admin password!
