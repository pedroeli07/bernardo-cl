"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataService from "@/lib/data-service"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MensalConclusionAnalysis from "@/components/conclusions"

// Define tournament data type
interface Tournament {
  data: Date | string
  rede: string
  tipoTorneio: string
  buyIn: number
  entradas: number
  posicao: number | null
  prize: number
  profit: number
}

// Client-side function to get big hits data using the store
const getBigHits = async (): Promise<Tournament[]> => {
  const { bigHitsData, setBigHitsData, isDataFresh } = useStore.getState()
  
  try {
    // If we have data and it's fresh (less than 24 hours old), use it
    if (bigHitsData && isDataFresh()) {
      console.log("Using stored big hits data")
      return bigHitsData as Tournament[]
    }
    
    // If no valid data in store, fetch from API
    console.log("Fetching fresh big hits data from API")
    const res = await fetch('/api/big-hits')
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    const data = await res.json()
    
    // Store the data
    setBigHitsData(data)
    
    return data
  } catch (error) {
    console.error("Error fetching big hits:", error)
    return []
  }
}

// Get all tournament data
const getAllTournaments = async (): Promise<Tournament[]> => {
  try {
    const data = await DataService.getRawData()
    return data
  } catch (error) {
    console.error("Error fetching all tournaments:", error)
    return []
  }
}

