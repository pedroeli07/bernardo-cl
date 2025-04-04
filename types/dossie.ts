import { MonthlyStats } from "@/lib/data-utils"
import { PostBigWinStats, BuyInRangeStats, TypeStats } from "./dashboard"

export interface ITMStats {
  overall: {
    totalTournaments: number
    itmTournaments: number
    itmPercentage: number
  }
  monthly?: {
    month: string
    itmPercentage: number
  }[]
  postBigWins: {
    firstPeriod: {
      totalTournaments: number
      itmTournaments: number
      itmPercentage: number
      startDate: Date | string
      endDate: Date | string
    }
    secondPeriod: {
      totalTournaments: number
      itmTournaments: number
      itmPercentage: number
      startDate: Date | string
      endDate: Date | string
    }
  }
}

export interface PhaseData {
  count: number
  description: string
  percentage: number
}

export interface EliminationPhases {
  overall: Record<string, PhaseData>
  validTournaments: number
  postBigWins: {
    firstPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date | string
      endDate: Date | string
    }
    secondPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date | string
      endDate: Date | string
    }
  }
}

export interface DossieData {
  monthlyStats: MonthlyStats[]
  postBigWinStats: PostBigWinStats
  buyInRangeStats: BuyInRangeStats[]
  typeStats: TypeStats[]
  itmStats: ITMStats
  eliminationPhases: EliminationPhases
} 