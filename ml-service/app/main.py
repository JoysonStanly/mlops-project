import time
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictRequest, PredictResponse
from .model import evaluate_submission, ensure_model_ready
from .logging_config import configure_logging, log_request, metrics_snapshot, record_prediction_metrics, timer_start

configure_logging()
ensure_model_ready()

app = FastAPI(title='AI Project Evaluator ML Service', version='1.0.0')

cors_origins = [origin.strip() for origin in os.getenv('CORS_ALLOW_ORIGINS', '*').split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def request_logging_middleware(request: Request, call_next):
    response = await call_next(request)
    log_request(request, response.status_code)
    return response


@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'ml-service'}


@app.get('/metrics')
async def metrics():
    return metrics_snapshot()


@app.post('/predict', response_model=PredictResponse)
async def predict(payload: PredictRequest):
    started = timer_start()
    try:
        result = evaluate_submission(payload)
        latency_ms = (time.perf_counter() - started) * 1000.0
        record_prediction_metrics(latency_ms)
        return result
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