export default function BigHitsPage() {
  const [bigHits, setBigHits] = useState<Tournament[]>([])
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([])
  const [sortColumn, setSortColumn] = useState<string>('prize')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [cumulativeChartData, setCumulativeChartData] = useState<any[]>([])
  const [compareChartData, setCompareChartData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const bigHitsData = await getBigHits()
        const allTournamentsData = await getAllTournaments()
        
        setBigHits(bigHitsData)
        setAllTournaments(allTournamentsData)
        
        // Generate chart data
        generateChartData(allTournamentsData, bigHitsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const generateChartData = (allData: Tournament[], bigHitsData: Tournament[]) => {
    if (!allData || allData.length === 0) return
    
    // Sort all tournaments by date
    const sortedTournaments = [...allData].sort((a, b) => {
      const dateA = new Date(a.data).getTime()
      const dateB = new Date(b.data).getTime()
      return dateA - dateB
    })
    
    // Create a map of big hits by date for quick lookup
    const bigHitsMap = new Map()
    bigHitsData.forEach(tournament => {
      const date = new Date(tournament.data)
      const dateStr = date.toISOString().split('T')[0]
      bigHitsMap.set(dateStr, tournament)
    })
    
    // Generate cumulative profit data
    let cumulativeProfit = 0
    let cumulativeProfitWithoutBigHits = 0
    const cumulativeData: any[] = []
    
    sortedTournaments.forEach(tournament => {
      const date = new Date(tournament.data)
      const dateStr = date.toISOString().split('T')[0]
      const isBigHit = bigHitsMap.has(dateStr)
      
      cumulativeProfit += tournament.profit
      
      // Only add to non-big hits profit if this isn't a big hit
      if (!isBigHit) {
        cumulativeProfitWithoutBigHits += tournament.profit
      }
      
      cumulativeData.push({
        date: dateStr,
        withBigHits: cumulativeProfit,
        withoutBigHits: cumulativeProfitWithoutBigHits
      })
    })
    
    // Use monthly points for a cleaner chart
    const monthlyData = aggregateByMonth(cumulativeData)
    
    setCumulativeChartData(monthlyData)
    
    // Create comparison data for monthly ROI
    const monthlyROIData = calculateMonthlyROI(sortedTournaments, bigHitsData)
    setCompareChartData(monthlyROIData)
  }
  
  // Aggregate data by month for charting
  const aggregateByMonth = (data: any[]): any[] => {
    if (data.length === 0) return []
    
    const monthlyMap = new Map()
    
    data.forEach(item => {
      const date = new Date(item.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // If this is a new month, add it to the map
      if (!monthlyMap.has(monthYear)) {
        monthlyMap.set(monthYear, {
          month: monthYear,
          withBigHits: item.withBigHits,
          withoutBigHits: item.withoutBigHits
        })
      } else {
        // Otherwise, update the last entry for the month
        const monthData = monthlyMap.get(monthYear)
        monthlyMap.set(monthYear, {
          ...monthData,
          withBigHits: item.withBigHits,
          withoutBigHits: item.withoutBigHits
        })
      }
    })
    
    // Convert map to array and sort by date
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        month: formatMonth(item.month) // Format for display
      }))
  }
  
  // Calculate monthly ROI with and without big hits
  const calculateMonthlyROI = (allTournaments: Tournament[], bigHitsData: Tournament[]): any[] => {
    if (allTournaments.length === 0) return []
    
    // Create a map for big hits by date
    const bigHitsSet = new Set()
    bigHitsData.forEach(tournament => {
      const date = new Date(tournament.data)
      const dateStr = date.toISOString().split('T')[0]
      bigHitsSet.add(dateStr)
    })
    
    // Group tournaments by month
    const monthlyData = new Map()
    
    allTournaments.forEach(tournament => {
      const date = new Date(tournament.data)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const dateStr = date.toISOString().split('T')[0]
      const isBigHit = bigHitsSet.has(dateStr)
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, {
          month: monthYear,
          withBigHits: { profit: 0, buyIn: 0 },
          withoutBigHits: { profit: 0, buyIn: 0 }
        })
      }
      
      const monthData = monthlyData.get(monthYear)
      
      // Always add to the "with big hits" data
      monthData.withBigHits.profit += tournament.profit
      monthData.withBigHits.buyIn += tournament.buyIn || 0
      
      // Only add to "without big hits" if this isn't a big hit
      if (!isBigHit) {
        monthData.withoutBigHits.profit += tournament.profit
        monthData.withoutBigHits.buyIn += tournament.buyIn || 0
      }
      
      monthlyData.set(monthYear, monthData)
    })
    
    // Calculate ROI and format for chart
    return Array.from(monthlyData.values())
      .map(data => {
        const withBigHitsROI = data.withBigHits.buyIn > 0 
          ? (data.withBigHits.profit / data.withBigHits.buyIn) * 100 
          : 0
        
        const withoutBigHitsROI = data.withoutBigHits.buyIn > 0 
          ? (data.withoutBigHits.profit / data.withoutBigHits.buyIn) * 100 
          : 0
        
        return {
          month: formatMonth(data.month),
          withBigHits: parseFloat(withBigHitsROI.toFixed(2)),
          withoutBigHits: parseFloat(withoutBigHitsROI.toFixed(2))
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
  }
  
  // Format month for display
  const formatMonth = (monthYear: string): string => {
    const [year, month] = monthYear.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${monthNames[parseInt(month) - 1]}/${year}`
  }

  // Format percentage with European style (17.320,87%)
  const formatPercentage = (value: number): string => {
    if (value === null || value === undefined) return 'N/A'
    
    // Format with period for thousands and comma for decimals
    return value.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%'
  }

  const handleSort = (column: string): void => {
    const newDirection = sortColumn === column && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortColumn(column)
    setSortDirection(newDirection)
  }

  const getSortedData = (): Tournament[] => {
    if (!bigHits || bigHits.length === 0) return []
    
    return [...bigHits].sort((a, b) => {
      let aValue: number = a[sortColumn as keyof Tournament] as number || 0
      let bValue: number = b[sortColumn as keyof Tournament] as number || 0
      
      // For ROI, calculate it
      if (sortColumn === 'roi') {
        aValue = a.buyIn ? (a.profit / a.buyIn) * 100 : 0
        bValue = b.buyIn ? (b.profit / b.buyIn) * 100 : 0
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
    })
  }

  const sortedData = getSortedData()

  // Calculate stats for the sorted data
  const totalPrize = sortedData.reduce((sum, t) => sum + (t.prize || 0), 0)
  const totalProfit = sortedData.reduce((sum, t) => sum + t.profit, 0)
  const totalBuyIn = sortedData.reduce((sum, t) => sum + (t.buyIn || 0), 0)
  const bigHitsROI = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0
  
  // Calculate stats excluding big hits
  const calculateComparisonStats = () => {
    if (!allTournaments || allTournaments.length === 0 || !bigHits || bigHits.length === 0) {
      return {
        totalTournaments: 0,
        totalProfit: 0,
        totalBuyIn: 0,
        avgROI: 0,
        itmRate: 0
      }
    }
    
    // Create a set of big hit dates for quick lookup
    const bigHitDates = new Set()
    bigHits.forEach(hit => {
      const date = new Date(hit.data).toISOString().split('T')[0]
      bigHitDates.add(date)
    })
    
    // Filter out tournaments that are big hits
    const regularTournaments = allTournaments.filter(t => {
      const date = new Date(t.data).toISOString().split('T')[0]
      return !bigHitDates.has(date)
    })
    
    const totalTournaments = regularTournaments.length
    const totalProfit = regularTournaments.reduce((sum, t) => sum + t.profit, 0)
    const totalBuyIn = regularTournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0)
    const avgROI = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0
    
    // Calculate ITM (In The Money) rate - assuming a position in top 15% is ITM
    const itmTournaments = regularTournaments.filter(t => 
      (t.prize && t.prize > 0) || (t.posicao && t.entradas && t.posicao <= t.entradas * 0.15)
    )
    const itmRate = totalTournaments > 0 ? (itmTournaments.length / totalTournaments) * 100 : 0
    
    return {
      totalTournaments,
      totalProfit,
      totalBuyIn,
      avgROI,
      itmRate
    }
  }
  
  const comparisonStats = calculateComparisonStats()

  // Helper to render sort icons
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
  }

  if (isLoading) {
    return <div className="container py-6">Carregando...</div>
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold gradient-text">Análise de Big Hits</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analysis">Análise Comparativa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-hover-effect border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total em Prêmios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-steelersGold font-mono">{formatCurrency(totalPrize)}</div>
                <p className="text-xs text-muted-foreground">Top 20 maiores prêmios</p>
              </CardContent>
            </Card>

            <Card className="card-hover-effect border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-steelersGold font-mono">{formatCurrency(totalProfit)}</div>
                <p className="text-xs text-muted-foreground">Dos maiores prêmios</p>
              </CardContent>
            </Card>

            <Card className="card-hover-effect border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-steelersGold font-mono">{formatPercentage(bigHitsROI)}</div>
                <p className="text-xs text-muted-foreground">Dos maiores prêmios</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Top 20 Maiores Prêmios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Rede</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead onClick={() => handleSort('buyIn')} className="cursor-pointer hover:text-steelersGold">
                        Buy-In {renderSortIcon('buyIn')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('prize')} className="cursor-pointer hover:text-steelersGold">
                        Prêmio {renderSortIcon('prize')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('profit')} className="cursor-pointer hover:text-steelersGold">
                        Profit {renderSortIcon('profit')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('roi')} className="cursor-pointer hover:text-steelersGold">
                        ROI {renderSortIcon('roi')}
                      </TableHead>
                      <TableHead>Entradas</TableHead>
                      <TableHead>Posição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((tournament, index) => {
                      const roiValue = tournament.buyIn ? (tournament.profit / tournament.buyIn) * 100 : null
                      return (
                        <TableRow key={index}>
                          <TableCell>{formatDate(tournament.data)}</TableCell>
                          <TableCell>{tournament.rede}</TableCell>
                          <TableCell>{tournament.tipoTorneio}</TableCell>
                          <TableCell className="font-mono font-medium">{formatCurrency(tournament.buyIn || 0)}</TableCell>
                          <TableCell className="text-steelersGold font-bold font-mono">
                            {formatCurrency(tournament.prize || 0)}
                          </TableCell>
                          <TableCell className={tournament.profit >= 0 ? "text-green-500 font-mono font-medium" : "text-destructive font-mono font-medium"}>
                            {formatCurrency(tournament.profit)}
                          </TableCell>
                          <TableCell className={tournament.profit >= 0 ? "text-green-500 font-mono font-medium" : "text-destructive font-mono font-medium"}>
                            {roiValue !== null ? formatPercentage(roiValue) : "N/A"}
                          </TableCell>
                          <TableCell className="font-mono font-medium">{tournament.entradas}</TableCell>
                          <TableCell className="font-mono font-medium">{tournament.posicao}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Análise Comparativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Esta seção mostra como seria o desempenho do jogador sem contar os maiores prêmios,
                  permitindo uma análise do desempenho em torneios regulares.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas Sem Big Hits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Total de Torneios</div>
                    <div className="text-2xl font-bold font-mono">{comparisonStats.totalTournaments}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Profit Total</div>
                    <div className={`text-2xl font-bold font-mono ${comparisonStats.totalProfit >= 0 ? "text-green-500" : "text-destructive"}`}>
                      {formatCurrency(comparisonStats.totalProfit)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">ROI Médio</div>
                    <div className={`text-2xl font-bold font-mono ${comparisonStats.avgROI >= 0 ? "text-green-500" : "text-destructive"}`}>
                      {formatPercentage(comparisonStats.avgROI)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Taxa ITM</div>
                    <div className="text-2xl font-bold font-mono">{formatPercentage(comparisonStats.itmRate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impacto dos Big Hits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Contribuição no Profit</div>
                    <div className="text-2xl font-bold text-steelersGold font-mono">
                      {formatPercentage(totalProfit / (totalProfit + comparisonStats.totalProfit) * 100)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Diferença no ROI</div>
                    <div className="text-2xl font-bold text-steelersGold font-mono">
                      {formatPercentage(bigHitsROI - comparisonStats.avgROI)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">% dos Torneios</div>
                    <div className="text-2xl font-bold font-mono">
                      {formatPercentage((bigHits.length / (comparisonStats.totalTournaments + bigHits.length)) * 100)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">ROI com Big Hits</div>
                    <div className="text-2xl font-bold text-steelersGold font-mono">{formatPercentage(bigHitsROI)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Profit Acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={cumulativeChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `Mês: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withBigHits" 
                      name="Com Big Hits" 
                      stroke="hsl(var(--steelers-gold))" 
                      strokeWidth={2.5}
                      dot={{ stroke: 'hsl(var(--steelers-gold))', strokeWidth: 2, r: 3 }}
                      activeDot={{ stroke: 'hsl(var(--steelers-gold))', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withoutBigHits" 
                      name="Sem Big Hits" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      dot={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                      activeDot={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-4">
                Comparação do lucro acumulado considerando ou não os torneios com grandes prêmios
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>ROI Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={compareChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, `ROI`]}
                      labelFormatter={(label) => `Mês: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withBigHits" 
                      name="Com Big Hits" 
                      stroke="hsl(var(--steelers-gold))" 
                      strokeWidth={2.5}
                      dot={{ stroke: 'hsl(var(--steelers-gold))', strokeWidth: 2, r: 3 }}
                      activeDot={{ stroke: 'hsl(var(--steelers-gold))', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withoutBigHits" 
                      name="Sem Big Hits" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      dot={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                      activeDot={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-4">
                Comparação do ROI mensal com e sem os torneios de grandes prêmios
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Análise de Conclusão</CardTitle>
            </CardHeader>
            <MensalConclusionAnalysis comparisonStats={comparisonStats} bigHitsROI={bigHitsROI} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

