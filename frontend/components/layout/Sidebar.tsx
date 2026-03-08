"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { WatchList } from "@/components/market/WatchList";
import { OracleLogo } from "@/components/ui/OracleLogo";

const NAV_LINKS = [
  { href: "/",         label: "Dashboard",  icon: "◈" },
  { href: "/news",     label: "News",       icon: "◎" },
  { href: "/settings", label: "Settings",   icon: "◇" },
] as const;

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 flex flex-col bg-oracle-surface border-r border-oracle-border shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-oracle-border">
        <div className="flex items-center gap-3">
          <OracleLogo size={36} />
          <div>
            <div className="font-mono text-sm font-bold text-oracle-cyan tracking-widest">
              CRYPTO ORACLE
            </div>
            <div className="text-oracle-muted text-xs">AI Price Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 space-y-1">
        {NAV_LINKS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
              path === href
                ? "bg-oracle-cyan/10 text-oracle-cyan border border-oracle-cyan/20"
                : "text-oracle-muted hover:text-oracle-text hover:bg-oracle-card"
            )}
          >
            <span className="font-mono text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Watchlist */}
      <div className="flex-1 overflow-y-auto border-t border-oracle-border">
        <WatchList />
      </div>

      {/* API Health */}
      <div className="px-3 py-3 border-t border-oracle-border space-y-1">
        <div className="text-oracle-muted text-xs uppercase tracking-wider mb-2 font-mono">Services</div>
        <ApiHealthDot label="Chronos" endpoint="/health" />
        <ApiHealthDot label="CoinGecko" static="ok" />
        <ApiHealthDot label="News RSS"  static="ok" />
      </div>
    </aside>
  );
}

function ApiHealthDot({
  label,
  endpoint,
  static: staticStatus,
}: {
  label: string;
  endpoint?: string;
  static?: "ok" | "err";
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <div className={clsx(
        "w-1.5 h-1.5 rounded-full",
        staticStatus === "ok" ? "bg-oracle-emerald" : "bg-oracle-emerald animate-pulse"
      )} />
      <span className="text-oracle-muted">{label}</span>
    </div>
  );
}
