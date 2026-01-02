import { getDbPool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[Debug] Testing database connection...")
    console.log("[Debug] DATABASE_URL:", process.env.DATABASE_URL)

    const pool = getDbPool()
    const connection = await pool.getConnection()
    
    console.log("[Debug] Connection successful!")
    
    const [result] = await connection.query("SELECT 1 as test")
    connection.release()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result,
      env: {
        databaseUrl: process.env.DATABASE_URL,
      },
    })
  } catch (error: any) {
    console.error("[Debug] Connection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
        code: error.code,
        env: {
          databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
        },
      },
      { status: 500 },
    )
  }
}
