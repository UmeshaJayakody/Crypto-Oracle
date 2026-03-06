"use client";

import useSWR from "swr";
import { getSettings, updateSettings } from "../api";

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<Record<string, unknown>>(
    "settings",
    getSettings,
    { revalidateOnFocus: false }
  );

  const save = async (updates: Record<string, unknown>) => {
    const optimistic = { ...(data ?? {}), ...updates };
    mutate(optimistic, false);
    const saved = await updateSettings(updates);
    mutate(saved);
    return saved;
  };

  return {
    settings: data ?? {},
    loading:  isLoading,
    error:    error?.message ?? null,
    save,
  };
}
