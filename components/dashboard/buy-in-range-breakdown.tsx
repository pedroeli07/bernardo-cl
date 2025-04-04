"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface BuyInRangeBreakdownProps {
  title: string
  data: Record<string, any[]>
  totalTournaments: number
}

export function BuyInRangeBreakdown({ title, data, totalTournaments }: BuyInRangeBreakdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any[]>([]);
  
  // Cores para os gráficos
  const COLORS = ["#D5A823", "#005A8D", "#9A7D0A", "#2F8AC4", "#6D5800", "#26486E", "#844D00"];

  // Ordenar ranges para visualização
  const rangeOrder = ["$0~33", "$33~60", "$60~130", "$130~450", "$500~990", "$1k+"];
  
  useEffect(() => {
    // Processar os dados quando o componente for montado ou os dados mudarem
    processRangeData();
  }, [data, totalTournaments]);
  
  // Função para processar e transformar os dados de range de buy-in
  const processRangeData = () => {
    console.log("Dados originais de ranges de buy-in:", data);
    
    // Rótulos para exibição amigável
    const rangeLabels: Record<string, string> = {
      "$0~33": "$0-33 (Micro)",
      "$33~60": "$33-60 (Low)",
      "$60~130": "$60-130 (Medium)",
      "$130~450": "$130-450 (High)",
      "$500~990": "$500-990 (VHigh)",
      "$1k+": "$1k+ (Ultra)",
    };
    
    // Processar dados
    const processedData = Object.entries(data).map(([range, tournaments]) => {
      const count = tournaments.length;
      const percentage = (count / totalTournaments) * 100;
      const profit = tournaments.reduce((sum, t) => sum + t.profit, 0);
      const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
      const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;
      
      return {
        range,
        label: rangeLabels[range] || range,
        count,
        percentage,
        profit,
        roi,
        sortOrder: rangeOrder.indexOf(range) // Para ordenar por valor do buy-in, não por quantidade
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder); // Ordena por valor de buy-in
    
    console.log("Dados processados de ranges de buy-in:", processedData);
    setProcessedData(processedData);
  };
  
  // Calcular estatísticas resumidas
  const summaryStats = {
    totalTournaments,
    totalProfit: processedData.reduce((sum, item) => sum + item.profit, 0),
    avgRoi: processedData.reduce((sum, item) => sum + (item.roi * item.count), 0) / totalTournaments,
    bestRange: processedData.reduce<any | null>((best, current) => 
      current.roi > (best?.roi || -Infinity) ? current : best, null),
    mostProfitableRange: processedData.reduce<any | null>((best, current) => 
      current.profit > (best?.profit || -Infinity) ? current : best, null)
  };
  
  // Formatar dados para gráfico de pizza
  const pieData = processedData.map(item => ({
    name: item.label,
    value: item.percentage,
    count: item.count
  }));
  
  // Dados para gráfico de comparação de ROI
  const roiData = processedData.map(item => ({
    name: item.label,
    roi: item.roi
  }));
  
  // Tooltip personalizado para gráfico de barras
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
          <p className="label font-medium">{`Buy-In: ${payload[0].payload.label}`}</p>
          <p className="intro font-medium">{`Quantidade: ${payload[0].payload.count} torneios (${payload[0].payload.percentage.toFixed(1)}%)`}</p>
          <p className="intro font-medium">{`Profit: ${formatCurrency(payload[0].payload.profit)}`}</p>
          <p className="intro font-medium">{`ROI: ${formatPercentage(payload[0].payload.roi)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Tooltip personalizado para gráfico de pizza
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
          <p className="label font-medium">{`Buy-In: ${payload[0].name}`}</p>
          <p className="intro font-medium">{`${payload[0].value.toFixed(1)}%`}</p>
          <p className="intro font-medium">{`${payload[0].payload.count} torneios`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Ordenar dados por porcentagem para exibição principal
  const topData = [...processedData].sort((a, b) => b.percentage - a.percentage).slice(0, 5);

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
            {topData.map((item) => (
              <div 
                key={item.range} 
                className="space-y-2 hover:bg-muted/50 p-2 rounded-md transition-colors"
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
            {processedData.length > 5 && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                + {processedData.length - 5} mais
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Análise Detalhada */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Análise Detalhada por Buy-In</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Estatísticas Resumidas */}
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
                  <div className="text-muted-foreground text-sm">Melhor ROI</div>
                  <div className="text-xl font-bold">{summaryStats.bestRange?.label}</div>
                  <div className="text-sm">{formatPercentage(summaryStats.bestRange?.roi || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-sm">Maior Profit</div>
                  <div className="text-xl font-bold">{summaryStats.mostProfitableRange?.label}</div>
                  <div className="text-sm">{formatCurrency(summaryStats.mostProfitableRange?.profit || 0)}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Seção de Gráficos */}
            <Tabs defaultValue="distribution">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparison">Comparação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="distribution" className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Gráfico de Pizza para Distribuição */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Distribuição por Buy-In</CardTitle>
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
                  
                  {/* Tabela de Dados */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Detalhes por Buy-In</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Buy-In</th>
                              <th className="text-right py-2">Torneios</th>
                              <th className="text-right py-2">%</th>
                              <th className="text-right py-2">Profit</th>
                              <th className="text-right py-2">ROI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.map((item, index) => (
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
                  {/* Gráfico de ROI por Buy-In */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">ROI por Buy-In</CardTitle>
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
                  
                  {/* Gráfico de Profit por Buy-In */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Profit por Buy-In</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={processedData} 
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
                    <CardTitle className="text-lg font-medium">Volume vs. ROI por Buy-In</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[500px]">
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      Comparando número de torneios (volume) e ROI por faixa de buy-in
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={processedData}
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
                          tickFormatter={(value) => value.toString()}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          label={{ value: 'Torneios', angle: -90, position: 'insideLeft', offset: -5 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => `${value.toFixed(0)}%`}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          label={{ value: 'ROI (%)', angle: -90, position: 'insideRight', offset: 5 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--steelers-gold))",
                            color: "black",
                            border: "1px solid hsl(var(--border))"
                          }}
                          formatter={(value: any, name: string) => [
                            name === "count" ? value : `${value.toFixed(2)}%`,
                            name === "count" ? "Torneios" : "ROI"
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#D5A823"
                          name="Torneios"
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