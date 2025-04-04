import { MonthlyStats } from "@/lib/data-utils"

export interface ProfitData {
  date: string
  profit: number
}

export interface ROIData {
  month: string
  roi: number
}

export interface PostBigWinStats {
  firstBigWin: MonthlyStats[]
  secondBigWin: MonthlyStats[]
}

export interface BuyInRangeStats {
  range: string
  count: number
  profit: number
  roi: number
}

export interface TypeStats {
  type: string
  count: number
  profit: number
  roi: number
}

export interface DashboardStats {
  totalTournaments: number
  totalProfit: number
  roi: number
  itmRate: number
  avgBuyIn: number
  highestPrize: {
    prize: number
    date: string | Date
  }
  bestMonthlyRoi: {
    roi: number
    month: string
  }
  cumulativeProfitData: ProfitData[]
  monthlyROIData: ROIData[]
  buyInRangeStats: BuyInRangeStats[]
  typeStats: TypeStats[]
  postBigWinStats: PostBigWinStats
  tournamentsByBuyInRange: Record<string, any[]>
  tournamentsByType: Record<string, any[]>
  monthlyStats: Array<{
    month: string
    count: number
    profit: number
    totalBuyIn: number
    avgROI: number
    avgBuyIn: number
    entries?: number
  }>
} 