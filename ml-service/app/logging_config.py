import logging
import time
from fastapi import Request


_prediction_count = 0
_total_latency_ms = 0.0


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s',
    )


def log_request(request: Request, status_code: int) -> None:
    logger = logging.getLogger('ape.ml')
    logger.info('%s %s -> %s', request.method, request.url.path, status_code)


def timer_start() -> float:
    return time.perf_counter()


def record_prediction_metrics(latency_ms: float) -> None:
    global _prediction_count, _total_latency_ms
    _prediction_count += 1
    _total_latency_ms += latency_ms


def metrics_snapshot() -> dict[str, float]:
    average = _total_latency_ms / _prediction_count if _prediction_count else 0.0
    return {
        'prediction_count': float(_prediction_count),
        'average_response_time_ms': round(average, 4),
    }
