import { formatDate } from "@/lib/utils"

// Tournament type definition to match our database structure
export interface Tournament {
  id?: number
  rede?: string
  data: Date
  entradas?: number
  profit: number
  posicao?: number
  prize?: number
  buyIn?: number
  tipoTorneio?: string
  mesAno?: string
  buyInRange?: string
}


// Function to calculate mean ROI
export function calculateMeanROI(tournaments: Tournament[]): number {
  const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0)
  const totalProfit = tournaments.reduce((sum, t) => sum + t.profit, 0)
  return totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0
}

// Function to calculate mean ROI
export function calculateMeanTournamentROI(tournaments: Tournament[]): number {
  const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0)
  const totalProfit = tournaments.reduce((sum, t) => sum + t.profit, 0)
  return totalBuyIn > 0 ? ((totalProfit / totalBuyIn) / tournaments.length )* 100 : 0
}


// Function to check if a tournament is after a specific date
export function isAfterDate(tournamentDate: Date, targetDate: string): boolean {
  const target = new Date(targetDate)
  return tournamentDate >= target
}

// Function to check if a tournament is within 6 months after a specific date
export function isWithinSixMonthsAfter(tournamentDate: Date, targetDate: string): boolean {
  const target = new Date(targetDate)
  const sixMonthsAfter = new Date(target)
  sixMonthsAfter.setMonth(sixMonthsAfter.getMonth() + 6)

  return tournamentDate >= target && tournamentDate <= sixMonthsAfter
}

// Function to get tournament type category
export function getTournamentTypeCategory(tipoTorneio: string | undefined): string {
  if (!tipoTorneio) return "other"

  // Use the exact tournament type instead of aggregating
  // Valid types: "Bounty Hyper", "Bounty Normal", "Vanilla Hyper", "Vanilla Normal", "Satellite Hyper", "Satellite Normal"
  if (tipoTorneio.includes("Bounty") && tipoTorneio.includes("Hyper")) return "Bounty Hyper"
  if (tipoTorneio.includes("Bounty") && !tipoTorneio.includes("Hyper")) return "Bounty Normal"
  if (tipoTorneio.includes("Vanilla") && tipoTorneio.includes("Hyper")) return "Vanilla Hyper"
  if (tipoTorneio.includes("Vanilla") && !tipoTorneio.includes("Hyper")) return "Vanilla Normal"
  if (tipoTorneio.includes("Satellite") && tipoTorneio.includes("Hyper")) return "Satellite Hyper"
  if (tipoTorneio.includes("Satellite") && !tipoTorneio.includes("Hyper")) return "Satellite Normal"

  return "other"
}

// Function to format month/year
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Function to group tournaments by month
export function groupTournamentsByMonth(tournaments: Tournament[]): Record<string, Tournament[]> {
  return tournaments.reduce(
    (acc, tournament) => {
      const monthYear = tournament.mesAno || formatMonthYear(tournament.data)

      if (!acc[monthYear]) {
        acc[monthYear] = []
      }

      acc[monthYear].push(tournament)
      return acc
    },
    {} as Record<string, Tournament[]>,
  )
}

// MonthlyStats interface for consistent usage across components
export interface MonthlyStats {
  month: string
  count: number
  avgBuyIn: number
  avgROI: number
  profit: number
  totalBuyIn: number
  stake?: number
  prize?: number
  avgStack?: number
  // Other potential fields
  entries?: number
  tournamentCount?: number
  itmPercentage?: number
  finalTablePercentage?: number
}

