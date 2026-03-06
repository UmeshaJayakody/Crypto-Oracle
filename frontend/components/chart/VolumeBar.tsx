"use client";

interface VolumePoint {
  timestamp: string;
  volume:    number;
}

interface Props {
  data:   VolumePoint[];
  height?: number;
}

export function VolumeBar({ data, height = 40 }: Props) {
  if (!data.length) return null;
  const maxVol = Math.max(...data.map((d) => d.volume));

  return (
    <div className="flex items-end gap-px" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-oracle-cyan/20 hover:bg-oracle-cyan/40 transition-colors rounded-t"
          style={{ height: `${(d.volume / maxVol) * 100}%` }}
          title={`Volume: ${d.volume.toLocaleString()}`}
        />
      ))}
    </div>
  );
}
