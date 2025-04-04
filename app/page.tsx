"use client"

import { Button } from "@/components/ui/button"
import { ProfitChart } from "@/components/charts/profit-chart"
import { RoiChart } from "@/components/charts/roi-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { TournamentTypesBreakdown } from "@/components/dashboard/tournament-types-breakdown"
import { BuyInRangeBreakdown } from "@/components/dashboard/buy-in-range-breakdown"
import { Award, Calendar, DollarSign, Trophy, Loader2, BarChart, CreditCard } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Link from "next/link"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useStore, CalculatedStats } from "@/lib/store"
import { DashboardStats } from "@/types/dashboard"
import dataService from "@/lib/data-service"

// Loading component for Suspense
const LoadingState = () => (
  <div className="container py-6 flex flex-col items-center justify-center min-h-[40vh]">
    <Loader2 className="h-12 w-12 animate-spin text-steelersGold mb-4" />
    <p className="text-lg font-medium">Carregando dashboard...</p>
    <p className="text-sm text-muted-foreground">Processando dados de torneios, por favor aguarde.</p>
  </div>
);

// Error component
const ErrorState = ({ error }: { error: Error }) => (
  <div className="container py-6 flex flex-col items-center justify-center min-h-[40vh]">
    <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-lg">
      <h3 className="text-lg font-bold mb-2">Erro ao carregar dados</h3>
      <p className="mb-4">{error.message}</p>
      <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
    </div>
  </div>
);

// Data loading component
const DataLoader = ({ children }: { children: (data: DashboardStats) => React.ReactNode }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("Iniciando...");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress("Buscando dados armazenados...");
        
        // Fetch data using the data service (which will use web workers)
        setLoadingProgress("Processando dados com web worker...");
        const dashboardStats = await dataService.getDashboardStats();
        
        setStats(dashboardStats);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="h-12 w-12 animate-spin text-steelersGold mb-4" />
        <p className="text-lg font-medium">Carregando dashboard...</p>
        <p className="text-sm text-muted-foreground">{loadingProgress}</p>
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState error={error || new Error("Dados não disponíveis")} />;
  }

  return <>{children(stats)}</>;
};

// Main dashboard page component
export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DataLoader>
        {(stats) => <DashboardContent stats={stats} />}
      </DataLoader>
    </Suspense>
  );
}

