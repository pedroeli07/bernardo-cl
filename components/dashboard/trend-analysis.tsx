"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

interface TrendAnalysisProps {
  profitTrend: {
    month: string
    profit: number
  }[]
  roiTrend: {
    month: string
    roi: number
  }[]
  buyInTrend: {
    month: string
    avgBuyIn: number
  }[]
}

export function TrendAnalysis({ profitTrend, roiTrend, buyInTrend }: TrendAnalysisProps) {
  // Track active tabs with state
  const [activeTabs, setActiveTabs] = useState<string[]>(["profit"]);

  // Toggle tab active state
  const toggleTab = (tab: string) => {
    if (activeTabs.includes(tab)) {
      // If already active and we have more than one tab active, remove it
      if (activeTabs.length > 1) {
        setActiveTabs(activeTabs.filter(t => t !== tab));
      }
    } else {
      // Add the tab to active tabs
      setActiveTabs([...activeTabs, tab]);
    }
  };

  // Get color style for tab
  const getTabStyle = (tab: string) => {
    const isActive = activeTabs.includes(tab);
    return {
      backgroundColor: isActive ? "hsl(var(--steelers-gold))" : "transparent",
      color: isActive ? "hsl(var(--steelers-black))" : "hsl(var(--foreground))",
      fontWeight: isActive ? "bold" : "normal",
      border: isActive ? "2px solid hsl(var(--steelers-gold))" : "1px solid hsl(var(--border))",
      transform: isActive ? "translateY(-2px)" : "none",
      boxShadow: isActive ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
      transition: "all 0.2s ease"
    };
  };

  // Combine data for overlay charts based on active tabs
  const getCombinedData = () => {
    // Use months from all datasets to create a complete set of months
    const allMonths = new Set<string>([
      ...profitTrend.map(item => item.month),
      ...roiTrend.map(item => item.month),
      ...buyInTrend.map(item => item.month)
    ]);

    // Create combined data with all months
    return Array.from(allMonths).sort().map(month => {
      const result: any = { month };
      
      if (activeTabs.includes("profit")) {
        const profitItem = profitTrend.find(item => item.month === month);
        if (profitItem) result.profit = profitItem.profit;
      }
      
      if (activeTabs.includes("roi")) {
        const roiItem = roiTrend.find(item => item.month === month);
        if (roiItem) result.roi = roiItem.roi;
      }
      
      if (activeTabs.includes("buyin")) {
        const buyInItem = buyInTrend.find(item => item.month === month);
        if (buyInItem) result.avgBuyIn = buyInItem.avgBuyIn;
      }
      
      return result;
    });
  };

  const combinedData = getCombinedData();

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Análise de Tendências</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => toggleTab("profit")}
            style={getTabStyle("profit")}
            className="px-4 py-2 rounded-md"
          >
            Profit
          </button>
          <button 
            onClick={() => toggleTab("roi")}
            style={getTabStyle("roi")}
            className="px-4 py-2 rounded-md"
          >
            ROI
          </button>
          <button 
            onClick={() => toggleTab("buyin")}
            style={getTabStyle("buyin")}
            className="px-4 py-2 rounded-md"
          >
            Buy-in Médio
          </button>
        </div>

        <div className="h-[400px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickMargin={10}
                angle={-45}
                height={60}
              />
              
              {/* Use separate Y-axis for each data type to handle different scales */}
              {activeTabs.includes("profit") && (
                <YAxis
                  yAxisId="profit"
                  orientation="left"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
              )}
              
              {activeTabs.includes("roi") && (
                <YAxis
                  yAxisId="roi"
                  orientation={activeTabs.includes("profit") ? "right" : "left"}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
              )}
              
              {activeTabs.includes("buyin") && (
                <YAxis
                  yAxisId="buyin"
                  orientation={activeTabs.includes("profit") || activeTabs.includes("roi") ? "right" : "left"}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
              )}
              
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "profit") return [formatCurrency(value), "Profit"];
                  if (name === "roi") return [`${value.toFixed(2)}%`, "ROI"];
                  if (name === "avgBuyIn") return [formatCurrency(value), "Buy-in Médio"];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              
              <Legend />
              
              {activeTabs.includes("profit") && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  yAxisId="profit"
                  name="Profit"
                  stroke="hsl(var(--steelers-gold))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              
              {activeTabs.includes("roi") && (
                <Line
                  type="monotone"
                  dataKey="roi"
                  yAxisId="roi"
                  name="ROI"
                  stroke="hsl(130, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              
              {activeTabs.includes("buyin") && (
                <Line
                  type="monotone"
                  dataKey="avgBuyIn"
                  yAxisId="buyin"
                  name="Buy-in Médio"
                  stroke="hsl(200, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

