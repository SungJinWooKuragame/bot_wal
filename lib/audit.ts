import { queryDb } from "@/lib/db"

export interface AuditLogEntry {
  id: string
  user_id: string
  license_id: string | null
  action: string
  details: Record<string, any>
  ip_address: string | null
  created_at: string
}

export async function logAction(
  userId: string,
  action: string,
  details: Record<string, any> = {},
  licenseId?: string,
  ipAddress?: string
) {
  try {
    const id = require("crypto").randomUUID()
    await queryDb(
      `INSERT INTO audit_logs (id, user_id, license_id, action, details, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        licenseId || null,
        action,
        JSON.stringify(details),
        ipAddress || null,
      ]
    )
  } catch (error) {
    console.error("[Audit Log] Error logging action:", error)
  }
}

export async function getLogs(
  filters: {
    userId?: string
    licenseId?: string
    action?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}
) {
  try {
    const { userId, licenseId, action, startDate, endDate, limit = 50, offset = 0 } = filters

    let query = "SELECT * FROM audit_logs WHERE 1=1"
    const params: any[] = []

    if (userId) {
      query += " AND user_id = ?"
      params.push(userId)
    }

    if (licenseId) {
      query += " AND license_id = ?"
      params.push(licenseId)
    }

    if (action) {
      query += " AND action = ?"
      params.push(action)
    }

    if (startDate) {
      query += " AND created_at >= ?"
      params.push(startDate)
    }

    if (endDate) {
      query += " AND created_at <= ?"
      params.push(endDate)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const logs = await queryDb<AuditLogEntry>(query, params)

    return logs.map((log) => ({
      ...log,
      details: typeof log.details === "string" ? JSON.parse(log.details) : log.details,
    }))
  } catch (error) {
    console.error("[Audit Log] Error getting logs:", error)
    return []
  }
}
