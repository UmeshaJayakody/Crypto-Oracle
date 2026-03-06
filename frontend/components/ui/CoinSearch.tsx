"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { searchCoins } from "@/lib/api";

interface SearchResult {
  id:     string;
  name:   string;
  symbol: string;
  thumb:  string;
}

interface Props {
  onSelect:    (coinId: string) => void;
  placeholder?: string;
}

export function CoinSearch({ onSelect, placeholder = "Search coins..." }: Props) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchCoins(query);
        setResults(res);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (id: string) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    onSelect(id);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-oracle-surface border border-oracle-border rounded px-3 py-1.5 text-oracle-text text-sm font-mono placeholder:text-oracle-muted focus:border-oracle-cyan outline-none pr-8"
        />
        {loading && (
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-oracle-cyan" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-oracle-card border border-oracle-border rounded shadow-lg overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-oracle-surface transition-colors text-left"
            >
              {r.thumb && (
                <Image src={r.thumb} alt={r.name} width={18} height={18} className="rounded-full" />
              )}
              <span className="text-oracle-text text-sm">{r.name}</span>
              <span className="text-oracle-muted text-xs font-mono uppercase ml-auto">{r.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
