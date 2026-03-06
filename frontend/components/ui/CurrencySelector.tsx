"use client";

import { CURRENCIES } from "@/lib/constants";

interface Props {
  value:    string;
  onChange: (currency: string) => void;
}

export function CurrencySelector({ value, onChange }: Props) {
  return (
    <select
      value={value.toUpperCase()}
      onChange={(e) => onChange(e.target.value.toLowerCase())}
      className="bg-oracle-surface border border-oracle-border rounded px-2 py-1 text-oracle-text text-xs font-mono focus:border-oracle-cyan outline-none"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code}
        </option>
      ))}
    </select>
  );
}
