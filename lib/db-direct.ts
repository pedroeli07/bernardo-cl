import { createPool } from "@vercel/postgres"

// Create a SQL client with explicit connection string
const sql = createPool({
  connectionString: process.env.DATABASE_URL
})

// Helper function to execute SQL queries
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now()
    const result = await sql.query(text, params || [])
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// No need for pool management with Vercel Postgres
export async function getClient() {
  return {
    query: async (text: string, params?: any[]) => {
      return await query(text, params)
    },
    release: () => {
      console.log("Client released")
    },
  }
}

// No need to close connections with Vercel Postgres
export async function closePool() {
  // No-op for Vercel Postgres
  return
}

// Check if database connection is available
export async function isDatabaseAvailable() {
  try {
    await sql.query('SELECT 1')
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

