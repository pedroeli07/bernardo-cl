import { NextResponse } from "next/server"
import { query, isDatabaseAvailable } from "@/lib/db-direct"
import { mockTournaments } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const tournamentType = searchParams.get("type")
    const buyInRange = searchParams.get("buyInRange")

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // Build query
      let whereClause = ""
      const params: any[] = []
      let paramIndex = 1

      if (tournamentType) {
        whereClause += `WHERE "tipoTorneio" = $${paramIndex}`
        params.push(tournamentType)
        paramIndex++
      }

      if (buyInRange) {
        whereClause += whereClause ? ` AND "buyInRange" = $${paramIndex}` : `WHERE "buyInRange" = $${paramIndex}`
        params.push(buyInRange)
        paramIndex++
      }

      // Get tournaments
      const tournamentsResult = await query(
        `
        SELECT * FROM "DadosTorneio"
        ${whereClause}
        ORDER BY data DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
        [...params, limit, (page - 1) * limit],
      )

      // Get total count
      const countResult = await query(
        `
        SELECT COUNT(*) FROM "DadosTorneio"
        ${whereClause}
      `,
        params,
      )

      const total = Number.parseInt(countResult.rows[0].count)

      return NextResponse.json({
        data: tournamentsResult.rows,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    } else {
      // Use mock data if database is not available
      console.log("Database not available, using mock data")

      // Filter mock data based on query parameters
      let filteredData = [...mockTournaments]

      if (tournamentType) {
        filteredData = filteredData.filter((t) => t.tipoTorneio === tournamentType)
      }

      if (buyInRange) {
        filteredData = filteredData.filter((t) => t.buyInRange === buyInRange)
      }

      // Sort by date descending
      filteredData.sort((a, b) => b.data.getTime() - a.data.getTime())

      // Paginate
      const total = filteredData.length
      const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

      return NextResponse.json({
        data: paginatedData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json(
      { error: `Failed to fetch tournaments: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

