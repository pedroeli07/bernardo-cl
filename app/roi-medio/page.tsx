"use client"

import { Suspense } from "react"
import { RoiMedioContent } from "./roi-medio-content"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import dataService from "@/lib/data-service"
import { DashboardStats } from "@/types/dashboard"

// Loading component for Suspense
const LoadingState = () => (
  <div className="container py-6 flex flex-col items-center justify-center min-h-[40vh]">
    <Loader2 className="h-12 w-12 animate-spin text-steelersGold mb-4" />
    <p className="text-lg font-medium">Carregando dados de ROI...</p>
    <p className="text-sm text-muted-foreground">Processando estatísticas, por favor aguarde.</p>
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Use the data service to get dashboard stats
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
    return <LoadingState />;
  }

  if (error || !stats) {
    return <ErrorState error={error || new Error("Dados não disponíveis")} />;
  }

  return <>{children(stats)}</>;
};

// Main ROI Medio page component
export default function RoiMedioPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DataLoader>
        {(stats) => <RoiMedioContent stats={stats} />}
      </DataLoader>
    </Suspense>
  );
}

