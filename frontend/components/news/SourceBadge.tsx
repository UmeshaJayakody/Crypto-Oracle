const SOURCE_STYLES: Record<string, string> = {
  "CoinTelegraph": "text-orange-300/80 border-orange-400/20  bg-orange-400/[0.07]",
  "CoinDesk":      "text-blue-300/80   border-blue-400/20    bg-blue-400/[0.07]",
  "Decrypt":       "text-purple-300/80 border-purple-400/20  bg-purple-400/[0.07]",
  "Reuters":       "text-white/55      border-white/15       bg-white/[0.04]",
  "Bitcoin.com":   "text-amber-300/80  border-amber-400/20   bg-amber-400/[0.07]",
  "CryptoSlate":   "text-cyan-300/80   border-cyan-400/20    bg-cyan-400/[0.07]",
};

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] ?? "text-white/40 border-white/10 bg-white/[0.04]";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-lg border text-[10px] font-mono font-medium ${style}`}>
      {source}
    </span>
  );
}
