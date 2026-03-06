import { clsx } from "clsx";

interface Props {
  className?: string;
  lines?:     number;
}

export function LoadingSkeleton({ className, lines = 1 }: Props) {
  if (lines === 1) {
    return <div className={clsx("skeleton rounded", className)} />;
  }
  return (
    <div className={clsx("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={clsx("skeleton h-4 rounded", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