// Helper to format date strings consistently (DD/MM/YYYY)
export const formatDateString = (date: Date | string): string => {
  if (typeof date === 'string') {
    // If already in the correct format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date
    }
    // Otherwise convert string to Date and format
    date = new Date(date)
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Parse date string (DD/MM/YYYY) to Date object
export const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Classify tournament by buy-in range
export const classifyBuyIn = (buyIn: number): string => {
  if (buyIn <= 33) return "$0~33"
  if (buyIn <= 60) return "$33~60"
  if (buyIn <= 130) return "$60~130"
  if (buyIn <= 450) return "$130~450"
  if (buyIn <= 990) return "$500~990"
  return "$1k+"
}

// Classify tournament by type
export const classifyTournamentType = (game: string, flags: string): string => {
  // Determine if it's Bounty/Vanilla and if it's Hyper/Normal
  const isBounty = flags?.includes('Bounty');
  const isHyper = flags?.includes('Hyper-Turbo') || game?.includes('Hyper-Turbo');
  const isSatellite = game?.includes('Satellite') || flags?.includes('Satellite');
  
  if (isBounty && isHyper) return 'Bounty Hyper';
  if (isBounty && !isHyper) return 'Bounty Normal';
  if (isSatellite && isHyper) return 'Satellite Hyper';
  if (isSatellite && !isHyper) return 'Satellite Normal';
  if (!isBounty && !isSatellite && isHyper) return 'Vanilla Hyper';
  if (!isBounty && !isSatellite && !isHyper) return 'Vanilla Normal';
  
  return 'other';
}

// Calculate ROI from profit and stake
export const calculateROI = (profit: number, stake: number): number => {
  if (!stake || stake === 0) return 0
  return profit / stake
}

// Check if a date is within a specific period (6 months) after a major win
export const isWithinPeriod = (
  date: Date, 
  startDate: Date, 
  months: number = 6
): boolean => {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)
  return date >= startDate && date <= endDate
}

