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
    <aside className="w-64 flex flex-col shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.018)', backdropFilter: 'blur(24px)' }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <OracleLogo size={40} />
          <div>
            <div className="text-sm font-bold tracking-[0.15em] text-white font-mono leading-tight">
              CRYPTO ORACLE
            </div>
            <div className="text-[11px] text-white/35 mt-0.5">AI Price Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-0.5">
        {NAV_LINKS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              path === href
                ? "bg-white/[0.10] text-white border-l-2 border-cyan-400 rounded-l-none shadow-sm"
                : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
            )}
          >
            <span className="font-mono text-base leading-none w-5 text-center opacity-80">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Watchlist */}
      <div className="flex-1 overflow-y-auto border-t border-white/[0.05]">
        <WatchList />
      </div>

      {/* Services status */}
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.2em] mb-3">Services</p>
        <div className="space-y-2.5">
          <ApiHealthDot label="Chronos GPU" live />
          <ApiHealthDot label="CoinGecko"  />
          <ApiHealthDot label="News RSS"   />
        </div>
      </div>
    </aside>
  );
}

function ApiHealthDot({ label, live }: { label: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={clsx(
        "w-1.5 h-1.5 rounded-full flex-shrink-0",
        live
          ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"
          : "bg-emerald-400"
      )} />
      <span className="text-[11px] font-mono text-white/35">{label}</span>
    </div>
  );
}
