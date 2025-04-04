"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ProfitChartProps {
  data: {
    date: string
    profit: number
    dailyProfit?: number
  }[]
}

export function ProfitChart({ data }: ProfitChartProps) {
  // Filter data to show only about 10 points for better readability
  const filterDataForDisplay = (data: any[]) => {
    if (data.length <= 10000000) return data
    
    const step = Math.ceil(data.length / 1000000)
    return data.filter((_, index) => index % step === 0)
  }

  const displayData = filterDataForDisplay(data)

  // Format date to Brazilian format DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    console.log("Formatting date:", dateStr);
    try {
      if (!dateStr) return "Data inválida";
      
      // Check if input is already in Brazilian format (DD/MM/YY or DD/MM/YYYY)
      if (dateStr.match(/^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/)) {
        console.log("Already in Brazilian format:", dateStr);
        // Extract components
        const parts = dateStr.split('/');
        // Make sure it's treated as DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
        const year = parseInt(parts[2], 10);
        // Adjust year if it's in YY format
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        
        const date = new Date(fullYear, month, day);
        
        if (isNaN(date.getTime())) {
          console.error("Invalid date (Brazilian format):", dateStr, {day, month, year});
          return "Data inválida";
        }
        
        // Format to Brazilian format DD/MM/YYYY
        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${fullYear}`;
      }
      
      // Handle common date formats
      let date: Date;
      
      // Check for format like "2025-04-03 03:00:00"
      if (dateStr.includes(' ') && dateStr.includes('-') && dateStr.includes(':')) {
        const [datePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          console.error("Invalid date parts:", dateStr, year, month, day);
          return "Data inválida";
        }
        
        date = new Date(year, month - 1, day);
      } else {
        // Try standard parsing
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date after parsing:", dateStr);
        return "Data inválida";
      }
      
      // Format to Brazilian format DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateStr);
      return "Data inválida";
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      console.log("Tooltip data:", { payload, label });
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: "hsl(var(--steelers-gold))", 
          color: "black",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "1px solid hsl(var(--border))"
        }}>
          <p className="label font-medium">{`Data: ${formatDate(label)}`}</p>
          <p className="intro font-medium">{`Profit Acumulado: ${formatCurrency(payload[0].value)}`}</p>
          {payload[0].payload.dailyProfit !== undefined && (
            <p className="intro font-medium">{`Profit Diário: ${formatCurrency(payload[0].payload.dailyProfit)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Profit Acumulado ($)</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            profit: {
              label: "Profit",
              color: "hsl(var(--steelers-gold))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--steelers-gold))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--steelers-gold))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickMargin={10}
                angle={-45}
                height={60}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => formatCurrency(value)}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--steelers-gold))"
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

