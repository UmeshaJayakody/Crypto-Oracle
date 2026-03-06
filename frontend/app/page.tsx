import { GlobalStats } from "@/components/market/GlobalStats";
import { MarketOverview } from "@/components/market/MarketOverview";

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <GlobalStats />
      <MarketOverview />
    </div>
  );
}
