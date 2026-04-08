from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.features import compute_features, feature_vector
from pipeline.data_generator import build_dataset

FEATURE_NAMES = [
    'code_complexity',
    'comment_ratio',
    'repetition_score',
    'text_perplexity',
    'average_line_length',
    'function_count',
    'naming_diversity',
]


def featurize_dataframe(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    vectors: list[list[float]] = []
    labels: list[int] = []

    for _, row in df.iterrows():
        features = compute_features(str(row['text']))
        vectors.append(feature_vector(features))
        labels.append(int(row['label']))

    return np.array(vectors, dtype=float), np.array(labels, dtype=int)


def get_pipeline(model_name: str) -> tuple[Pipeline, dict[str, list[object]]]:
    if model_name == 'rf':
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', RandomForestClassifier(random_state=42, max_depth=8, min_samples_leaf=5)),
        ])
        grid = {
            'model__n_estimators': [120, 200],
            'model__max_depth': [6, 8],
            'model__min_samples_leaf': [3, 5],
        }
        return pipeline, grid

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LogisticRegression(max_iter=2000, random_state=42, C=1.0, class_weight='balanced')),
    ])
    grid = {
        'model__C': [0.5, 1.0, 2.0],
        'model__solver': ['lbfgs'],
    }
    return pipeline, grid


def train_and_save(dataset_path: Path, output_dir: Path, model_name: str, max_samples: int | None = None) -> dict[str, float | str]:
    if dataset_path.exists():
        dataset = pd.read_csv(dataset_path)
    else:
        dataset = build_dataset(samples_per_class=200, seed=42)
        dataset_path.parent.mkdir(parents=True, exist_ok=True)
        dataset.to_csv(dataset_path, index=False)

    # Ensure the training process remains stable even when repository seed data is very small.
    if len(dataset) < 20:
        boost = build_dataset(samples_per_class=120, seed=42)
        dataset = pd.concat([dataset, boost], ignore_index=True)

    if max_samples is not None and max_samples > 0:
        dataset = dataset.head(max_samples)

    X, y = featurize_dataframe(dataset)

    unique_labels, label_counts = np.unique(y, return_counts=True)
    if len(unique_labels) < 2:
        raise ValueError('Training dataset must contain at least two classes (AI and Human).')

    stratify_target = y if label_counts.min() >= 2 else None
    test_count = max(2, int(round(len(y) * 0.2)))
    test_count = min(test_count, len(y) - 1)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_count,
        random_state=42,
        stratify=stratify_target,
    )

    pipeline, param_grid = get_pipeline(model_name=model_name)
    train_unique, train_counts = np.unique(y_train, return_counts=True)
    cv_folds = int(min(3, train_counts.min())) if len(train_unique) >= 2 else 1

    if cv_folds >= 2:
        search = GridSearchCV(pipeline, param_grid=param_grid, scoring='f1', cv=cv_folds, n_jobs=-1)
        search.fit(X_train, y_train)
        best_model = search.best_estimator_
        best_params = search.best_params_
    else:
        best_model = pipeline.fit(X_train, y_train)
        best_params = {'fallback': 'grid_search_skipped_due_to_small_train_split'}

    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)[:, 1]

    metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision_score(y_test, y_pred, zero_division=0)),
        'recall': float(recall_score(y_test, y_pred, zero_division=0)),
        'f1_score': float(f1_score(y_test, y_pred, zero_division=0)),
    }

    unique_preds = len(set(y_pred))
    if unique_preds == 1:
        print(
            f'WARNING: Model predicts only one class! This indicates severe overfitting.'
            f' Increase training dataset size or adjust regularization.'
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / 'model.joblib'
    metadata_path = output_dir / 'model_metadata.json'

    training_means = X_train.mean(axis=0).tolist()
    training_stds = X_train.std(axis=0).tolist()

    bundle = {
        'model': best_model,
        'feature_names': FEATURE_NAMES,
        'training_means': training_means,
        'training_stds': training_stds,
    }
    joblib.dump(bundle, model_path)

    metadata = {
        'model_version': f'ape-{model_name}-v2.0.0',
        'feature_names': FEATURE_NAMES,
        'best_params': best_params,
        'metrics': metrics,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')

    return {
        **metrics,
        'model_path': str(model_path),
        'model_version': str(metadata['model_version']),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Train AI Project Evaluator classification model.')
    parser.add_argument('--dataset', type=str, default='data/dataset.csv')
    parser.add_argument('--output-dir', type=str, default='artifacts')
    parser.add_argument('--model', type=str, choices=['logreg', 'rf'], default='logreg')
    parser.add_argument('--max-samples', type=int, default=0)
    parser.add_argument('--experiment-name', type=str, default='ai-project-evaluator-training')
    parser.add_argument('--tracking-uri', type=str, default='file:./mlruns')
    args = parser.parse_args()

    dataset_path = Path(args.dataset)
    output_dir = Path(args.output_dir)
    max_samples = args.max_samples if args.max_samples > 0 else None

    mlflow.set_tracking_uri(args.tracking_uri)
    mlflow.set_experiment(args.experiment_name)

    with mlflow.start_run(run_name=f'train-{args.model}'):
        mlflow.log_param('model_name', args.model)
        mlflow.log_param('dataset_path', str(dataset_path))
        mlflow.log_param('max_samples', max_samples or 'all')

        result = train_and_save(
            dataset_path=dataset_path,
            output_dir=output_dir,
            model_name=args.model,
            max_samples=max_samples,
        )

        mlflow.log_metrics({
            'accuracy': float(result['accuracy']),
            'precision': float(result['precision']),
            'recall': float(result['recall']),
            'f1_score': float(result['f1_score']),
        })

        model_path = Path(str(result['model_path']))
        metadata_path = output_dir / 'model_metadata.json'
        mlflow.log_artifact(str(model_path))
        mlflow.log_artifact(str(metadata_path))

        print('Training complete')
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
