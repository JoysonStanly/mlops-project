# AI Project Evaluator

AI Project Evaluator is a production-grade full-stack MLOps platform that classifies student submissions as AI-generated or human-written, computes an effort score, and returns explainable feedback.

## Product capabilities

- Full-stack user workflow: register, login, upload, score, history, analytics
- Binary classification ML task: AI vs Human
- Feature engineering pipeline for source-code and text submissions
- Trained model serving in FastAPI (not heuristic-only)
- Experiment tracking with MLflow
- Reproducible dataset and training pipeline with DVC stage definitions
- Monitoring endpoints for service health and runtime prediction metrics
- CI/CD automation for build, training, API smoke checks, and compose builds

## Repository layout

- frontend: React + TypeScript UI
- backend: Express API, JWT auth, MongoDB persistence
- ml-service: FastAPI inference service, training, data pipeline, MLflow
- docker-compose.yml: local orchestration with health checks
- .github/workflows/ci.yml: CI/CD pipeline
- PROJECT_OVERVIEW.md: full technical documentation for assessment/viva

## Quick start (Docker)

1. Copy environment templates:
   - backend/.env.example -> backend/.env
   - frontend/.env.example -> frontend/.env
   - ml-service/.env.example -> ml-service/.env
2. Start full stack:

   docker compose up --build

3. Open services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - ML service: http://localhost:8000

## Local development

### Frontend

cd frontend
npm install
npm run dev

### Backend

cd backend
npm install
npm run dev

### ML service (inference)

cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train.py --dataset data/dataset.csv --output-dir artifacts --model logreg
uvicorn app.main:app --reload --port 8000

## Data pipeline and model training

Generate synthetic baseline dataset:

cd ml-service
python -m pipeline.data_generator --samples-per-class 250 --out data/dataset.csv

Train model with MLflow logging:

python train.py --dataset data/dataset.csv --output-dir artifacts --model logreg --tracking-uri file:./mlruns

Optional random forest run:

python train.py --dataset data/dataset.csv --output-dir artifacts --model rf --tracking-uri file:./mlruns

## Inference API contract

POST /predict

Request fields:
- fileName
- fileType
- textContent (optional)
- base64Content (optional)

Response fields:
- ai_probability
- effort_score
- prediction (AI or Human)
- explanation
- feedback (backward-compatible alias of explanation)
- model_version
- features

## Monitoring and observability

- Health endpoint: GET /health
- Runtime metrics endpoint: GET /metrics
  - prediction_count
  - average_response_time_ms
- Structured prediction logging includes:
  - model version
  - ai probability
  - effort score
  - prediction label
  - drift indicator (feature distance from training baseline)

## CI/CD pipeline

GitHub Actions workflow runs:
- Frontend lint/build
- Backend lint/build
- ML service dependency install and compile checks
- Dataset generation + model training
- ML API smoke tests for /health and /predict
- Docker Compose build validation

## DVC reproducibility

ml-service/dvc.yaml defines stages for:
- dataset generation
- model training

Run with DVC:

cd ml-service
dvc repro

## Deployment notes

- Host ML port mapping is standardized to 8000:8000
- Compose health checks are enabled for mongo, backend, ml-service, frontend
- Backend waits for healthy mongo and ml-service before startup

## Assessment support

For full rubric coverage (problem framing, architecture, workflow, training, tracking, deployment, monitoring, viva narrative), see PROJECT_OVERVIEW.md.
