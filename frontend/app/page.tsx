import { GlobalStats } from "@/components/market/GlobalStats";
import { MarketOverview } from "@/components/market/MarketOverview";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <GlobalStats />
      <MarketOverview />
    </div>
  );
}
