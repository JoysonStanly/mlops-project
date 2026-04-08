from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from .features import compute_features, effort_from_features, extract_text, feature_vector, feedback_for
from .schemas import PredictRequest, PredictResponse, FeaturesResponse

logger = logging.getLogger('ape.ml.model')
MODEL_DIR = Path(os.getenv('MODEL_DIR', Path(__file__).resolve().parent.parent / 'artifacts'))
METADATA_PATH = MODEL_DIR / 'model_metadata.json'
MODEL_PATH = MODEL_DIR / 'model.joblib'

_cached_bundle: dict[str, Any] | None = None


def ensure_model_ready() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if METADATA_PATH.exists() and MODEL_PATH.exists():
        return
    logger.warning('Model artifacts not found. Bootstrapping default trained model.')
    from train import train_and_save

    train_and_save(
        dataset_path=Path(__file__).resolve().parent.parent / 'data' / 'dataset.csv',
        output_dir=MODEL_DIR,
        model_name='logreg',
        max_samples=400,
    )


def load_bundle() -> dict[str, Any]:
    global _cached_bundle
    ensure_model_ready()
    if _cached_bundle is None:
        bundle = joblib.load(MODEL_PATH)
        _cached_bundle = bundle
    return _cached_bundle


def load_version() -> str:
    ensure_model_ready()
    metadata = json.loads(METADATA_PATH.read_text(encoding='utf-8'))
    return metadata['model_version']


def predict_label(ai_probability: float) -> str:
    return 'AI' if ai_probability >= 0.5 else 'Human'


def build_explanation(ai_probability: float, effort_score: float, features_vector: list[float]) -> str:
    base = feedback_for(ai_probability, effort_score)
    strongest_signal = max(
        [
            ('repetition', features_vector[2]),
            ('low comments', 1.0 - features_vector[1]),
            ('short/simple patterns', 1.0 - features_vector[0]),
            ('naming consistency', 1.0 - features_vector[6]),
        ],
        key=lambda item: item[1],
    )
    return f"{base}. Strongest observed signal: {strongest_signal[0]}."


def compute_drift_indicator(features_vector: list[float], means: list[float], stds: list[float]) -> float:
    z_scores = []
    for value, mean, std in zip(features_vector, means, stds, strict=False):
        safe_std = std if std > 1e-6 else 1.0
        z_scores.append(abs((value - mean) / safe_std))
    return float(np.mean(z_scores)) if z_scores else 0.0


def calibrate_probability(raw_probability: float, drift_indicator: float) -> float:
    normalized_drift = max(0.0, drift_indicator)
    # Use a smooth decay so high-drift samples are softened without collapsing to one fixed value.
    confidence_weight = 1.0 / (1.0 + 0.22 * normalized_drift)
    confidence_weight = max(0.3, min(1.0, confidence_weight))
    softened_probability = 0.5 + (raw_probability - 0.5) * confidence_weight
    return float(max(0.05, min(0.95, softened_probability)))


def evaluate_submission(payload: PredictRequest) -> PredictResponse:
    text = extract_text(payload.fileName, payload.fileType, payload.textContent, payload.base64Content)
    features = compute_features(text)
    bundle = load_bundle()
    model = bundle['model']
    feature_names = bundle.get('feature_names', [])
    training_means = bundle.get('training_means', [0.0] * len(feature_names))
    training_stds = bundle.get('training_stds', [1.0] * len(feature_names))

    vector = feature_vector(features)
    probabilities = model.predict_proba([vector])[0]
    raw_ai_probability = float(probabilities[1] if len(probabilities) > 1 else probabilities[0])
    model_version = load_version()
    drift_indicator = compute_drift_indicator(vector, training_means, training_stds)
    ai_probability = calibrate_probability(raw_ai_probability, drift_indicator)
    effort_score = effort_from_features(features, ai_probability)
    prediction = predict_label(ai_probability)
    explanation = build_explanation(ai_probability, effort_score, vector)

    logger.info(
        'prediction_complete model_version=%s raw_ai_probability=%.4f calibrated_ai_probability=%.4f effort_score=%.2f prediction=%s drift_indicator=%.4f',
        model_version,
        raw_ai_probability,
        ai_probability,
        effort_score,
        prediction,
        drift_indicator,
    )

    return PredictResponse(
        ai_probability=round(ai_probability, 4),
        effort_score=round(effort_score, 2),
        prediction=prediction,
        explanation=explanation,
        feedback=explanation,
        model_version=model_version,
        features=FeaturesResponse(
            code_complexity=features.code_complexity,
            comment_ratio=features.comment_ratio,
            repetition_score=features.repetition_score,
            text_perplexity=features.text_perplexity,
            average_line_length=features.average_line_length,
            function_count=features.function_count,
            naming_diversity=features.naming_diversity,
        ),
    )
