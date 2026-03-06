"use client";

import { useState } from "react";
import { useSettings } from "@/lib/hooks/useSettings";
import { CURRENCIES, TIMEZONES } from "@/lib/constants";

export default function SettingsPage() {
  const { settings, loading, save } = useSettings();
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const handleSave = async (key: string, value: unknown) => {
    setSaving(true);
    setSaved(false);
    await save({ [key]: value });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 text-oracle-muted font-mono animate-pulse">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl text-oracle-text">Settings</h1>

      {saved && (
        <div className="bg-oracle-emerald/10 border border-oracle-emerald/30 text-oracle-emerald text-sm px-4 py-2 rounded">
          Settings saved
        </div>
      )}

      {/* Regional */}
      <section className="bg-oracle-card border border-oracle-border rounded-lg p-4 space-y-4">
        <h2 className="text-oracle-cyan font-mono text-sm uppercase tracking-wider">Regional</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">Currency</span>
            <select
              value={settings.currency as string ?? "lkr"}
              onChange={(e) => handleSave("currency", e.target.value)}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">Timezone</span>
            <select
              value={settings.timezone as string ?? "Asia/Colombo"}
              onChange={(e) => handleSave("timezone", e.target.value)}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            >
              {TIMEZONES.map((t) => (
                <option key={t.tz} value={t.tz}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Prediction Defaults */}
      <section className="bg-oracle-card border border-oracle-border rounded-lg p-4 space-y-4">
        <h2 className="text-oracle-cyan font-mono text-sm uppercase tracking-wider">Prediction Defaults</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">History Days</span>
            <input
              type="number"
              min={7} max={365}
              value={settings.history_days as number ?? 30}
              onChange={(e) => handleSave("history_days", parseInt(e.target.value))}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            />
          </label>

          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">Predict Days</span>
            <input
              type="number"
              min={1} max={60}
              value={settings.predict_days as number ?? 7}
              onChange={(e) => handleSave("predict_days", parseInt(e.target.value))}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            />
          </label>

          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">Samples (GPU)</span>
            <input
              type="number"
              min={10} max={100}
              value={settings.num_samples as number ?? 20}
              onChange={(e) => handleSave("num_samples", parseInt(e.target.value))}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            />
          </label>

          <label className="block">
            <span className="text-oracle-muted text-xs block mb-1">News Window (hours)</span>
            <input
              type="number"
              min={1} max={48}
              value={settings.news_hours_back as number ?? 12}
              onChange={(e) => handleSave("news_hours_back", parseInt(e.target.value))}
              className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-2 text-oracle-text font-mono text-sm focus:border-oracle-cyan outline-none"
            />
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.include_reddit as boolean ?? true}
            onChange={(e) => handleSave("include_reddit", e.target.checked)}
            className="w-4 h-4 accent-oracle-cyan"
          />
          <span className="text-oracle-text text-sm">Include Reddit sentiment</span>
        </label>
      </section>

      {/* About */}
      <section className="bg-oracle-card border border-oracle-border rounded-lg p-4 text-oracle-muted text-sm space-y-1 font-mono">
        <div className="flex justify-between">
          <span>AI Forecast</span>
          <span className="text-oracle-cyan">amazon/chronos-2</span>
        </div>
        <div className="flex justify-between">
          <span>Sentiment</span>
          <span className="text-oracle-cyan">claude-haiku-4-5-20251001</span>
        </div>
        <div className="flex justify-between">
          <span>Price Data</span>
          <span className="text-oracle-cyan">CoinGecko API</span>
        </div>
        <div className="flex justify-between">
          <span>Hardware</span>
          <span className="text-oracle-cyan">RTX 3050 6GB (CUDA 12.1)</span>
        </div>
      </section>
    </div>
  );
}
