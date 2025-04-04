import { formatDate } from "./utils"

// Mock tournament data
export const mockTournaments = [
  {
    id: 1,
    rede: "PokerStars",
    data: new Date("2022-01-15"),
    entradas: 120,
    profit: 1500,
    posicao: 3,
    prize: 2000,
    buyIn: 500,
    tipoTorneio: "PSKO",
    mesAno: "01/2022",
    buyInRange: "$500~990",
  },
  {
    id: 2,
    rede: "GGPoker",
    data: new Date("2022-02-20"),
    entradas: 200,
    profit: -200,
    posicao: 25,
    prize: 0,
    buyIn: 200,
    tipoTorneio: "Vanilla",
    mesAno: "02/2022",
    buyInRange: "$130~450",
  },
  {
    id: 3,
    rede: "PokerStars",
    data: new Date("2022-03-10"),
    entradas: 150,
    profit: 5000,
    posicao: 1,
    prize: 5500,
    buyIn: 500,
    tipoTorneio: "PSKO",
    mesAno: "03/2022",
    buyInRange: "$500~990",
  },
  {
    id: 4,
    rede: "PartyPoker",
    data: new Date("2022-04-05"),
    entradas: 80,
    profit: -100,
    posicao: 15,
    prize: 0,
    buyIn: 100,
    tipoTorneio: "Hyper",
    mesAno: "04/2022",
    buyInRange: "$60~130",
  },
  {
    id: 5,
    rede: "PokerStars",
    data: new Date("2022-05-23"),
    entradas: 500,
    profit: 134000,
    posicao: 1,
    prize: 135000,
    buyIn: 1000,
    tipoTorneio: "PSKO",
    mesAno: "05/2022",
    buyInRange: "$1k+",
  },
  {
    id: 6,
    rede: "GGPoker",
    data: new Date("2022-06-15"),
    entradas: 300,
    profit: 3000,
    posicao: 2,
    prize: 3500,
    buyIn: 500,
    tipoTorneio: "Vanilla",
    mesAno: "06/2022",
    buyInRange: "$500~990",
  },
  {
    id: 7,
    rede: "PokerStars",
    data: new Date("2022-07-20"),
    entradas: 120,
    profit: -200,
    posicao: 30,
    prize: 0,
    buyIn: 200,
    tipoTorneio: "PSKO",
    mesAno: "07/2022",
    buyInRange: "$130~450",
  },
  {
    id: 8,
    rede: "PartyPoker",
    data: new Date("2022-08-10"),
    entradas: 90,
    profit: 800,
    posicao: 5,
    prize: 1000,
    buyIn: 200,
    tipoTorneio: "Hyper",
    mesAno: "08/2022",
    buyInRange: "$130~450",
  },
  {
    id: 9,
    rede: "PokerStars",
    data: new Date("2022-09-05"),
    entradas: 150,
    profit: -300,
    posicao: 40,
    prize: 0,
    buyIn: 300,
    tipoTorneio: "PSKO",
    mesAno: "09/2022",
    buyInRange: "$130~450",
  },
  {
    id: 10,
    rede: "GGPoker",
    data: new Date("2022-10-15"),
    entradas: 200,
    profit: 2000,
    posicao: 3,
    prize: 2500,
    buyIn: 500,
    tipoTorneio: "Vanilla",
    mesAno: "10/2022",
    buyInRange: "$500~990",
  },
  {
    id: 11,
    rede: "PokerStars",
    data: new Date("2022-11-20"),
    entradas: 100,
    profit: -150,
    posicao: 25,
    prize: 0,
    buyIn: 150,
    tipoTorneio: "PSKO",
    mesAno: "11/2022",
    buyInRange: "$130~450",
  },
  {
    id: 12,
    rede: "PartyPoker",
    data: new Date("2022-12-10"),
    entradas: 80,
    profit: 400,
    posicao: 8,
    prize: 550,
    buyIn: 150,
    tipoTorneio: "Hyper",
    mesAno: "12/2022",
    buyInRange: "$130~450",
  },
  {
    id: 13,
    rede: "PokerStars",
    data: new Date("2023-01-05"),
    entradas: 120,
    profit: -200,
    posicao: 30,
    prize: 0,
    buyIn: 200,
    tipoTorneio: "PSKO",
    mesAno: "01/2023",
    buyInRange: "$130~450",
  },
  {
    id: 14,
    rede: "GGPoker",
    data: new Date("2023-02-15"),
    entradas: 150,
    profit: 1000,
    posicao: 4,
    prize: 1300,
    buyIn: 300,
    tipoTorneio: "Vanilla",
    mesAno: "02/2023",
    buyInRange: "$130~450",
  },
  {
    id: 15,
    rede: "PokerStars",
    data: new Date("2023-03-20"),
    entradas: 200,
    profit: -400,
    posicao: 50,
    prize: 0,
    buyIn: 400,
    tipoTorneio: "PSKO",
    mesAno: "03/2023",
    buyInRange: "$130~450",
  },
  {
    id: 16,
    rede: "BSOP",
    data: new Date("2023-04-06"),
    entradas: 300,
    profit: 50000,
    posicao: 1,
    prize: 55000,
    buyIn: 5000,
    tipoTorneio: "Vanilla",
    mesAno: "04/2023",
    buyInRange: "$1k+",
  },
  {
    id: 17,
    rede: "PokerStars",
    data: new Date("2023-05-10"),
    entradas: 120,
    profit: 800,
    posicao: 5,
    prize: 1100,
    buyIn: 300,
    tipoTorneio: "PSKO",
    mesAno: "05/2023",
    buyInRange: "$130~450",
  },
  {
    id: 18,
    rede: "GGPoker",
    data: new Date("2023-06-15"),
    entradas: 150,
    profit: -250,
    posicao: 35,
    prize: 0,
    buyIn: 250,
    tipoTorneio: "Vanilla",
    mesAno: "06/2023",
    buyInRange: "$130~450",
  },
  {
    id: 19,
    rede: "PokerStars",
    data: new Date("2023-07-20"),
    entradas: 100,
    profit: 600,
    posicao: 6,
    prize: 800,
    buyIn: 200,
    tipoTorneio: "PSKO",
    mesAno: "07/2023",
    buyInRange: "$130~450",
  },
  {
    id: 20,
    rede: "PartyPoker",
    data: new Date("2023-08-10"),
    entradas: 80,
    profit: -150,
    posicao: 20,
    prize: 0,
    buyIn: 150,
    tipoTorneio: "Hyper",
    mesAno: "08/2023",
    buyInRange: "$130~450",
  },
]

