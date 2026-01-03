import type { NextRequest } from "next/server"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, vpsIp, stats } = await request.json()

    if (!licenseKey || !vpsIp) {
      return NextResponse.json({ error: "License key and VPS IP are required", success: false }, { status: 400 })
    }

    // Buscar licença com validação completa
    const [license] = await queryDb<{
      id: string
      status: string
      vps_ip: string | null
      expires_at: string | null
    }>("SELECT id, status, vps_ip, expires_at FROM licenses WHERE license_key = ?", [licenseKey])

    if (!license) {
      return NextResponse.json({ error: "Invalid license key", success: false }, { status: 404 })
    }

    // Verificar se expirou
    if (license.expires_at) {
      const expiresAt = new Date(license.expires_at)
      const now = new Date()

      if (expiresAt < now) {
        await queryDb("UPDATE licenses SET status = 'expired' WHERE id = ?", [license.id])
        return NextResponse.json({ error: "License expired", success: false, shouldStop: true }, { status: 403 })
      }
    }

    // Verificar status
    if (license.status !== "active") {
      return NextResponse.json(
        { error: `License is ${license.status}`, success: false, shouldStop: true },
        { status: 403 }
      )
    }

    // Verificar IP
    if (license.vps_ip !== vpsIp) {
      return NextResponse.json({ error: "VPS IP mismatch", success: false, shouldStop: true }, { status: 403 })
    }

    // Atualizar heartbeat
    await queryDb("UPDATE licenses SET last_heartbeat = NOW() WHERE id = ?", [license.id])

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: license.status,
    })
  } catch (error) {
    console.error("[Bot Heartbeat] Error:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
