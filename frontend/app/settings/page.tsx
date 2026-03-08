"use client";

import { useState } from "react";
import { useSettings } from "@/lib/hooks/useSettings";
import { CURRENCIES, TIMEZONES, DEFAULT_CURRENCY } from "@/lib/constants";

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
      <div className="p-8 text-white/35 font-mono text-sm animate-pulse">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="font-display text-xl font-semibold text-white/85">Settings</h1>

      {saved && (
        <div className="glass rounded-xl px-4 py-3 border-emerald-400/20 text-emerald-400 text-sm font-mono">
          ✓ Settings saved
        </div>
      )}

      {/* Regional */}
      <section className="glass-static rounded-2xl p-6 space-y-5">
        <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Regional</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">Currency</span>
            <select
              value={settings.currency as string ?? DEFAULT_CURRENCY.toLowerCase()}
              onChange={(e) => handleSave("currency", e.target.value)}
              className="w-full"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">Timezone</span>
            <select
              value={settings.timezone as string ?? "Asia/Colombo"}
              onChange={(e) => handleSave("timezone", e.target.value)}
              className="w-full"
            >
              {TIMEZONES.map((t) => (
                <option key={t.tz} value={t.tz}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Prediction Defaults */}
      <section className="glass-static rounded-2xl p-6 space-y-5">
        <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Prediction Defaults</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">History Days</span>
            <input
              type="number"
              min={7} max={365}
              value={settings.history_days as number ?? 30}
              onChange={(e) => handleSave("history_days", parseInt(e.target.value))}
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">Predict Days</span>
            <input
              type="number"
              min={1} max={60}
              value={settings.predict_days as number ?? 7}
              onChange={(e) => handleSave("predict_days", parseInt(e.target.value))}
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">Samples (GPU)</span>
            <input
              type="number"
              min={10} max={100}
              value={settings.num_samples as number ?? 20}
              onChange={(e) => handleSave("num_samples", parseInt(e.target.value))}
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-white/35 text-[11px] font-mono block mb-2">News Window (hours)</span>
            <input
              type="number"
              min={1} max={48}
              value={settings.news_hours_back as number ?? 12}
              onChange={(e) => handleSave("news_hours_back", parseInt(e.target.value))}
              className="w-full"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.include_reddit as boolean ?? true}
            onChange={(e) => handleSave("include_reddit", e.target.checked)}
          />
          <span className="text-white/45 text-[11px] font-mono group-hover:text-white/65 transition-colors">Include Reddit sentiment</span>
        </label>
      </section>

      {/* About */}
      <section className="glass-static rounded-2xl p-6 space-y-3 font-mono">
        <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Stack</h2>
        {[
          ["AI Forecast",  "amazon/chronos-2"],
          ["Sentiment",    "claude-haiku-4-5"],
          ["Price Data",   "CoinGecko API"],
          ["Hardware",     "RTX 3050 6GB · CUDA 12.1"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-white/30 text-[11px]">{label}</span>
            <span className="text-cyan-400 text-[11px]">{value}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
