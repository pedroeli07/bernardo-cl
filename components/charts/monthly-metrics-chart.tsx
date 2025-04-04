"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface MonthlyMetricsChartProps {
  data: {
    month: string
    tournamentCount: number
    avgBuyIn: number
    avgROI: number
  }[]
}

export function MonthlyMetricsChart({ data }: MonthlyMetricsChartProps) {
  // Filter data to show only about 12 months for better readability
  const filterDataForDisplay = (data: any[]) => {
    if (data.length <= 12) return data
    
    const step = Math.ceil(data.length / 12)
    return data.filter((_, index) => index % step === 0)
  }

  const displayData = filterDataForDisplay(data)

  // Format month to MM/YY format
  const formatMonth = (monthStr: string) => {
    // Expect format like "Jan 2023" or "January 2023"
    const parts = monthStr.split(' ')
    if (parts.length !== 2) return monthStr
    
    const month = new Date(`${parts[0]} 1, ${parts[1]}`).getMonth() + 1
    const year = parts[1].slice(2) // Get last 2 digits of year
    
    return `${month.toString().padStart(2, '0')}/${year}`
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Métricas Mensais</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            tournamentCount: {
              label: "Torneios",
              color: "hsl(var(--steelers-gold))",
            },
            avgBuyIn: {
              label: "Buy-in Médio",
              color: "hsl(200, 100%, 50%)",
            },
            avgROI: {
              label: "ROI Médio (%)",
              color: "hsl(130, 100%, 50%)",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickMargin={10}
                angle={-45}
                height={60}
                tickFormatter={formatMonth}
                interval={0}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => value.toString()} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "avgBuyIn") return [`$${value}`, "Buy-in Médio"]
                  if (name === "avgROI") return [`${value}%`, "ROI Médio"]
                  return [value, "Torneios"]
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Bar dataKey="tournamentCount" fill="hsl(var(--steelers-gold))" name="Torneios" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

