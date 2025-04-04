import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyStatsTable } from "@/components/dashboard/monthly-stats-table"
import { MonthlyMetricsChart } from "@/components/charts/monthly-metrics-chart"
import { getDashboardStats } from "../actions"
import { formatPercentage } from "@/lib/utils"

export default async function AnaliseMensalPage() {
  const stats = await getDashboardStats()

  // Prepare monthly metrics data
  const monthlyMetricsData = stats.monthlyROIData.map((item) => {
    const monthStats =
      stats.postBigWinStats.firstBigWin.find((s) => s.month === item.month) ||
      stats.postBigWinStats.secondBigWin.find((s) => s.month === item.month)

    return {
      month: item.month,
      tournamentCount: monthStats?.count || 0,
      avgBuyIn: monthStats?.totalBuyIn ? (monthStats.totalBuyIn / (monthStats.count || 1)) : 0,
      avgROI: item.roi,
    }
  })

  // Combine all monthly stats for the table
  const allMonthlyStats = [
    ...stats.postBigWinStats.firstBigWin,
    ...stats.postBigWinStats.secondBigWin
  ]

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold gradient-text">Análise Mensal</h1>

      <div className="grid grid-cols-1 gap-6">
        <MonthlyMetricsChart data={monthlyMetricsData} />
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Estatísticas Mensais Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyStatsTable
            data={allMonthlyStats}
            title=""
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Melhores Meses por ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyROIData
                .sort((a, b) => b.roi - a.roi)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.month} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-steelersGold/20 flex items-center justify-center mr-3">
                      <span className="font-bold text-steelersGold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.month}</span>
                        <span className="text-steelersGold font-bold font-mono">{formatPercentage(item.roi)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-steelersGold h-2 rounded-full"
                          style={{ width: `${Math.min(100, (item.roi / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Meses com Maior Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyMetricsData
                .sort((a, b) => b.tournamentCount - a.tournamentCount)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.month} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-steelersGold/20 flex items-center justify-center mr-3">
                      <span className="font-bold text-steelersGold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.month}</span>
                        <span className="text-steelersGold font-bold font-mono">{item.tournamentCount} torneios</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-steelersGold h-2 rounded-full"
                          style={{ width: `${Math.min(100, (item.tournamentCount / 30) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

