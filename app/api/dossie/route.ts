import { NextResponse } from "next/server"
import { getDossieData } from "@/app/actions"

export async function GET() {
  try {
    const data = await getDossieData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in dossie API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch dossie data" },
      { status: 500 }
    )
  }
} 