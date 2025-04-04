"use client"

import { Button } from "@/components/ui/button"
import { MonthlyStatsTable } from "@/components/dashboard/monthly-stats-table"
import { PostBigWinAnalysis } from "@/components/dashboard/post-big-win-analysis"
import { EnhancedProfitChart } from "@/components/charts/enhanced-profit-chart"
import { TrendAnalysis } from "@/components/dashboard/trend-analysis"
import { ITMAnalysis } from "@/components/dashboard/itm-analysis"
import { EliminationPhasesAnalysis } from "@/components/dashboard/elimination-phases-analysis"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Download, FileText, Loader2 } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { DossieData } from "@/types/dossie"
import { DashboardStats } from "@/types/dashboard"
import dataService from "@/lib/data-service"
import { ProfitChart } from "@/components/charts/profit-chart"
import { DossieConclusion } from "@/components/conclusions"

// Loading component for Suspense
const LoadingState = () => (
  <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh]">
    <Loader2 className="h-12 w-12 animate-spin text-steelersGold mb-4" />
    <p className="text-lg font-medium">Carregando dossiê completo...</p>
    <p className="text-sm text-muted-foreground">Processando dados de 34 mil torneios, por favor aguarde.</p>
  </div>
);

// Error component
const ErrorState = ({ error }: { error: Error }) => (
  <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh]">
    <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-lg">
      <h3 className="text-lg font-bold mb-2">Erro ao carregar dados</h3>
      <p className="mb-4">{error.message}</p>
      <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
    </div>
  </div>
);

// Data loading component
const DataLoader = ({ children }: { children: (data: DossieData, stats: DashboardStats) => React.ReactNode }) => {
  const [data, setData] = useState<DossieData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("Iniciando...");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // First try to get data from the store
        setLoadingProgress("Buscando dados armazenados...");
        
        // Fetch data using the data service (which will use web workers)
        setLoadingProgress("Buscando dados de torneios...");
        
        // Use Promise.all to fetch both datasets in parallel
        const [dossieData, dashboardStats] = await Promise.all([
          dataService.getDossieData(),
          dataService.getDashboardStats()
        ]);

        setData(dossieData);
        setStats(dashboardStats);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-steelersGold mb-4" />
        <p className="text-lg font-medium">Carregando dossiê completo...</p>
        <p className="text-sm text-muted-foreground">{loadingProgress}</p>
      </div>
    );
  }

  if (error || !data || !stats) {
    return <ErrorState error={error || new Error("Dados não disponíveis")} />;
  }

  return <>{children(data, stats)}</>;
};

// Main dossie page component
export default function DossiePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DataLoader>
        {(data, stats) => (
          <DossieContent data={data} stats={stats} />
        )}
      </DataLoader>
    </Suspense>
  );
}

// The actual dossie content component
function DossieContent({ data, stats }: { data: DossieData, stats: DashboardStats }) {
  // Prepare big hit dates for the profit chart
  const bigHitDates = [
    {
      date: "23/05/2022",
      prize: 134000,
      label: "$134k",
    },
    {
      date: "06/04/2023",
      prize: 50000,
      label: "BSOP",
    },
  ];

  // Prepare trend data
  const profitTrend = stats.monthlyROIData.map((item) => {
    const monthStats = stats.postBigWinStats.firstBigWin.find((s) => s.month === item.month) ||
      stats.postBigWinStats.secondBigWin.find((s) => s.month === item.month) ||
      stats.monthlyStats?.find((s) => s.month === item.month);

    return {
      month: item.month,
      profit: monthStats?.profit || 0,
    };
  });

  const roiTrend = stats.monthlyROIData;

  const buyInTrend = stats.monthlyROIData.map((item) => {
    const monthStats = stats.postBigWinStats.firstBigWin.find((s) => s.month === item.month) ||
      stats.postBigWinStats.secondBigWin.find((s) => s.month === item.month) ||
      stats.monthlyStats?.find((s) => s.month === item.month);

    return {
      month: item.month,
      avgBuyIn: monthStats?.avgBuyIn || 0,
    };
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold gradient-text">Dossiê Completo</h1>
        <Button className="bg-steelersGold text-steelersBlack hover:bg-steelersGold/90">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="space-y-6">
        <EnhancedProfitChart data={stats.cumulativeProfitData} bigHitDates={bigHitDates} />
       

        <TrendAnalysis profitTrend={profitTrend} roiTrend={roiTrend} buyInTrend={buyInTrend} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ITMAnalysis itmStats={data.itmStats} />
          <EliminationPhasesAnalysis eliminationPhases={data.eliminationPhases} />
        </div>

        <MonthlyStatsTable data={data.monthlyStats} title="Estatísticas Mensais" />

        <PostBigWinAnalysis
          firstBigWin={data.postBigWinStats.firstBigWin}
          secondBigWin={data.postBigWinStats.secondBigWin}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Análise por Faixa de Buy-in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Torneios</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.buyInRangeStats.map((stats) => (
                      <TableRow key={stats.range}>
                        <TableCell className="font-medium">{stats.range}</TableCell>
                        <TableCell>{stats.count}</TableCell>
                        <TableCell className={stats.profit >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatCurrency(stats.profit)}
                        </TableCell>
                        <TableCell className={stats.roi >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(stats.roi)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Análise por Tipo de Torneio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Torneios</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.typeStats.map((stats) => (
                      <TableRow key={stats.type}>
                        <TableCell className="font-medium">
                          {stats.type === "psko"
                            ? "PSKO (Bounty)"
                            : stats.type === "vanilla"
                              ? "Vanilla (Regulares)"
                              : stats.type === "hyper"
                                ? "Hyper (Rápidos)"
                                : stats.type}
                        </TableCell>
                        <TableCell>{stats.count}</TableCell>
                        <TableCell className={stats.profit >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatCurrency(stats.profit)}
                        </TableCell>
                        <TableCell className={stats.roi >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(stats.roi)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Conclusões e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DossieConclusion data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

