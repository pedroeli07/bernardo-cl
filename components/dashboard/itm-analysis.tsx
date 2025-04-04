"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercentage } from "@/lib/utils"
import { Target } from "lucide-react"

interface ITMStats {
  overall: {
    totalTournaments: number
    itmTournaments: number
    itmPercentage: number
  }
  postBigWins: {
    firstPeriod: {
      totalTournaments: number
      itmTournaments: number
      itmPercentage: number
      startDate: Date | string
      endDate: Date | string
    }
    secondPeriod: {
      totalTournaments: number
      itmTournaments: number
      itmPercentage: number
      startDate: Date | string
      endDate: Date | string
    }
  }
}

interface ITMAnalysisProps {
  itmStats: ITMStats
}

export function ITMAnalysis({ itmStats }: ITMAnalysisProps) {
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    if (typeof dateString === 'string') {
      return dateString
    }
    return new Intl.DateTimeFormat('pt-BR').format(dateString)
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Target className="mr-2 h-5 w-5 text-steelersGold" />
          Análise ITM (In The Money)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">ITM Geral</div>
            <div className="text-2xl font-bold text-steelersGold font-mono">
              {formatPercentage(itmStats.overall.itmPercentage)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {itmStats.overall.itmTournaments} de {itmStats.overall.totalTournaments} torneios
            </div>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Pós $134k (2022)</div>
            <div className="text-2xl font-bold text-steelersGold font-mono">
              {formatPercentage(itmStats.postBigWins.firstPeriod.itmPercentage)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {itmStats.postBigWins.firstPeriod.itmTournaments} de {itmStats.postBigWins.firstPeriod.totalTournaments} torneios
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(itmStats.postBigWins.firstPeriod.startDate)} a {formatDate(itmStats.postBigWins.firstPeriod.endDate)}
            </div>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Pós BSOP (2023)</div>
            <div className="text-2xl font-bold text-steelersGold font-mono">
              {formatPercentage(itmStats.postBigWins.secondPeriod.itmPercentage)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {itmStats.postBigWins.secondPeriod.itmTournaments} de {itmStats.postBigWins.secondPeriod.totalTournaments} torneios
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(itmStats.postBigWins.secondPeriod.startDate)} a {formatDate(itmStats.postBigWins.secondPeriod.endDate)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="text-sm font-medium mb-2">Análise de Tendência</div>
          <p className="text-sm text-muted-foreground">
            {itmStats.postBigWins.secondPeriod.itmPercentage > itmStats.postBigWins.firstPeriod.itmPercentage
              ? 'Melhoria consistente na taxa ITM após grandes vitórias, sugerindo crescimento na consistência e tomada de decisão.'
              : 'Variação na performance ITM após grandes vitórias, indicando potencial impacto na estratégia de jogo ou abordagem de torneios.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 