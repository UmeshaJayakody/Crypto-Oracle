import torch
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("CHRONOS_MODEL", "amazon/chronos-bolt-small")
DEVICE     = os.getenv("TORCH_DEVICE", "cuda")

_pipeline     = None
_pipeline_type = None   # "bolt" | "classic"


def warmup_model():
    global _pipeline, _pipeline_type
    device = DEVICE if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        logger.warning("CUDA not found — using CPU fallback (slower)")

    logger.info(f"Loading {MODEL_NAME} on {device}...")

    # ── Try ChronosBoltPipeline first (Chronos-2 / chronos-bolt-* models) ──
    try:
        from chronos import ChronosBoltPipeline
        _pipeline = ChronosBoltPipeline.from_pretrained(
            MODEL_NAME,
            device_map=device,
            dtype=torch.bfloat16,
        )
        _pipeline_type = "bolt"
        logger.info("Loaded with ChronosBoltPipeline")
    except Exception as bolt_err:
        logger.warning(f"ChronosBoltPipeline failed ({bolt_err}); trying ChronosPipeline…")
        # ── Fall back to classic ChronosPipeline (chronos-t5-* models) ────
        try:
            from chronos import ChronosPipeline
            _pipeline = ChronosPipeline.from_pretrained(
                MODEL_NAME,
                device_map=device,
                dtype=torch.bfloat16,
            )
            _pipeline_type = "classic"
            logger.info("Loaded with ChronosPipeline")
        except Exception:
            _pipeline = None
            _pipeline_type = None
            logger.exception("Chronos warmup failed; falling back to moving-average predictions")
            return

    if torch.cuda.is_available():
        used  = torch.cuda.memory_allocated(0) / 1024**2
        total = torch.cuda.get_device_properties(0).total_memory / 1024**2
        logger.info(f"{MODEL_NAME} loaded on {device} | VRAM: {used:.0f}MB / {total:.0f}MB")
    else:
        logger.info(f"{MODEL_NAME} loaded on CPU")


def get_pipeline():
    if _pipeline is None:
        warmup_model()
    return _pipeline, _pipeline_type


def predict_prices(
    historical_prices: list[float],
    prediction_length: int = 7,
    num_samples: int = 20,
    quantile_low: float = 0.1,
    quantile_high: float = 0.9,
) -> dict:
    pipeline, ptype = get_pipeline()

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

    # Use float32 for context: bfloat16 at BTC prices (~$95k) has ULP ≈ $512,
    # which quantises all price variation away and produces flat predictions.
    # Model weights stay in bfloat16 (low VRAM); only the input needs full precision.
    context = torch.tensor(historical_prices, dtype=torch.float32).unsqueeze(0)

    if ptype == "bolt":
        # quantile_levels list must be sorted; sorted() with a set ensures dedup
        quantile_levels = sorted({quantile_low, 0.5, quantile_high})
        with torch.inference_mode():
            quantiles, mean = pipeline.predict_quantiles(
                context,
                prediction_length=prediction_length,
                quantile_levels=quantile_levels,
            )
        # quantiles shape: (batch, prediction_length, num_quantiles)
        q = quantiles[0].float().cpu().numpy()   # (pred_len, num_quantiles)
        ql_idx = quantile_levels.index(quantile_low)
        qm_idx = quantile_levels.index(0.5)
        qh_idx = quantile_levels.index(quantile_high)
        med    = q[:, qm_idx]
        lower  = q[:, ql_idx]
        upper  = q[:, qh_idx]
    else:
        # Classic ChronosPipeline uses predict()
        with torch.inference_mode():
            forecast = pipeline.predict(
                context=context,
                prediction_length=prediction_length,
                num_samples=num_samples,
            )
        samples = forecast[0].float().cpu().numpy()
        med    = np.median(samples, axis=0)
        lower  = np.quantile(samples, quantile_low,  axis=0)
        upper  = np.quantile(samples, quantile_high, axis=0)

    # Measure move from the LAST historical price to end of forecast,
    # not internally within the forecast (which is near-flat for stable assets).
    last_price     = historical_prices[-1]
    slope          = (med[-1] - last_price) / (last_price + 1e-9)
    chronos_signal = float(np.clip(slope * 10, -1.0, 1.0))

    return {
        "median":         med.tolist(),
        "lower":          lower.tolist(),
        "upper":          upper.tolist(),
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
