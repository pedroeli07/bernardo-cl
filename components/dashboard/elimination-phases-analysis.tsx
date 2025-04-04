"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercentage } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Award } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PhaseData {
  count: number
  description: string
  percentage: number
}

interface EliminationPhases {
  overall: Record<string, PhaseData>
  validTournaments: number
  postBigWins: {
    firstPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date | string
      endDate: Date | string
    }
    secondPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date | string
      endDate: Date | string
    }
  }
}

interface EliminationPhasesAnalysisProps {
  eliminationPhases: EliminationPhases
}

// Define colors for the pie chart
const COLORS = ["#D5A823", "#005A8D", "#9A7D0A", "#2F8AC4", "#6D5800", "#26486E"]

// Labels for the elimination phases
const PHASE_LABELS = {
  early: "Fase Inicial",
  middle: "Fase Intermediária",
  late: "Fase Final",
  finalTable: "Mesa Final",
  thirdPlace: "Top 3",
  winner: "Campeão"
}

export function EliminationPhasesAnalysis({ eliminationPhases }: EliminationPhasesAnalysisProps) {
  // Format dates for display
  const formatDate = (dateString: string | Date) => {
    if (typeof dateString === 'string') {
      return dateString
    }
    return new Intl.DateTimeFormat('pt-BR').format(dateString)
  }

  // Prepare chart data for overall stats
  const prepareChartData = (phases: Record<string, PhaseData>) => {
    return Object.entries(phases).map(([key, data]) => ({
      name: PHASE_LABELS[key as keyof typeof PHASE_LABELS] || key,
      value: data.percentage * 100,
      count: data.count,
      key
    }))
  }

  const overallData = prepareChartData(eliminationPhases.overall)
  const firstPeriodData = prepareChartData(eliminationPhases.postBigWins.firstPeriod.phases)
  const secondPeriodData = prepareChartData(eliminationPhases.postBigWins.secondPeriod.phases)

  // Custom formatter for tooltip to handle any value type safely
  const tooltipFormatter = (value: any, name: string, props: any) => {
    const numValue = typeof value === 'number' ? value : 0
    return [`${numValue.toFixed(1)}% (${props.payload.count})`, name]
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Award className="mr-2 h-5 w-5 text-steelersGold" />
          Análise de Fases de Eliminação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="post134k">Pós $134k</TabsTrigger>
            <TabsTrigger value="postBSOP">Pós BSOP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="space-y-4">
            <div className="text-center text-sm text-muted-foreground pb-2">
              Baseado em {eliminationPhases.validTournaments} torneios com dados de fase
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={overallData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {overallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Final Tables</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.overall.finalTable?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Top 3</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.overall.thirdPlace?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Vitórias</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.overall.winner?.percentage || 0)}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="post134k" className="space-y-4">
            <div className="text-center text-sm text-muted-foreground pb-2">
              {formatDate(eliminationPhases.postBigWins.firstPeriod.startDate)} a {formatDate(eliminationPhases.postBigWins.firstPeriod.endDate)}
              <br />
              {eliminationPhases.postBigWins.firstPeriod.validTournaments} torneios
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={firstPeriodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {firstPeriodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Final Tables</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.firstPeriod.phases.finalTable?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Top 3</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.firstPeriod.phases.thirdPlace?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Vitórias</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.firstPeriod.phases.winner?.percentage || 0)}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="postBSOP" className="space-y-4">
            <div className="text-center text-sm text-muted-foreground pb-2">
              {formatDate(eliminationPhases.postBigWins.secondPeriod.startDate)} a {formatDate(eliminationPhases.postBigWins.secondPeriod.endDate)}
              <br />
              {eliminationPhases.postBigWins.secondPeriod.validTournaments} torneios
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={secondPeriodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {secondPeriodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Final Tables</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.secondPeriod.phases.finalTable?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Top 3</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.secondPeriod.phases.thirdPlace?.percentage || 0)}
                </p>
              </div>
              <div className="bg-background/50 p-2 rounded-lg">
                <p className="text-muted-foreground">Vitórias</p>
                <p className="text-lg font-bold text-primary">
                  {formatPercentage(eliminationPhases.postBigWins.secondPeriod.phases.winner?.percentage || 0)}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-4 text-sm text-muted-foreground">
          <p className="mb-2">
            <span className="font-medium">Análise:</span> 
            {(eliminationPhases.postBigWins.firstPeriod.phases.finalTable?.percentage || 0) > 
             (eliminationPhases.overall.finalTable?.percentage || 0) &&
             (eliminationPhases.postBigWins.secondPeriod.phases.finalTable?.percentage || 0) > 
             (eliminationPhases.overall.finalTable?.percentage || 0)
              ? ' Aumento na frequência de mesas finais após grandes vitórias, sugerindo impacto positivo na confiança e tomada de decisão em fases críticas.'
              : ' Variação na distribuição de eliminações após grandes vitórias, indicando possível ajuste de estratégia ou pressão nos períodos subsequentes.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 