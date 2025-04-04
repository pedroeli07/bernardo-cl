"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface StatsBreakdownProps {
  title: string
  data: {
    label: string
    value: number
    percentage: number
    profit?: number
    roi?: number
    count?: number
  }[]
  additionalDetails?: {
    totalValue?: number
    totalProfit?: number
    avgRoi?: number
    bestPerformer?: {
      label: string
      value: number
      profit?: number
      roi?: number
    }
  }
}

export function StatsBreakdown({ title, data, additionalDetails }: StatsBreakdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const COLORS = ["#D5A823", "#005A8D", "#9A7D0A", "#2F8AC4", "#6D5800", "#26486E", "#844D00"];
  
  // Sort data by percentage for the main display
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);
  
  // Prepare chart data
  const pieData = data.map(item => ({
    name: item.label,
    value: item.percentage,
    count: item.count || item.value
  }));
  
  // Performance data
  const performanceData = data.map(item => ({
    name: item.label,
    roi: item.roi || 0,
    profit: item.profit || 0
  }));
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
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
          <p className="label font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="intro font-medium">
              {`${entry.name}: ${entry.name === 'profit' ? formatCurrency(entry.value) : 
                             entry.name === 'roi' ? formatPercentage(entry.value) : 
                             entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Pie chart tooltip
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
          <p className="label font-medium">{`${payload[0].name}`}</p>
          <p className="intro font-medium">{`${payload[0].value.toFixed(1)}%`}</p>
          {payload[0].payload.count && (
            <p className="intro font-medium">{`Quantidade: ${payload[0].payload.count}`}</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Open modal with selected item
  const openItemDetails = (label: string) => {
    setSelectedItem(label);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card 
        className="card-hover-effect border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30 cursor-pointer hover:bg-card/80 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedData.slice(0, 5).map((item) => (
              <div 
                key={item.label} 
                className="space-y-2 hover:bg-muted/50 p-2 rounded-md transition-colors"
                onClick={() => openItemDetails(item.label)}
              >
                <div className="flex justify-between items-center">
                  <span>{item.label}</span>
                  <span className="text-steelersGold">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-steelersGold h-2 rounded-full" 
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {sortedData.length > 5 && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                + {sortedData.length - 5} mais
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Analysis Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Análise Detalhada - {title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Summary Stats */}
            {additionalDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {additionalDetails.totalValue !== undefined && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm">Total</div>
                      <div className="text-xl font-bold">{additionalDetails.totalValue}</div>
                    </CardContent>
                  </Card>
                )}
                {additionalDetails.totalProfit !== undefined && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm">Profit Total</div>
                      <div className="text-xl font-bold">{formatCurrency(additionalDetails.totalProfit)}</div>
                    </CardContent>
                  </Card>
                )}
                {additionalDetails.avgRoi !== undefined && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm">ROI Médio</div>
                      <div className="text-xl font-bold">{formatPercentage(additionalDetails.avgRoi)}</div>
                    </CardContent>
                  </Card>
                )}
                {additionalDetails.bestPerformer && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm">Melhor Desempenho</div>
                      <div className="text-xl font-bold">{additionalDetails.bestPerformer.label}</div>
                      <div className="text-sm">
                        {additionalDetails.bestPerformer.roi !== undefined ? 
                          formatPercentage(additionalDetails.bestPerformer.roi) : 
                          additionalDetails.bestPerformer.value.toString()}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {/* Charts section */}
            <Tabs defaultValue="distribution">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="distribution" className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Distribution Pie Chart */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Distribuição</CardTitle>
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
                  
                  {/* Bar Chart */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Percentuais</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Percentual']}
                            contentStyle={{
                              backgroundColor: "hsl(var(--steelers-gold))",
                              color: "black",
                              border: "1px solid hsl(var(--border))"
                            }}
                          />
                          <Bar dataKey="percentage" name="Percentual" fill="hsl(var(--steelers-gold))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                {data[0].roi !== undefined || data[0].profit !== undefined ? (
                  <div className="flex flex-col lg:flex-row gap-4">
                    {data[0].roi !== undefined && (
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">ROI</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="roi" fill="#005A8D" name="ROI" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                    
                    {data[0].profit !== undefined && (
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">Profit</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
                                tickFormatter={(value) => formatCurrency(value)}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="profit" fill="#D5A823" name="Profit" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Dados de desempenho não disponíveis para esta categoria.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Dados Completos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">{title.split(' ').pop()}</th>
                            <th className="text-right py-2">Valor</th>
                            <th className="text-right py-2">%</th>
                            {data[0].profit !== undefined && <th className="text-right py-2">Profit</th>}
                            {data[0].roi !== undefined && <th className="text-right py-2">ROI</th>}
                            {data[0].count !== undefined && <th className="text-right py-2">Qtd</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.label}</td>
                              <td className="text-right py-2">{item.value}</td>
                              <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                              {data[0].profit !== undefined && (
                                <td className="text-right py-2">{formatCurrency(item.profit || 0)}</td>
                              )}
                              {data[0].roi !== undefined && (
                                <td className="text-right py-2">{formatPercentage(item.roi || 0)}</td>
                              )}
                              {data[0].count !== undefined && (
                                <td className="text-right py-2">{item.count}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

