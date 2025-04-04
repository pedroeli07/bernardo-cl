"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyStatsTable } from "@/components/dashboard/monthly-stats-table"
import type { MonthlyStats } from "@/lib/data-utils"

interface PostBigWinAnalysisProps {
  firstBigWin: MonthlyStats[]
  secondBigWin: MonthlyStats[]
}

export function PostBigWinAnalysis({ firstBigWin, secondBigWin }: PostBigWinAnalysisProps) {
  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Análise Pós-Forra</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="first">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="first">Pós $134k (23/05/2022)</TabsTrigger>
            <TabsTrigger value="second">Pós BSOP (06/04/2023)</TabsTrigger>
          </TabsList>
          <TabsContent value="first">
            <MonthlyStatsTable data={firstBigWin} title="6 Meses Após $134k (23/05/2022)" />
          </TabsContent>
          <TabsContent value="second">
            <MonthlyStatsTable data={secondBigWin} title="6 Meses Após BSOP (06/04/2023)" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