// Group data by month
export const groupByMonth = <T extends { date: string }>(
  data: T[], 
  getMonthFn: (item: T) => string = (item) => {
    const [day, month, year] = item.date.split('/')
    return `${month}/${year}`
  }
): Record<string, T[]> => {
  return data.reduce((acc, item) => {
    const month = getMonthFn(item)
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

// Filter tournaments by date range
export const filterByDateRange = <T extends { date: string }>(
  data: T[],
  startDate: Date,
  endDate: Date
): T[] => {
  return data.filter(item => {
    const itemDate = parseDate(item.date)
    return itemDate >= startDate && itemDate <= endDate
  })
}

// Function to calculate monthly stats
export function calculateMonthlyStats(tournaments: Tournament[]): MonthlyStats[] {
  const groupedByMonth = groupTournamentsByMonth(tournaments)

  return Object.entries(groupedByMonth)
    .map(([month, tournamentList]) => {
      const count = tournamentList.length

      const entries = tournamentList.reduce((sum, t) => sum + (t.entradas || 0), 0)

      const profit = tournamentList.reduce((sum, t) => sum + t.profit, 0)

      const totalBuyIn = tournamentList.reduce((sum, t) => sum + (t.buyIn || 0), 0)
      const avgBuyIn = count > 0 ? totalBuyIn / count : 0
      const avgROI = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

      // Average stack calculation - use avgBuyIn as the stack metric
      const avgStack = avgBuyIn;

      return {
        month,
        count,
        entries,
        profit,
        totalBuyIn,
        avgBuyIn,
        avgROI,
        avgStack,
      }
    })
    .sort((a, b) => {
      // Sort by date (assuming month is in format MM/YYYY)
      const [monthA, yearA] = a.month.split("/")
      const [monthB, yearB] = b.month.split("/")

      if (yearA !== yearB) return Number(yearA) - Number(yearB)
      return Number(monthA) - Number(monthB)
    })
}

// Function to group tournaments by buy-in range
export function groupTournamentsByBuyInRange(tournaments: Tournament[]): Record<string, Tournament[]> {
  return tournaments.reduce(
    (acc, tournament) => {
      const range = tournament.buyInRange || "Unknown"

      if (!acc[range]) {
        acc[range] = []
      }

      acc[range].push(tournament)
      return acc
    },
    {} as Record<string, Tournament[]>,
  )
}

// Function to group tournaments by type
export function groupTournamentsByType(tournaments: Tournament[]): Record<string, Tournament[]> {
  return tournaments.reduce(
    (acc, tournament) => {
      const type = getTournamentTypeCategory(tournament.tipoTorneio)

      if (!acc[type]) {
        acc[type] = []
      }

      acc[type].push(tournament)
      return acc
    },
    {} as Record<string, Tournament[]>,
  )
}

// Function to calculate stats for post-big win periods
export function calculatePostBigWinStats(tournaments: Tournament[]): {
  firstBigWin: MonthlyStats[]
  secondBigWin: MonthlyStats[]
} {
  const firstBigWinDate = "2022-05-23"
  const secondBigWinDate = "2023-04-06"

  const firstPeriodTournaments = tournaments.filter((t) => isWithinSixMonthsAfter(t.data, firstBigWinDate))

  const secondPeriodTournaments = tournaments.filter((t) => isWithinSixMonthsAfter(t.data, secondBigWinDate))

  return {
    firstBigWin: calculateMonthlyStats(firstPeriodTournaments),
    secondBigWin: calculateMonthlyStats(secondPeriodTournaments),
  }
}

// Function to calculate cumulative profit data for chart
export function calculateCumulativeProfitData(tournaments: Tournament[]): { date: string; profit: number }[] {
  // Sort tournaments by date
  const sortedTournaments = [...tournaments].sort((a, b) => a.data.getTime() - b.data.getTime())

  let cumulativeProfit = 0

  return sortedTournaments.map((tournament) => {
    cumulativeProfit += tournament.profit

    return {
      date: formatDate(tournament.data),
      profit: cumulativeProfit,
    }
  })
}

// Function to calculate monthly ROI data for chart
export function calculateMonthlyROIData(tournaments: Tournament[]): { month: string; roi: number }[] {
  const monthlyStats = calculateMonthlyStats(tournaments)

  return monthlyStats.map((stats) => ({
    month: stats.month,
    roi: stats.avgROI,
  }))
}

// Calculate ITM (In The Money) percentage
export function calculateITMStats(tournaments: Tournament[]): ITMStats {
  // Overall ITM
  const totalTournaments = tournaments.length
  const itmTournaments = tournaments.filter((t: Tournament) => t.prize !== undefined && t.prize > 0).length
  const itmPercentage = totalTournaments > 0 ? (itmTournaments / totalTournaments) * 100 : 0

  // Monthly ITM breakdown
  const monthlyITM = calculateMonthlyStats(tournaments).map(month => {
    const monthTournaments = tournaments.filter((t: Tournament) => {
      const tournamentDate = new Date(t.data)
      const monthYear = `${tournamentDate.toLocaleString('default', { month: 'short' })} ${tournamentDate.getFullYear()}`
      return monthYear === month.month
    })
    
    const monthlyTotal = monthTournaments.length
    const monthlyITM = monthTournaments.filter((t: Tournament) => t.prize !== undefined && t.prize > 0).length
    const monthlyITMPercentage = monthlyTotal > 0 ? (monthlyITM / monthlyTotal) * 100 : 0
    
    return {
      ...month,
      itmCount: monthlyITM,
      itmPercentage: monthlyITMPercentage
    }
  })

  // Post big hits ITM
  const firstBigWinDate = new Date('2022-05-23')
  const secondBigWinDate = new Date('2023-04-06')
  
  // Get tournaments in the 6 months after each big win
  const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000
  
  const firstBigWinPeriodEnd = new Date(firstBigWinDate.getTime() + sixMonthsInMs)
  const secondBigWinPeriodEnd = new Date(secondBigWinDate.getTime() + sixMonthsInMs)
  
  const firstPeriodTournaments = tournaments.filter((t: Tournament) => {
    const date = new Date(t.data)
    return date >= firstBigWinDate && date <= firstBigWinPeriodEnd
  })
  
  const secondPeriodTournaments = tournaments.filter((t: Tournament) => {
    const date = new Date(t.data)
    return date >= secondBigWinDate && date <= secondBigWinPeriodEnd
  })
  
  // Calculate ITM for each period
  const firstPeriodITM = firstPeriodTournaments.filter((t: Tournament) => t.prize !== undefined && t.prize > 0).length
  const firstPeriodPercentage = firstPeriodTournaments.length > 0 
    ? (firstPeriodITM / firstPeriodTournaments.length) * 100 
    : 0
  
  const secondPeriodITM = secondPeriodTournaments.filter((t: Tournament) => t.prize !== undefined && t.prize > 0).length
  const secondPeriodPercentage = secondPeriodTournaments.length > 0 
    ? (secondPeriodITM / secondPeriodTournaments.length) * 100 
    : 0

  return {
    overall: {
      totalTournaments,
      itmTournaments,
      itmPercentage
    },
    monthly: monthlyITM,
    postBigWins: {
      firstPeriod: {
        totalTournaments: firstPeriodTournaments.length,
        itmTournaments: firstPeriodITM,
        itmPercentage: firstPeriodPercentage,
        startDate: firstBigWinDate,
        endDate: firstBigWinPeriodEnd
      },
      secondPeriod: {
        totalTournaments: secondPeriodTournaments.length,
        itmTournaments: secondPeriodITM,
        itmPercentage: secondPeriodPercentage,
        startDate: secondBigWinDate,
        endDate: secondBigWinPeriodEnd
      }
    }
  }
}

// Define the ITMStats interface
export interface ITMStats {
  overall: {
    totalTournaments: number
    itmTournaments: number
    itmPercentage: number
  }
  monthly: any[]
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

// Calculate tournament elimination phases
export function calculateEliminationPhases(tournaments: Tournament[]): EliminationPhasesResult {
  // Define phases
  const phases: Record<string, PhaseData> = {
    early: { count: 0, description: 'Eliminação Precoce (Primeiros 25%)', percentage: 0 },
    middle: { count: 0, description: 'Fase Intermediária (25-50%)', percentage: 0 },
    late: { count: 0, description: 'Fase Avançada (50-90%)', percentage: 0 },
    finalTable: { count: 0, description: 'Mesa Final (Top 10%)', percentage: 0 }
  }
  
  // Count valid tournaments (those with both position and entries)
  let validTournaments = 0
  
  // Process each tournament
  tournaments.forEach((tournament: Tournament) => {
    if (!tournament.posicao || !tournament.entradas || tournament.posicao > tournament.entradas) {
      return // Skip invalid data
    }
    
    validTournaments++
    
    // Calculate percentile position (as percentage from bottom)
    const percentile = (tournament.posicao / tournament.entradas) * 100
    
    if (percentile <= 10) {
      // Final table (top 10%)
      phases.finalTable.count++
    } else if (percentile <= 50) {
      // Late phase (top 10-50%)
      phases.late.count++
    } else if (percentile <= 75) {
      // Middle phase (top 50-75%)
      phases.middle.count++
    } else {
      // Early elimination (bottom 25%)
      phases.early.count++
    }
  })
  
  // Calculate percentages
  Object.keys(phases).forEach((phase: string) => {
    phases[phase].percentage = validTournaments > 0 
      ? (phases[phase].count / validTournaments) * 100 
      : 0
  })
  
  // Post big wins elimination phases
  const firstBigWinDate = new Date('2022-05-23')
  const secondBigWinDate = new Date('2023-04-06')
  
  // Get tournaments in the 6 months after each big win
  const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000
  
  const firstBigWinPeriodEnd = new Date(firstBigWinDate.getTime() + sixMonthsInMs)
  const secondBigWinPeriodEnd = new Date(secondBigWinDate.getTime() + sixMonthsInMs)
  
  const firstPeriodTournaments = tournaments.filter((t: Tournament) => {
    const date = new Date(t.data)
    return date >= firstBigWinDate && date <= firstBigWinPeriodEnd
  })
  
  const secondPeriodTournaments = tournaments.filter((t: Tournament) => {
    const date = new Date(t.data)
    return date >= secondBigWinDate && date <= secondBigWinPeriodEnd
  })
  
  // Calculate phases for first period
  const firstPeriodPhases: Record<string, PhaseData> = {
    early: { count: 0, description: 'Eliminação Precoce (Primeiros 25%)', percentage: 0 },
    middle: { count: 0, description: 'Fase Intermediária (25-50%)', percentage: 0 },
    late: { count: 0, description: 'Fase Avançada (50-90%)', percentage: 0 },
    finalTable: { count: 0, description: 'Mesa Final (Top 10%)', percentage: 0 }
  }
  
  let validFirstPeriod = 0
  
  firstPeriodTournaments.forEach((tournament: Tournament) => {
    if (!tournament.posicao || !tournament.entradas || tournament.posicao > tournament.entradas) {
      return
    }
    
    validFirstPeriod++
    
    const percentile = (tournament.posicao / tournament.entradas) * 100
    
    if (percentile <= 10) {
      firstPeriodPhases.finalTable.count++
    } else if (percentile <= 50) {
      firstPeriodPhases.late.count++
    } else if (percentile <= 75) {
      firstPeriodPhases.middle.count++
    } else {
      firstPeriodPhases.early.count++
    }
  })
  
  Object.keys(firstPeriodPhases).forEach((phase: string) => {
    firstPeriodPhases[phase].percentage = validFirstPeriod > 0 
      ? (firstPeriodPhases[phase].count / validFirstPeriod) * 100 
      : 0
  })
  
  // Calculate phases for second period
  const secondPeriodPhases: Record<string, PhaseData> = {
    early: { count: 0, description: 'Eliminação Precoce (Primeiros 25%)', percentage: 0 },
    middle: { count: 0, description: 'Fase Intermediária (25-50%)', percentage: 0 },
    late: { count: 0, description: 'Fase Avançada (50-90%)', percentage: 0 },
    finalTable: { count: 0, description: 'Mesa Final (Top 10%)', percentage: 0 }
  }
  
  let validSecondPeriod = 0
  
  secondPeriodTournaments.forEach((tournament: Tournament) => {
    if (!tournament.posicao || !tournament.entradas || tournament.posicao > tournament.entradas) {
      return
    }
    
    validSecondPeriod++
    
    const percentile = (tournament.posicao / tournament.entradas) * 100
    
    if (percentile <= 10) {
      secondPeriodPhases.finalTable.count++
    } else if (percentile <= 50) {
      secondPeriodPhases.late.count++
    } else if (percentile <= 75) {
      secondPeriodPhases.middle.count++
    } else {
      secondPeriodPhases.early.count++
    }
  })
  
  Object.keys(secondPeriodPhases).forEach((phase: string) => {
    secondPeriodPhases[phase].percentage = validSecondPeriod > 0 
      ? (secondPeriodPhases[phase].count / validSecondPeriod) * 100 
      : 0
  })
  
  return {
    overall: phases,
    validTournaments,
    postBigWins: {
      firstPeriod: {
        phases: firstPeriodPhases,
        validTournaments: validFirstPeriod,
        startDate: firstBigWinDate,
        endDate: firstBigWinPeriodEnd
      },
      secondPeriod: {
        phases: secondPeriodPhases,
        validTournaments: validSecondPeriod,
        startDate: secondBigWinDate,
        endDate: secondBigWinPeriodEnd
      }
    }
  }
}

// Define interface for phase data
export interface PhaseData {
  count: number
  description: string
  percentage: number
}

// Define interface for elimination phases result
export interface EliminationPhasesResult {
  overall: Record<string, PhaseData>
  validTournaments: number
  postBigWins: {
    firstPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date
      endDate: Date
    }
    secondPeriod: {
      phases: Record<string, PhaseData>
      validTournaments: number
      startDate: Date
      endDate: Date
    }
  }
}

