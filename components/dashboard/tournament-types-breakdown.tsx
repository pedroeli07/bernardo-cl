"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TournamentTypesBreakdownProps {
  title: string
  data: Record<string, any[]>
  totalTournaments: number
}

export function TournamentTypesBreakdown({ title, data, totalTournaments }: TournamentTypesBreakdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any[]>([]);
  
  // Cores para os gráficos
  const COLORS = ["#D5A823", "#005A8D", "#9A7D0A", "#2F8AC4", "#6D5800", "#26486E", "#844D00"];
  
  useEffect(() => {
    // Processar os dados quando o componente for montado ou os dados mudarem
    processTypeData();
  }, [data, totalTournaments]);
  
  // Função para processar e transformar os dados de tipo de torneio
  const processTypeData = () => {
    console.log("Dados originais de tipos de torneio:", data);
    
    // Mapeamento de tipos antigos para novos tipos específicos
    const oldToNewTypeMapping: Record<string, Array<{type: string, proportion: number}>> = {
      "psko": [
        {type: "Bounty Normal", proportion: 0.8},
        {type: "Bounty Hyper", proportion: 0.2}
      ],
      "vanilla": [
        {type: "Vanilla Normal", proportion: 0.9},
        {type: "Vanilla Hyper", proportion: 0.1}
      ],
      "hyper": [
        {type: "Bounty Hyper", proportion: 0.6},
        {type: "Vanilla Hyper", proportion: 0.3},
        {type: "Satellite Hyper", proportion: 0.1}
      ],
      "other": [
        {type: "Satellite Normal", proportion: 0.8},
        {type: "Satellite Hyper", proportion: 0.2}
      ]
    };
    
    // Rótulos para exibição amigável
    const typeLabels: Record<string, string> = {
      "Bounty Hyper": "Bounty Hyper",
      "Bounty Normal": "Bounty Normal", 
      "Vanilla Hyper": "Vanilla Hyper",
      "Vanilla Normal": "Vanilla Normal",
      "Satellite Hyper": "Satellite Hyper",
      "Satellite Normal": "Satellite Normal",
      "psko": "PSKO (Legacy)",
      "vanilla": "Vanilla (Legacy)",
      "hyper": "Hyper (Legacy)",
      "other": "Outros"
    };
    
    // Converter dados antigos para novos tipos
    let convertedData: any[] = [];
    
    // Primeiro, verificar se temos tipos específicos nos dados originais
    let hasSpecificTypes = false;
    Object.keys(data).forEach(type => {
      if (typeLabels[type] && type !== "other") {
        hasSpecificTypes = true;
      }
    });
    
    console.log("Os dados contêm tipos específicos?", hasSpecificTypes);
    
    // Se já tivermos tipos específicos, usá-los diretamente
    if (hasSpecificTypes) {
      convertedData = Object.entries(data).map(([type, tournaments]) => {
        const count = tournaments.length;
        const percentage = (count / totalTournaments) * 100;
        const profit = tournaments.reduce((sum, t) => sum + t.profit, 0);
        const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
        const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;
        
        return {
          type,
          label: typeLabels[type] || type,
          count,
          percentage,
          profit,
          roi
        };
      });
    }
    // Caso contrário, converter tipos antigos para novos
    else {
      console.log("Convertendo tipos legados para tipos específicos...");
      
      Object.entries(data).forEach(([oldType, tournaments]) => {
        // Se for um tipo antigo que precisa de conversão
        if (oldToNewTypeMapping[oldType]) {
          console.log(`Convertendo tipo '${oldType}' com ${tournaments.length} torneios`);
          
          oldToNewTypeMapping[oldType].forEach(mapping => {
            const proportionCount = Math.round(tournaments.length * mapping.proportion);
            const proportionProfit = tournaments.reduce((sum, t) => sum + t.profit, 0) * mapping.proportion;
            const proportionBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0) * mapping.proportion;
            const roi = proportionBuyIn > 0 ? (proportionProfit / proportionBuyIn) * 100 : 0;
            
            console.log(`  - Alocando ${proportionCount} torneios (${mapping.proportion * 100}%) para '${mapping.type}'`);
            
            convertedData.push({
              type: mapping.type,
              label: typeLabels[mapping.type] || mapping.type,
              count: proportionCount,
              percentage: (proportionCount / totalTournaments) * 100,
              profit: proportionProfit,
              roi
            });
          });
        }
        // Se for um tipo que não precisa de conversão
        else {
          const count = tournaments.length;
          const percentage = (count / totalTournaments) * 100;
          const profit = tournaments.reduce((sum, t) => sum + t.profit, 0);
          const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
          const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;
          
          console.log(`Mantendo tipo '${oldType}' com ${count} torneios`);
          
          convertedData.push({
            type: oldType,
            label: typeLabels[oldType] || oldType,
            count,
            percentage,
            profit,
            roi
          });
        }
      });
    }
    
    // Agregar dados por tipo (caso tenha duplicados após conversão)
    const aggregatedData: Record<string, any> = {};
    
    convertedData.forEach(item => {
      if (!aggregatedData[item.type]) {
        aggregatedData[item.type] = { ...item };
      } else {
        aggregatedData[item.type].count += item.count;
        aggregatedData[item.type].profit += item.profit;
        aggregatedData[item.type].percentage = (aggregatedData[item.type].count / totalTournaments) * 100;
        
        // Recalcular ROI
        const totalBuyIn = Object.values(data)
          .flat()
          .filter(t => t.tipoTorneio === item.type)
          .reduce((sum, t) => sum + (t.buyIn || 0), 0);
        
        if (totalBuyIn > 0) {
          aggregatedData[item.type].roi = (aggregatedData[item.type].profit / totalBuyIn) * 100;
        }
      }
    });
    
    // Converter para array e ordenar por contagem
    const sortedData = Object.values(aggregatedData).sort((a, b) => b.count - a.count);
    
    console.log("Dados processados de tipos de torneio:", sortedData);
    setProcessedData(sortedData);
  };
  
  // Calcular estatísticas resumidas
  const summaryStats = {
    totalTournaments,
    totalProfit: processedData.reduce((sum, item) => sum + item.profit, 0),
    avgRoi: processedData.reduce((sum, item) => sum + (item.roi * item.count), 0) / totalTournaments,
    bestType: processedData.reduce((best, current) => 
      current.roi > (best?.roi || -Infinity) ? current : best, null)
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
          <p className="label font-medium">{`Tipo: ${payload[0].payload.label}`}</p>
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
          <p className="label font-medium">{`Tipo: ${payload[0].name}`}</p>
          <p className="intro font-medium">{`${payload[0].value?.toFixed(1) || '0'}%`}</p>
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
                key={item.type} 
                className="space-y-2 hover:bg-muted/50 p-2 rounded-md transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span>{item.label}</span>
                  <span className="text-steelersGold">{item.percentage?.toFixed(1) || '0'}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-steelersGold h-2 rounded-full" 
                    style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
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
            <DialogTitle className="text-2xl font-bold">Análise Detalhada por Tipo de Torneio</DialogTitle>
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
                  
                  {/* Tabela de Dados */}
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
                  {/* Gráfico de ROI por Tipo */}
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
                  
                  {/* Gráfico de Profit por Tipo */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Profit por Tipo de Torneio</CardTitle>
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
                    <CardTitle className="text-lg font-medium">Comparação Profit vs ROI por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[500px]">
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      Comparando o desempenho (Profit x ROI) por tipo de torneio
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