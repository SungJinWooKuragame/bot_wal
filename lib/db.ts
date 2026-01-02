import mysql from "mysql2/promise"

// Singleton pattern para conexão MySQL
let pool: mysql.Pool | null = null

function parseDatabaseUrl(url: string) {
  // Format: mysql://user:password@host:port/database ou mysql://user@host:port/database
  const match = url.match(/mysql:\/\/([^:@]+)(?::([^@]*))?@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    throw new Error("Invalid DATABASE_URL format")
  }
  return {
    user: match[1],
    password: match[2] || "", // Senha pode ser vazia
    host: match[3],
    port: Number.parseInt(match[4]),
    database: match[5],
  }
}

export function getDbPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    console.log("[v0] Creating database connection pool")
    const config = parseDatabaseUrl(databaseUrl)

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })

    console.log("[v0] Database pool created successfully")
  }
  return pool
}

export async function queryDb<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const pool = getDbPool()
    console.log("[v0] Executing query:", sql, "with params:", params)
    const [rows] = await pool.execute(sql, params)
    console.log("[v0] Query successful, rows:", Array.isArray(rows) ? rows.length : 0)
    return rows as T[]
  } catch (error) {
    console.error("[v0] Database query error:", error)
    console.error("[v0] SQL:", sql)
    console.error("[v0] Params:", params)
    throw error
  }
}
