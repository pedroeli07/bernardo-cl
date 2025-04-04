"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface MonthlyStatsTableProps {
  data: Array<{
    month: string
    count: number
    profit: number
    totalBuyIn?: number
    avgROI: number
    entries?: number
  }>
  title: string
}

export function MonthlyStatsTable({ data, title }: MonthlyStatsTableProps) {
  // Sort data by month
  const sortedData = [...data].sort((a, b) => {
    const [monthA, yearA] = a.month.split('/');
    const [monthB, yearB] = b.month.split('/');
    
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA);
    }
    
    const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return monthOrder.indexOf(monthB) - monthOrder.indexOf(monthA);
  });

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Torneios</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Entradas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((stats) => (
                <TableRow key={stats.month}>
                  <TableCell className="font-medium">{stats.month}</TableCell>
                  <TableCell className="font-mono font-medium">{stats.count}</TableCell>
                  <TableCell className={`${stats.profit >= 0 ? "text-green-500" : "text-destructive"} font-mono font-medium`}>
                    {formatCurrency(stats.profit)}
                  </TableCell>
                  <TableCell className={`${stats.avgROI >= 0 ? "text-green-500" : "text-destructive"} font-mono font-medium`}>
                    {formatPercentage(stats.avgROI)}
                  </TableCell>
                  <TableCell className="font-mono font-medium">{stats.entries || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

