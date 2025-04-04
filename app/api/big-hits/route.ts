import { NextResponse } from "next/server"
import { query, isDatabaseAvailable } from "@/lib/db-direct"
import { mockTournaments } from "@/lib/mock-data"

export async function GET() {
  try {
    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()

    let data

    if (dbAvailable) {
      // Get top 20 tournaments by prize from database
      const result = await query(`
        SELECT * FROM "DadosTorneio"
        WHERE prize > 0
        ORDER BY prize DESC
        LIMIT 20
      `)

      data = result.rows.map((row) => ({
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
      data = mockTournaments
        .filter((t) => t.prize && t.prize > 0)
        .sort((a, b) => (b.prize || 0) - (a.prize || 0))
        .slice(0, 20)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in big-hits API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch big hits data" },
      { status: 500 }
    )
  }
} 