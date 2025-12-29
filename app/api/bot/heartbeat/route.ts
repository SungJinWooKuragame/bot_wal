import type { NextRequest } from "next/server"
import { queryDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, vpsIp, stats } = await request.json()

    if (!licenseKey || !vpsIp) {
      return Response.json({ error: "License key and VPS IP are required" }, { status: 400 })
    }

    // Buscar licença
    const [license] = await queryDb<{
      id: string
      status: string
      vps_ip: string | null
    }>("SELECT id, status, vps_ip FROM licenses WHERE license_key = ?", [licenseKey])

    if (!license) {
      return Response.json({ error: "Invalid license key" }, { status: 404 })
    }

    // Verificar IP
    if (license.vps_ip !== vpsIp) {
      return Response.json({ error: "VPS IP mismatch" }, { status: 403 })
    }

    // Atualizar heartbeat
    await queryDb("UPDATE licenses SET last_heartbeat = NOW() WHERE id = ?", [license.id])

    return Response.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("[v0] Heartbeat error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