// Generate cumulative profit data
export function generateCumulativeProfitData() {
  let cumulativeProfit = 0
  return mockTournaments
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .map((tournament) => {
      cumulativeProfit += tournament.profit
      return {
        date: formatDate(tournament.data),
        profit: cumulativeProfit,
      }
    })
}

// Generate monthly ROI data (total profit/buyin per month)
export function generateMonthlyROIData() {
  const monthlyData: Record<string, { profit: number; buyIn: number }> = {}

  mockTournaments.forEach((tournament) => {
    const monthYear = tournament.mesAno || ''
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { profit: 0, buyIn: 0 }
    }
    monthlyData[monthYear].profit += tournament.profit
    monthlyData[monthYear].buyIn += tournament.buyIn || 0
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      roi: data.buyIn > 0 ? (data.profit / data.buyIn) * 100 : 0,
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split("/")
      const [monthB, yearB] = b.month.split("/")
      if (yearA !== yearB) return Number(yearA) - Number(yearB)
      return Number(monthA) - Number(monthB)
    })
}

// Generate average tournament ROI per month (average of individual tournament ROIs)
export function generateMonthlyTournamentROIData() {
  const monthlyData: Record<string, { tournaments: { profit: number; buyIn: number }[] }> = {}

  mockTournaments.forEach((tournament) => {
    const monthYear = tournament.mesAno || ''
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { tournaments: [] }
    }
    monthlyData[monthYear].tournaments.push({
      profit: tournament.profit,
      buyIn: tournament.buyIn || 0
    })
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => {
      const tournamentROIs = data.tournaments.map(t => 
        t.buyIn > 0 ? (t.profit / t.buyIn) * 100 : 0
      )
      const averageROI = tournamentROIs.length > 0 
        ? tournamentROIs.reduce((sum, roi) => sum + roi, 0) / tournamentROIs.length
        : 0

      return {
        month,
        roi: averageROI
      }
    })
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split("/")
      const [monthB, yearB] = b.month.split("/")
      if (yearA !== yearB) return Number(yearA) - Number(yearB)
      return Number(monthA) - Number(monthB)
    })
}
