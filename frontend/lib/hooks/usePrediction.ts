"use client";

import { useState, useCallback } from "react";
import { runPrediction, PredictionRequest, PredictionResponse } from "../api";

const LOADING_MESSAGES = [
  "Fetching price data...",
  "Aggregating news sources...",
  "Analyzing with Claude Haiku...",
  "Running Chronos-2 on RTX 3050...",
  "Fusing signals...",
  "Oracle ready.",
];

export function usePrediction() {
  const [data,    setData]    = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [status,  setStatus]  = useState<string>("");

  const predict = useCallback(async (req: PredictionRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

    let msgIdx = 0;
    setStatus(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % (LOADING_MESSAGES.length - 1);
      setStatus(LOADING_MESSAGES[msgIdx]);
    }, 1800);

    try {
      const result = await runPrediction(req);
      clearInterval(interval);
      setStatus(LOADING_MESSAGES[LOADING_MESSAGES.length - 1]);
      setData(result);
    } catch (e) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Prediction failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus("");
  }, []);

  return { data, loading, error, status, predict, reset };
}