// The actual dashboard content component
function DashboardContent({ stats }: { stats: DashboardStats }) {
  const { calculatedStats, setCalculatedStats } = useStore();

  // Calculate stats data or use memoized version
  const {
    tournamentTypeData,
    tournamentTypeDetails,
    buyInRangeData,
    buyInRangeDetails
  } = useMemo(() => {
    // If we have calculated stats, use them
    if (calculatedStats) {
      // Convert the stored tournament type stats to the format needed for the dashboard
      const tournamentTypeData = calculatedStats.tournamentTypeStats.map(item => ({
        label: item.label,
        value: item.count,
        percentage: item.percentage,
        profit: item.profit,
        roi: item.roi,
        count: item.count
      }));
      
      // Calculate additional stats for tournament types
      const tournamentTypeDetails = {
        totalValue: stats.totalTournaments,
        totalProfit: stats.totalProfit,
        avgRoi: stats.roi,
        bestPerformer: tournamentTypeData.reduce((best, current) => 
          current.roi > (best?.roi || -Infinity) ? current : best, null as any)
      };
      
      // Use the buy-in range data as is
      const buyInRangeData = calculatedStats.roiByBuyInData.map(item => ({
        label: item.range,
        value: item.count,
        percentage: (item.count / stats.totalTournaments) * 100,
        profit: item.profit,
        roi: item.roi,
        count: item.count
      }));
      
      // Calculate additional stats for buy-in range
      const buyInRangeDetails = {
        totalValue: stats.totalTournaments,
        totalProfit: stats.totalProfit,
        avgRoi: stats.roi,
        bestPerformer: buyInRangeData.reduce((best, current) => 
          current.roi > (best?.roi || -Infinity) ? current : best, null as any)
      };
      
      return {
        tournamentTypeData,
        tournamentTypeDetails,
        buyInRangeData,
        buyInRangeDetails
      };
    }
    
    // Original calculation logic if not found in store
    // Prepare data for tournament type breakdown
    const tournamentTypeData = Object.entries(stats.tournamentsByType)
      .map(([type, tournaments]) => {
        const count = tournaments.length;
        const percentage = (count / stats.totalTournaments) * 100;
        const profit = tournaments.reduce((sum, t) => sum + t.profit, 0);
        const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
        const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;

        const typeLabels: Record<string, string> = {
          "Bounty Hyper": "Bounty Hyper",
          "Bounty Normal": "Bounty Normal", 
          "Satellite Hyper": "Satellite Hyper",
          "Satellite Normal": "Satellite Normal",
          "Vanilla Hyper": "Vanilla Hyper",
          "Vanilla Normal": "Vanilla Normal",
          "other": "Outros",
          // Manter tipos antigos para compatibilidade
          "psko": "PSKO (Legacy)",
          "vanilla": "Vanilla (Legacy)",
          "hyper": "Hyper (Legacy)"
        };

        return {
          label: typeLabels[type as keyof typeof typeLabels] || type,
          value: count,
          percentage,
          profit,
          roi,
          count
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    // Calculate additional stats for tournament types
    const tournamentTypeDetails = {
      totalValue: stats.totalTournaments,
      totalProfit: stats.totalProfit,
      avgRoi: stats.roi,
      bestPerformer: tournamentTypeData.reduce((best, current) => 
        current.roi > (best?.roi || -Infinity) ? current : best, null as any)
    };

    // Prepare data for buy-in range breakdown
    const buyInRangeData = Object.entries(stats.tournamentsByBuyInRange)
      .map(([range, tournaments]) => {
        const count = tournaments.length;
        const percentage = (count / stats.totalTournaments) * 100;
        const profit = tournaments.reduce((sum, t) => sum + t.profit, 0);
        const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
        const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;

        const rangeLabels: Record<string, string> = {
          "$0~33": "$0-33 (Micro)",
          "$33~60": "$33-60 (Low)",
          "$60~130": "$60-130 (Medium)",
          "$130~450": "$130-450 (High)",
          "$500~990": "$500-990 (VHigh)",
          "$1k+": "$1k+ (Ultra)",
        };

        return {
          label: rangeLabels[range as keyof typeof rangeLabels] || range,
          value: count,
          percentage,
          profit,
          roi,
          count
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    // Calculate additional stats for buy-in range
    const buyInRangeDetails = {
      totalValue: stats.totalTournaments,
      totalProfit: stats.totalProfit,
      avgRoi: stats.roi,
      bestPerformer: buyInRangeData.reduce((best, current) => 
        current.roi > (best?.roi || -Infinity) ? current : best, null as any)
    };
    
    // Store the calculated tournament type stats in our common format for reuse
    if (!calculatedStats) {
      // Format tournament type stats for memoization
      const tournamentTypeStats = tournamentTypeData.map(item => ({
        type: item.label,
        label: item.label,
        count: item.count,
        percentage: item.percentage,
        profit: item.profit,
        roi: item.roi
      }));
      
      // Format ROI by type data for charts
      const roiByTypeData = tournamentTypeStats.map(item => ({
        type: item.label,
        roi: item.roi,
        profit: item.profit,
        count: item.count
      }));
      
      // Format buy-in range data for charts
      const roiByBuyInData = buyInRangeData.map(item => ({
        range: item.label,
        roi: item.roi,
        profit: item.profit,
        count: item.count
      }));
      
      // Store all calculated data
      setCalculatedStats({
        sortedMonthlyROI: [...stats.monthlyROIData].sort((a, b) => b.roi - a.roi),
        roiByTypeData,
        roiByBuyInData,
        tournamentTypeStats
      });
    }

    return {
      tournamentTypeData,
      tournamentTypeDetails,
      buyInRangeData,
      buyInRangeDetails
    };
  }, [stats, calculatedStats, setCalculatedStats]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <Link href="/dossie">
          <Button className="bg-steelersGold text-steelersBlack hover:bg-steelersGold/90">Ver Dossiê Completo</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total de Torneios"
          value={stats.totalTournaments.toString()}
          description="Desde 15/09/2021"
          icon={Calendar}
        />
        <StatCard
          title="Profit Total"
          value={formatCurrency(stats.totalProfit)}
          description={`ROI: ${formatPercentage(stats.roi)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Maior Prêmio"
          value={formatCurrency(stats.highestPrize.prize)}
          description={new Date(stats.highestPrize.date).toLocaleDateString("pt-BR")}
          icon={Trophy}
        />
        <StatCard
          title="Melhor ROI Mensal"
          value={`${formatPercentage(stats.bestMonthlyRoi.roi)}`}
          description={stats.bestMonthlyRoi.month}
          icon={Award}
        />
        <StatCard
          title="ITM"
          value={`${formatPercentage(stats.itmRate || 0)}`}
          description="Torneios premiados (cash)"
          icon={BarChart}
        />
        <StatCard
          title="Buy-in Médio"
          value={formatCurrency(stats.avgBuyIn || 0)}
          description="Média de investimento"
          icon={CreditCard}
        />
      </div>

      <ProfitChart data={stats.cumulativeProfitData} />

      <RoiChart data={stats.monthlyROIData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TournamentTypesBreakdown 
          title="Torneios por Tipo" 
          data={stats.tournamentsByType}
          totalTournaments={stats.totalTournaments}
        />
        <BuyInRangeBreakdown 
          title="Torneios por Buy-in" 
          data={stats.tournamentsByBuyInRange}
          totalTournaments={stats.totalTournaments}
        />
      </div>
    </div>
  );
}

