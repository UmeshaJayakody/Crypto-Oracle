import torch
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("CHRONOS_MODEL", "amazon/chronos-2")
DEVICE     = os.getenv("TORCH_DEVICE", "cuda")

_pipeline = None


def warmup_model():
    global _pipeline
    try:
        from chronos import ChronosPipeline
    except ImportError:
        logger.error("chronos-forecasting not installed. Run: pip install chronos-forecasting")
        return

    device = DEVICE if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        logger.warning("CUDA not found — using CPU fallback (slower)")

    logger.info(f"Loading Chronos-2 model on {device}...")
    _pipeline = ChronosPipeline.from_pretrained(
        MODEL_NAME,
        device_map=device,
        torch_dtype=torch.bfloat16,
    )

    if torch.cuda.is_available():
        used  = torch.cuda.memory_allocated(0) / 1024**2
        total = torch.cuda.get_device_properties(0).total_memory / 1024**2
        logger.info(f"Chronos-2 loaded on {device} | VRAM: {used:.0f}MB / {total:.0f}MB")
    else:
        logger.info("Chronos-2 loaded on CPU")


def get_pipeline():
    if _pipeline is None:
        warmup_model()
    return _pipeline


def predict_prices(
    historical_prices: list[float],
    prediction_length: int = 7,
    num_samples: int = 20,
    quantile_low: float = 0.1,
    quantile_high: float = 0.9,
) -> dict:
    pipeline = get_pipeline()

    if pipeline is None:
        # Fallback: simple moving average projection
        logger.warning("Chronos pipeline unavailable, using MA fallback")
        prices = np.array(historical_prices)
        last   = prices[-1]
        trend  = (prices[-1] - prices[-min(7, len(prices))]) / prices[-min(7, len(prices))]
        median = [last * (1 + trend * (i + 1) / prediction_length) for i in range(prediction_length)]
        spread = last * 0.05
        return {
            "median":         median,
            "lower":          [m - spread for m in median],
            "upper":          [m + spread for m in median],
            "chronos_signal": float(np.clip(trend * 10, -1.0, 1.0)),
        }

    context = torch.tensor(historical_prices, dtype=torch.bfloat16).unsqueeze(0)

    with torch.inference_mode():
        forecast = pipeline.predict(
            context=context,
            prediction_length=prediction_length,
            num_samples=num_samples,
        )

    samples = forecast[0].float().cpu().numpy()
    median  = np.median(samples, axis=0)
    slope   = (median[-1] - median[0]) / (median[0] + 1e-9)
    chronos_signal = float(np.clip(slope * 10, -1.0, 1.0))

    return {
        "median":         median.tolist(),
        "lower":          np.quantile(samples, quantile_low,  axis=0).tolist(),
        "upper":          np.quantile(samples, quantile_high, axis=0).tolist(),
        "chronos_signal": chronos_signal,
    }


def get_gpu_stats() -> dict:
    if not torch.cuda.is_available():
        return {"available": False, "message": "CUDA not available"}
    return {
        "available":     True,
        "name":          torch.cuda.get_device_name(0),
        "vram_used_mb":  round(torch.cuda.memory_allocated(0) / 1024**2, 1),
        "vram_total_mb": round(torch.cuda.get_device_properties(0).total_memory / 1024**2, 1),
        "vram_free_mb":  round(torch.cuda.mem_get_info(0)[0] / 1024**2, 1),
    }
