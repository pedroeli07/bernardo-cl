"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from "lucide-react"

interface TournamentTypesChartProps {
  data: {
    type: string
    count: number
    profit: number
    roi: number
  }[]
  totalTournaments?: number
}

export function TournamentTypesChart({ data, totalTournaments }: TournamentTypesChartProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  console.log("Original tournament types data:", data);
  
  // Calculate total tournaments if not provided
  const total = totalTournaments || data.reduce((sum, item) => sum + item.count, 0);
  
  // Map old categories to new specific types
  const oldToNewTypeMapping: Record<string, string[]> = {
    "psko": ["Bounty Normal", "Bounty Hyper"],
    "vanilla": ["Vanilla Normal", "Vanilla Hyper"],
    "hyper": ["Bounty Hyper", "Vanilla Hyper", "Satellite Hyper"],
    "other": ["Satellite Normal", "Satellite Hyper", "other"]
  };
  
  const typeLabels: Record<string, string> = {
    "Bounty Hyper": "Bounty Hyper",
    "Bounty Normal": "Bounty Normal", 
    "Vanilla Hyper": "Vanilla Hyper",
    "Vanilla Normal": "Vanilla Normal",
    "Satellite Hyper": "Satellite Hyper",
    "Satellite Normal": "Satellite Normal",
    "other": "Outros",
  }
  
  // Process data to handle legacy types
  const processedData = data.flatMap(item => {
    // If it's one of the old categories
    if (oldToNewTypeMapping[item.type]) {
      const specificTypes = oldToNewTypeMapping[item.type];
      
      // Divide proportionally (simplified)
      return specificTypes.map((newType, index) => {
        // Skip "other" in the old->new mapping if we have specific types to map to
        if (newType === "other" && specificTypes.length > 1) return null;
        
        const factor = 1 / specificTypes.length;
        return {
          ...item,
          type: newType,
          count: Math.round(item.count * factor),
          profit: item.profit * factor,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
    }
    
    // If it's already a specific type, keep as is
    return item;
  });
  
  // Group by the specific types
  const groupedBySpecificType = processedData.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) {
      acc[type] = {
        type,
        count: 0,
        profit: 0,
        roi: 0,
      };
    }
    
    acc[type].count += item.count;
    acc[type].profit += item.profit;
    // Recalculate ROI based on group totals later
    
    return acc;
  }, {} as Record<string, {type: string, count: number, profit: number, roi: number}>);
  
  // Convert to array and sort
  const formattedData = Object.values(groupedBySpecificType).map(item => ({
    ...item,
    label: typeLabels[item.type] || item.type,
    percentage: (item.count / total) * 100
  })).sort((a, b) => b.count - a.count);

  console.log("Reformatted tournament types data:", formattedData);

  // Color scheme for charts
  const COLORS = ["#D5A823", "#005A8D", "#9A7D0A", "#2F8AC4", "#6D5800", "#26486E", "#844D00"];
  
  // Define the formatted data type to use in reduce
  type FormattedDataItem = typeof formattedData[number];
  
  // Calculate summary stats across all tournament types
  const summaryStats = {
    totalTournaments: total,
    totalProfit: data.reduce((sum, item) => sum + item.profit, 0),
    avgRoi: data.reduce((sum, item) => sum + (item.roi * item.count), 0) / total,
    bestType: formattedData.reduce<FormattedDataItem | null>((best, current) => 
      current.roi > (best?.roi || -Infinity) ? current : best, null)
  };

  // Open modal with specific type selected
  const openModalWithType = (type: string) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };
  
  // Custom tooltip component for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      console.log("Tournament types tooltip data:", { payload, label });
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: "hsl(var(--steelers-gold))", 
          color: "black",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "1px solid hsl(var(--border))"
        }}>
          <p className="label font-medium">{`Tipo: ${payload[0].payload.label}`}</p>
          <p className="intro font-medium">{`Quantidade: ${payload[0].payload.count} torneios (${payload[0].payload.percentage.toFixed(1)}%)`}</p>
          <p className="intro font-medium">{`Profit: ${formatCurrency(payload[0].payload.profit)}`}</p>
          <p className="intro font-medium">{`ROI: ${formatPercentage(payload[0].payload.roi)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: "hsl(var(--steelers-gold))", 
          color: "black",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "1px solid hsl(var(--border))"
        }}>
          <p className="label font-medium">{`Tipo: ${payload[0].name}`}</p>
          <p className="intro font-medium">{`${payload[0].value.toFixed(1)}%`}</p>
          <p className="intro font-medium">{`${payload[0].payload.count} torneios`}</p>
        </div>
      );
    }
    return null;
  };

  // Format data for pie chart
  const pieData = formattedData.map(item => ({
    name: item.label,
    value: item.percentage,
    count: item.count
  }));

  // Data for ROI comparison chart
  const roiData = formattedData.map(item => ({
    name: item.label,
    roi: item.roi
  }));

  return (
    <>
      <Card 
        className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30 cursor-pointer hover:bg-card/80 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Torneios por Tipo</CardTitle>
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer
            config={{
              count: {
                label: "Quantidade",
                color: "hsl(var(--steelers-gold))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickMargin={10}
                  angle={-45}
                  height={60}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--steelers-gold))" 
                  radius={[4, 4, 0, 0]} 
                  onClick={(data) => openModalWithType(data.type)}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Detailed Analysis Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Análise Detalhada por Tipo de Torneio</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-sm">Total de Torneios</div>
                  <div className="text-xl font-bold">{summaryStats.totalTournaments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-sm">Profit Total</div>
                  <div className="text-xl font-bold">{formatCurrency(summaryStats.totalProfit)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-sm">ROI Médio</div>
                  <div className="text-xl font-bold">{formatPercentage(summaryStats.avgRoi)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-sm">Melhor Tipo (ROI)</div>
                  <div className="text-xl font-bold">{summaryStats.bestType?.label}</div>
                  <div className="text-sm">{formatPercentage(summaryStats.bestType?.roi || 0)}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts section */}
            <Tabs defaultValue="distribution">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparison">Comparação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="distribution" className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Distribution Pie Chart */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Distribuição por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Data Table */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Detalhes por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Tipo</th>
                              <th className="text-right py-2">Torneios</th>
                              <th className="text-right py-2">%</th>
                              <th className="text-right py-2">Profit</th>
                              <th className="text-right py-2">ROI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formattedData.map((item, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{item.label}</td>
                                <td className="text-right py-2">{item.count}</td>
                                <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                                <td className="text-right py-2">{formatCurrency(item.profit)}</td>
                                <td className="text-right py-2">{formatPercentage(item.roi)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* ROI Comparison Chart */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">ROI por Tipo de Torneio</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roiData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'ROI']}
                            contentStyle={{
                              backgroundColor: "hsl(var(--steelers-gold))",
                              color: "black",
                              border: "1px solid hsl(var(--border))"
                            }}
                          />
                          <Bar dataKey="roi" fill="hsl(var(--steelers-gold))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Profit Comparison Chart */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Profit por Tipo de Torneio</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={formattedData} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                          <XAxis 
                            dataKey="label" 
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value: any) => [formatCurrency(value), 'Profit']}
                            contentStyle={{
                              backgroundColor: "hsl(var(--steelers-gold))",
                              color: "black",
                              border: "1px solid hsl(var(--border))"
                            }}
                          />
                          <Bar dataKey="profit" fill="hsl(var(--steelers-gold))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Comparação Profit vs ROI por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[500px]">
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      Comparando o desempenho (Profit x ROI) por tipo de torneio
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formattedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        barSize={20}
                        barGap={5}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          tickFormatter={(value) => formatCurrency(value)}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => `${value.toFixed(0)}%`}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--steelers-gold))",
                            color: "black",
                            border: "1px solid hsl(var(--border))"
                          }}
                          formatter={(value: any, name: string) => [
                            name === "profit" ? formatCurrency(value) : `${value.toFixed(2)}%`,
                            name === "profit" ? "Profit" : "ROI"
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="profit"
                          fill="#D5A823"
                          name="Profit"
                          yAxisId="left"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="roi"
                          fill="#005A8D"
                          name="ROI"
                          yAxisId="right"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 