"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface RoiChartProps {
  data: {
    month: string
    roi: number
  }[]
}

export function RoiChart({ data }: RoiChartProps) {
  console.log("Original ROI data:", data);

  // Aggregate data by month
  const aggregateByMonth = (data: any[]) => {
    const monthMap = new Map<string, { month: string; roi: number; count: number }>();
    
    data.forEach(item => {
      // Extract month and year parts
      let month: string;
      let year: string;
      
      if (item.month.includes('/')) {
        // Format: "01/2025"
        [month, year] = item.month.split('/');
      } else if (item.month.includes('-')) {
        // Format: "2025-01"
        [year, month] = item.month.split('-');
      } else if (item.month.includes(' ')) {
        // Format: "Jan 2025"
        const parts = item.month.split(' ');
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthIndex = monthNames.findIndex(m => parts[0].toLowerCase().startsWith(m.toLowerCase()));
        
        if (monthIndex !== -1) {
          month = (monthIndex + 1).toString().padStart(2, '0');
          year = parts[1];
        } else {
          console.log("Unrecognized month format:", item.month);
          return; // Skip this item
        }
      } else {
        console.log("Unrecognized format:", item.month);
        return; // Skip this item
      }
      
      // Create a standardized key in format MM/YY
      const key = `${month.padStart(2, '0')}/${year.slice(-2)}`;
      
      if (monthMap.has(key)) {
        const existing = monthMap.get(key)!;
        existing.roi = (existing.roi * existing.count + item.roi) / (existing.count + 1);
        existing.count += 1;
      } else {
        monthMap.set(key, { month: key, roi: item.roi, count: 1 });
      }
    });
    
    // Convert map to array and sort by date
    const result = Array.from(monthMap.values()).sort((a, b) => {
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      
      if (yearA !== yearB) return Number(yearA) - Number(yearB);
      return Number(monthA) - Number(monthB);
    });
    
    console.log("Aggregated ROI data:", result);
    return result;
  };
  
  const aggregatedData = aggregateByMonth(data);

  // Format month to MM/YY format (used only for display in the tooltip)
  const formatMonth = (monthStr: string) => {
    console.log("Formatting month:", monthStr);
    
    // If already in MM/YY format, just return it
    if (/^\d{2}\/\d{2}$/.test(monthStr)) {
      return monthStr;
    }
    
    try {
      // Handle MM/YYYY format
      if (monthStr.includes('/')) {
        const [month, year] = monthStr.split('/');
        if (year.length === 4) {
          return `${month.padStart(2, '0')}/${year.slice(2)}`;
        }
        return monthStr; // Already in correct format
      }
      
      // Handle YYYY-MM format
      if (monthStr.includes('-')) {
        const [year, month] = monthStr.split('-');
        return `${month}/${year.slice(2)}`;
      }
      
      // For format like "Jan 2023" or "January 2023"
      const parts = monthStr.split(' ');
      if (parts.length !== 2) {
        console.log("Using as is:", monthStr);
        return monthStr;
      }
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let monthNum;
      
      // Try to match month name
      const monthIndex = monthNames.findIndex(m => 
        parts[0].toLowerCase().startsWith(m.toLowerCase())
      );
      
      if (monthIndex !== -1) {
        monthNum = monthIndex + 1;
      } else {
        // Try to parse as a date
        const date = new Date(`${parts[0]} 1, ${parts[1]}`);
        if (isNaN(date.getTime())) {
          console.log("Failed to parse month, using as is:", monthStr);
          return monthStr;
        }
        monthNum = date.getMonth() + 1;
      }
      
      const year = parts[1].slice(2); // Get last 2 digits of year
      return `${monthNum.toString().padStart(2, '0')}/${year}`;
    } catch (error) {
      console.error("Error formatting month:", error, monthStr);
      return monthStr;
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      console.log("ROI Tooltip data:", { payload, label });
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: "hsl(var(--steelers-gold))", 
          color: "black",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "1px solid hsl(var(--border))"
        }}>
          <p className="label font-medium">{`Mês: ${label}`}</p>
          <p className="intro font-medium">{`ROI: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">ROI Médio (%)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            roi: {
              label: "ROI",
              color: "hsl(var(--steelers-gold))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickMargin={10}
                angle={-45}
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="roi" fill="hsl(var(--steelers-gold))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

