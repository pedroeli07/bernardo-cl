"use server"

import { query, isDatabaseAvailable } from "@/lib/db-direct"
import { mockTournaments, generateCumulativeProfitData, generateMonthlyROIData } from "@/lib/mock-data"
import {
  calculateMonthlyStats,
  calculatePostBigWinStats,
  calculateCumulativeProfitData,
  calculateMonthlyROIData,
  groupTournamentsByBuyInRange,
  groupTournamentsByType,
  calculateITMStats,
  calculateEliminationPhases
} from "@/lib/data-utils"

export async function getDashboardStats() {
  try {
    let tournaments

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Get all tournaments from database
      const result = await query(`
        SELECT * FROM "DadosTorneio"
        ORDER BY data ASC
      `)

      tournaments = result.rows.map((row) => ({
        ...row,
        data: new Date(row.data),
        entradas: row.entradas || 0,
        profit: Number.parseFloat(row.profit),
        posicao: row.posicao || null,
        prize: row.prize ? Number.parseFloat(row.prize) : 0,
        buyIn: row.buyIn ? Number.parseFloat(row.buyIn) : 0,
      }))
    } else {
      // Use mock data if database is not available
      console.log("Database not available, using mock data")
      tournaments = mockTournaments
    }

    // Get total tournaments
    const totalTournaments = tournaments.length

    // Get total profit
    const totalProfit = tournaments.reduce((sum, t) => sum + t.profit, 0)

    // Get total buy-in
    const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0)

    // Calculate ROI
    const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0

    // Get highest prize
    const highestPrize = tournaments.reduce(
      (max, t) => (t.prize && t.prize > max.prize ? { prize: t.prize, date: t.data } : max),
      { prize: 0, date: new Date() },
    )

    // Calculate monthly stats
    const monthlyStats = calculateMonthlyStats(tournaments)

    // Get best monthly ROI
    const bestMonthlyRoi = monthlyStats.reduce(
      (max, stats) => (stats.avgROI > max.roi ? { roi: stats.avgROI, month: stats.month } : max),
      { roi: 0, month: "" },
    )

    // Calculate cumulative profit data for chart
    const cumulativeProfitData = dbAvailable
      ? calculateCumulativeProfitData(tournaments)
      : generateCumulativeProfitData()

    // Calculate monthly ROI data for chart
    const monthlyROIData = dbAvailable ? calculateMonthlyROIData(tournaments) : generateMonthlyROIData()

    // Group tournaments by buy-in range
    const tournamentsByBuyInRange = groupTournamentsByBuyInRange(tournaments)

    // Group tournaments by type
    const tournamentsByType = groupTournamentsByType(tournaments)

    // Calculate post-big win stats
    const postBigWinStats = calculatePostBigWinStats(tournaments)

    return {
      totalTournaments,
      totalProfit,
      roi,
      highestPrize,
      bestMonthlyRoi,
      cumulativeProfitData,
      monthlyROIData,
      tournamentsByBuyInRange,
      tournamentsByType,
      postBigWinStats,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw new Error(`Failed to fetch dashboard stats: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getDossieData() {
  try {
    let tournaments

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Get all tournaments from database
      const result = await query(`
        SELECT * FROM "DadosTorneio"
        ORDER BY data ASC
      `)

      tournaments = result.rows.map((row) => ({
        ...row,
        data: new Date(row.data),
        entradas: row.entradas || 0,
        profit: Number.parseFloat(row.profit),
        posicao: row.posicao || null,
        prize: row.prize ? Number.parseFloat(row.prize) : 0,
        buyIn: row.buyIn ? Number.parseFloat(row.buyIn) : 0,
      }))
    } else {
      // Use mock data if database is not available
      console.log("Database not available, using mock data")
      tournaments = mockTournaments
    }

    // Calculate monthly stats
    const monthlyStats = calculateMonthlyStats(tournaments)

    // Calculate post-big win stats
    const postBigWinStats = calculatePostBigWinStats(tournaments)

    // Group tournaments by buy-in range
    const tournamentsByBuyInRange = groupTournamentsByBuyInRange(tournaments)
    const buyInRangeStats = Object.entries(tournamentsByBuyInRange).map(([range, tournamentList]) => {
      const count = tournamentList.length
      const profit = tournamentList.reduce((sum, t) => sum + t.profit, 0)
      const totalBuyIn = tournamentList.reduce((sum, t) => sum + (t.buyIn || 0), 0)
      const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

      return {
        range,
        count,
        profit,
        roi,
      }
    })

    // Group tournaments by type
    const tournamentsByType = groupTournamentsByType(tournaments)
    const typeStats = Object.entries(tournamentsByType).map(([type, tournamentList]) => {
      const count = tournamentList.length
      const profit = tournamentList.reduce((sum, t) => sum + t.profit, 0)
      const totalBuyIn = tournamentList.reduce((sum, t) => sum + (t.buyIn || 0), 0)
      const roi = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0

      return {
        type,
        count,
        profit,
        roi,
      }
    })

    // Calculate ITM (In The Money) stats
    const itmStats = calculateITMStats(tournaments)

    // Calculate elimination phases stats
    const eliminationPhases = calculateEliminationPhases(tournaments)

    return {
      monthlyStats,
      postBigWinStats,
      buyInRangeStats,
      typeStats,
      itmStats,
      eliminationPhases
    }
  } catch (error) {
    console.error("Error fetching dossie data:", error)
    throw new Error(`Failed to fetch dossie data: ${error instanceof Error ? error.message : String(error)}`)
  }
}

