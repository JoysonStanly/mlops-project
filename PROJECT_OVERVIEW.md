# AI Project Evaluator - Production MLOps Overview

## 1. Problem Statement

Educational reviewers need a reliable and explainable way to estimate whether student submissions are AI-generated or human-authored. This project addresses that need with an end-to-end MLOps system that performs binary classification and presents explainable outputs in a full-stack web product.

Task definition:
- Objective: Binary classification (AI-generated vs Human-written)
- Input: Source code/text/PDF-derived text
- Outputs:
  - ai_probability
  - prediction label (AI or Human)
  - effort_score
  - explanation

## 2. Architecture Diagram (Text)

[User Browser]
  -> [Frontend React App :3000]
  -> [Backend Express API :4000]
      -> [MongoDB :27017]
      -> [ML Service FastAPI :8000]
          -> [Model Artifacts /app/artifacts]
          -> [MLflow Runs /app/mlruns]
          -> [Feature Engineering + Inference]

CI/CD Flow:
[GitHub Push/PR]
  -> [GitHub Actions]
      -> [Frontend lint/build]
      -> [Backend lint/build]
      -> [ML dataset generation + training + smoke tests]
      -> [Docker compose build]

## 3. End-to-End System Workflow

1. User registers/logs in from frontend.
2. Backend authenticates user and issues JWT.
3. User uploads file/zip from upload page.
4. Backend stores upload metadata and extracts text payload.
5. Backend calls ML /predict endpoint.
6. ML service extracts features, runs trained model, returns prediction contract.
7. Backend stores prediction document in MongoDB.
8. Frontend displays results and persists history timeline.

## 4. Data Pipeline

### Data ingestion
- Source baseline dataset: ml-service/data/dataset.csv
- Synthetic generation utility: ml-service/pipeline/data_generator.py
- Dataset schema:
  - text
  - label (0=Human, 1=AI)
  - source

### Cleaning and preprocessing
- Feature extraction from raw text through app/features.py
- Handles code and natural text from plain files or PDF extraction

### Dataset versioning
- DVC stage definitions: ml-service/dvc.yaml
- Stages:
  - generate_dataset
  - train_model

### Reproducibility commands
- python -m pipeline.data_generator --samples-per-class 250 --out data/dataset.csv
- python train.py --dataset data/dataset.csv --output-dir artifacts --model logreg
- dvc repro

## 5. Feature Engineering

Retained features:
- code_complexity
- comment_ratio
- repetition_score
- text_perplexity

New features:
- average_line_length
- function_count
- naming_diversity

Normalization:
- StandardScaler applied in sklearn pipeline before classification model.

## 6. Model Training and Experiment Tracking

Training script:
- ml-service/train.py

Supported models:
- Logistic Regression
- Random Forest

Hyperparameter tuning:
- GridSearchCV with f1 scoring

Evaluation metrics:
- accuracy
- precision
- recall
- f1_score

MLflow integration:
- Tracking URI configurable (default file:./mlruns)
- Logs:
  - parameters
  - metrics
  - model artifact
  - metadata artifact

Model versioning:
- model_metadata.json includes model_version, feature_names, best_params, metrics

## 7. Model Serving

Service:
- FastAPI in ml-service/app/main.py

Inference implementation:
- Artifact loading and prediction logic in ml-service/app/model.py

Prediction response:
- ai_probability
- effort_score
- prediction
- explanation
- feedback (backward compatibility alias)
- model_version
- features

Backward compatibility strategy:
- Existing backend/frontend field feedback remains available.
- New fields prediction and explanation are additive.

## 8. Monitoring and Logging

Endpoints:
- GET /health
- GET /metrics

Metrics captured:
- prediction_count
- average_response_time_ms

Logging:
- Structured prediction logs include:
  - model_version
  - ai_probability
  - effort_score
  - prediction
  - drift_indicator

Drift indicator:
- Mean absolute z-score distance of incoming feature vector against training baseline stats.

## 9. Frontend Analytics and UX Improvements

Results UI now supports:
- AI probability visuals
- Effort score meter
- Explanation text
- Prediction label
- Model version display

Dashboard analytics:
- Total evaluated projects
- Average AI likelihood
- Daily review count
- Trend chart and recent predictions table

## 10. Backend and API Improvements

Backend integration updates:
- Extended ML client contract parsing
- Persistent storage for predictionLabel and explanation
- Stored expanded feature schema
- Standardized id field in history/result payloads

Security and resilience:
- JWT authentication
- Route protection middleware
- Rate limiting
- Error middleware

## 11. Deployment Improvements

Compose updates:
- Port alignment for ML service: 8000:8000
- Health checks for all core services
- Depends-on with healthy conditions for startup sequencing

Docker updates:
- ML image includes pipeline/training files
- Model artifact generated at image build time for ready-to-serve startup

## 12. CI/CD Automation

GitHub Actions workflow:
- Frontend lint/build
- Backend lint/build
- ML dependency and compile validation
- Dataset generation + model training
- API smoke tests against running ML service
- Docker compose build validation

## 13. API Documentation Summary

Backend:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/upload
- GET /api/results/:id
- GET /api/history
- GET /health

ML service:
- POST /predict
- GET /health
- GET /metrics

## 14. Screenshots (Add For Viva)

Add screenshots in this section before submission:
- Landing page
- Login/Register
- Dashboard analytics
- Upload workflow
- Result page with explanation and model version
- History page
- MLflow experiment runs

## 15. Viva Talking Points

- Explain binary classification framing and label generation strategy.
- Walk through feature engineering rationale.
- Demonstrate experiment tracking and model versioning.
- Show reproducibility via DVC stages and deterministic scripts.
- Demonstrate deployment readiness with health checks and CI gates.
- Explain monitoring metrics and drift indicator for post-deploy observability.

## 16. Key Files

Core:
- README.md
- PROJECT_OVERVIEW.md
- docker-compose.yml
- .github/workflows/ci.yml

ML:
- ml-service/train.py
- ml-service/pipeline/data_generator.py
- ml-service/dvc.yaml
- ml-service/app/features.py
- ml-service/app/model.py
- ml-service/app/main.py

Backend:
- backend/src/services/mlServiceClient.ts
- backend/src/controllers/uploadController.ts
- backend/src/models/Prediction.ts

Frontend:
- frontend/src/pages/ResultsPage.tsx
- frontend/src/pages/DashboardPage.tsx
- frontend/src/types.ts
