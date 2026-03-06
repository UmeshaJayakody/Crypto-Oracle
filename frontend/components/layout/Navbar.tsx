"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoinSearch } from "@/components/ui/CoinSearch";

export function Navbar() {
  const router = useRouter();

  return (
    <header className="flex items-center gap-4 px-4 py-2 bg-oracle-surface border-b border-oracle-border">
      <div className="flex-1 max-w-sm">
        <CoinSearch
          onSelect={(coinId) => router.push(`/coin/${coinId}`)}
          placeholder="Search coins..."
        />
      </div>
    </header>
  );
}
