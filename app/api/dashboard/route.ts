import { NextResponse } from "next/server"
import { getDashboardStats } from "@/app/actions"

export async function GET() {
  try {
    const data = await getDashboardStats()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in dashboard API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
} 