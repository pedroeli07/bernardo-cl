"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoiChart } from "@/components/charts/roi-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useMemo } from "react"
import { useStore, CalculatedStats } from "@/lib/store"
import { DashboardStats } from "@/types/dashboard"

export interface RoiMedioContentProps {
  stats: DashboardStats;
}

export function RoiMedioContent({ stats }: RoiMedioContentProps) {
  // Get calculated data from store or calculate and store it
  const { calculatedStats, setCalculatedStats } = useStore()
  
  // Calculate all stats data once and memoize it
  const {
    sortedMonthlyROI,
    roiByTypeData,
    roiByBuyInData,
    tournamentTypeStats
  } = useMemo(() => {
    // If we already have calculated stats, use them
    if (calculatedStats) {
      console.log("Using memoized calculated stats")
      return calculatedStats
    }
    
    console.log("Calculating stats and memoizing")
    
    // Sort monthly ROI data by ROI value
    const sortedMonthlyROI = [...stats.monthlyROIData].sort((a, b) => b.roi - a.roi)

    // Prepare data for ROI by tournament type chart with the exact same methodology as dashboard
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
    }

    // Calculate tournament type stats with exact same method as dashboard
    const tournamentTypeStats = Object.entries(stats.tournamentsByType)
      .map(([type, tournaments]) => {
        const count = tournaments.length
        const percentage = (count / stats.totalTournaments) * 100
        const profit = tournaments.reduce((sum, t) => sum + t.profit, 0)
        const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0)
        const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

        return {
          type,
          label: typeLabels[type as keyof typeof typeLabels] || type,
          count,
          percentage,
          profit,
          roi
        }
      })
      .sort((a, b) => b.percentage - a.percentage)

    // For charts: Use the same calculated data but format for charts
    const roiByTypeData = tournamentTypeStats.map(item => ({
      type: item.label,
      roi: item.roi,
      profit: item.profit,
      count: item.count
    }))
    .sort((a, b) => b.roi - a.roi)

    // Prepare data for ROI by buy-in range chart
    const roiByBuyInData = Object.entries(stats.tournamentsByBuyInRange)
      .map(([range, tournaments]) => {
        const count = tournaments.length
        const profit = tournaments.reduce((sum: number, t: { profit: number }) => sum + t.profit, 0)
        const totalBuyIn = tournaments.reduce((sum: number, t: { buyIn?: number }) => sum + (t.buyIn || 0), 0)
        const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

        const rangeLabels: Record<string, string> = {
          "$0~33": "$0-33 (Micro)",
          "$33~60": "$33-60 (Low)",
          "$60~130": "$60-130 (Medium)",
          "$130~450": "$130-450 (High)",
          "$500~990": "$500-990 (VHigh)",
          "$1k+": "$1k+ (Ultra)",
        }

        return {
          range: rangeLabels[range as keyof typeof rangeLabels] || range,
          roi,
          profit,
          count,
        }
      })
      .sort((a, b) => b.roi - a.roi)
    
    // Store the calculated data for future use
    const calculatedData = {
      sortedMonthlyROI,
      roiByTypeData,
      roiByBuyInData,
      tournamentTypeStats
    }
    
    setCalculatedStats(calculatedData)
    
    return calculatedData
  }, [stats, calculatedStats, setCalculatedStats])

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold gradient-text">ROI Médio</h1>

      <RoiChart data={stats.monthlyROIData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ROI por Tipo de Torneio</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                roi: {
                  label: "ROI (%)",
                  color: "hsl(var(--steelers-gold))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiByTypeData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                  <XAxis dataKey="type" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickMargin={10} />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "monospace" }}
                    tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${Number(value).toFixed(2)}%`, "ROI"]}
                    labelFormatter={(label) => `Tipo: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>{value}</span>}
                  />
                  <Bar dataKey="roi" fill="hsl(var(--steelers-gold))" name="ROI (%)" radius={[4, 4, 0, 0]}>
                    {roiByTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.roi >= 0 ? "hsl(var(--steelers-gold))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-xs text-muted-foreground text-center mt-4">
              ROI médio por categoria de torneio, valores maiores indicam melhor desempenho
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ROI por Faixa de Buy-in</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                roi: {
                  label: "ROI (%)",
                  color: "hsl(var(--steelers-gold))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiByBuyInData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickMargin={10}
                    angle={-45}
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "monospace" }}
                    tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${Number(value).toFixed(2)}%`, "ROI"]}
                    labelFormatter={(label) => `Buy-in: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>{value}</span>}
                  />
                  <Bar dataKey="roi" fill="hsl(var(--steelers-gold))" name="ROI (%)" radius={[4, 4, 0, 0]}>
                    {roiByBuyInData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.roi >= 0 ? "hsl(var(--steelers-gold))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-xs text-muted-foreground text-center mt-4">
              ROI médio por faixa de buy-in, mostrando em quais valores há melhor retorno
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Melhores Meses por ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Torneios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMonthlyROI.slice(0, 10).map((data: { month: string; roi: number }) => {
                    // Find the monthly stats from all available sources
                    const monthStats = stats.monthlyStats?.find((s) => s.month === data.month) ||
                      stats.postBigWinStats.firstBigWin.find((s) => s.month === data.month) ||
                      stats.postBigWinStats.secondBigWin.find((s) => s.month === data.month) || 
                      { count: 0, profit: 0 }

                    return (
                      <TableRow key={data.month}>
                        <TableCell className="font-medium">{data.month}</TableCell>
                        <TableCell className={`${data.roi >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                          {formatPercentage(data.roi)}
                        </TableCell>
                        <TableCell className={`${monthStats.profit >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                          {formatCurrency(monthStats.profit)}
                        </TableCell>
                        <TableCell className="font-mono font-medium">{monthStats.count}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ROI por Tipo de Torneio</CardTitle>
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
                  {tournamentTypeStats.map((item: { 
                    type: string;
                    label: string;
                    count: number;
                    percentage: number;
                    profit: number;
                    roi: number;
                  }) => (
                    <TableRow key={item.type}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="font-mono font-medium">{item.count}</TableCell>
                      <TableCell className={`${item.profit >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                        {formatCurrency(item.profit)}
                      </TableCell>
                      <TableCell className={`${item.roi >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                        {formatPercentage(item.roi)}
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
          <CardTitle className="text-lg font-medium">ROI por Faixa de Buy-in</CardTitle>
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
                {Object.entries(stats.tournamentsByBuyInRange).map(([range, tournaments]) => {
                  const count = tournaments.length
                  const profit = tournaments.reduce((sum: number, t: { profit: number }) => sum + t.profit, 0)
                  const totalBuyIn = tournaments.reduce((sum: number, t: { buyIn?: number }) => sum + (t.buyIn || 0), 0)
                  const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

                  const rangeLabels: Record<string, string> = {
                    "$0~33": "$0-33 (Micro)",
                    "$33~60": "$33-60 (Low)",
                    "$60~130": "$60-130 (Medium)",
                    "$130~450": "$130-450 (High)",
                    "$500~990": "$500-990 (VHigh)",
                    "$1k+": "$1k+ (Ultra)",
                  }

                  return (
                    <TableRow key={range}>
                      <TableCell className="font-medium">{rangeLabels[range as keyof typeof rangeLabels] || range}</TableCell>
                      <TableCell className="font-mono font-medium">{count}</TableCell>
                      <TableCell className={`${profit >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                        {formatCurrency(profit)}
                      </TableCell>
                      <TableCell className={`${roi >= 0 ? "text-green-500" : "text-red-500"} font-mono font-medium`}>
                        {formatPercentage(roi)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 