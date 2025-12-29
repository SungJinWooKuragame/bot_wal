import type { NextRequest } from "next/server"
import { queryDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, vpsIp, botVersion } = await request.json()

    if (!licenseKey || !vpsIp) {
      return Response.json({ error: "License key and VPS IP are required", valid: false }, { status: 400 })
    }

    // Buscar licença
    const [license] = await queryDb<{
      id: string
      status: string
      vps_ip: string | null
      user_id: string
      expires_at: string | null
    }>("SELECT id, status, vps_ip, user_id, expires_at FROM licenses WHERE license_key = ?", [licenseKey])

    if (!license) {
      return Response.json({ error: "Invalid license key", valid: false }, { status: 404 })
    }

    // Verificar status
    if (license.status !== "active") {
      await queryDb(
        "INSERT INTO validation_logs (id, license_id, ip_address, success, error_message) VALUES (UUID(), ?, ?, ?, ?)",
        [license.id, vpsIp, false, `License status: ${license.status}`],
      )
      return Response.json({ error: `License is ${license.status}`, valid: false }, { status: 403 })
    }

    // Verificar expiração
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      await queryDb("UPDATE licenses SET status = 'expired' WHERE id = ?", [license.id])
      return Response.json({ error: "License expired", valid: false }, { status: 403 })
    }

    // Verificar IP da VPS
    if (!license.vps_ip) {
      return Response.json(
        { error: "VPS IP not configured. Please configure it in the dashboard.", valid: false },
        {
          status: 403,
        },
      )
    }

    if (license.vps_ip !== vpsIp) {
      await queryDb(
        "INSERT INTO validation_logs (id, license_id, ip_address, success, error_message) VALUES (UUID(), ?, ?, ?, ?)",
        [license.id, vpsIp, false, `IP mismatch: expected ${license.vps_ip}, got ${vpsIp}`],
      )
      return Response.json(
        { error: "VPS IP mismatch. This license is bound to a different server.", valid: false },
        { status: 403 },
      )
    }

    // Atualizar heartbeat
    await queryDb("UPDATE licenses SET last_heartbeat = NOW(), bot_version = ? WHERE id = ?", [
      botVersion || null,
      license.id,
    ])

    // Registrar validação bem-sucedida
    await queryDb("INSERT INTO validation_logs (id, license_id, ip_address, success) VALUES (UUID(), ?, ?, ?)", [
      license.id,
      vpsIp,
      true,
    ])

    // Buscar configuração do bot
    const [config] = await queryDb<{
      guild_id: string | null
      whitelist_role_id: string | null
      log_channel_id: string | null
      accept_channel_id: string | null
      reprove_channel_id: string | null
      embed_color: string
      welcome_message: string | null
    }>("SELECT * FROM bot_configs WHERE license_id = ?", [license.id])

    return Response.json({
      valid: true,
      license: {
        id: license.id,
        status: license.status,
        plan_type: "lifetime",
      },
      config: config || {
        guild_id: null,
        whitelist_role_id: null,
        log_channel_id: null,
        accept_channel_id: null,
        reprove_channel_id: null,
        embed_color: "#0099ff",
        welcome_message: null,
      },
    })
  } catch (error) {
    console.error("[v0] Bot validation error:", error)
    return Response.json({ error: "Internal server error", valid: false }, { status: 500 })
  }
}
