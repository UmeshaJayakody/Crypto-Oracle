const SOURCE_COLORS: Record<string, string> = {
  "CoinTelegraph": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "CoinDesk":      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Decrypt":       "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Reuters":       "bg-gray-500/15 text-gray-300 border-gray-500/30",
  "Bitcoin.com":   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "CryptoSlate":   "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_COLORS[source] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-mono ${style}`}>
      {source}
    </span>
  );
}
