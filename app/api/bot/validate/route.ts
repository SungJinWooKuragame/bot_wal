import type { NextRequest } from "next/server"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

// Helper para registrar logs
async function logValidation(licenseId: string, ip: string, success: boolean, error?: string) {
  try {
    await queryDb(
      "INSERT INTO validation_logs (id, license_id, ip_address, success, error_message) VALUES (UUID(), ?, ?, ?, ?)",
      [licenseId, ip, success, error || null]
    )
  } catch (err) {
    console.error("[Bot Validate] Error logging validation:", err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, vpsIp, botVersion } = await request.json()

    // Validação básica
    if (!licenseKey || !vpsIp) {
      return NextResponse.json(
        { error: "License key and VPS IP are required", valid: false },
        { status: 400 }
      )
    }

    // Buscar licença com informações completas
    const [license] = await queryDb<{
      id: string
      status: string
      vps_ip: string | null
      user_id: string
      expires_at: string | null
      plan_type: string
    }>("SELECT id, status, vps_ip, user_id, expires_at, plan_type FROM licenses WHERE license_key = ?", [
      licenseKey,
    ])

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key. Please check your license or contact support.", valid: false },
        { status: 404 }
      )
    }

    // 1. Verificar expiração PRIMEIRO (antes de outras validações)
    if (license.expires_at) {
      const expiresAt = new Date(license.expires_at)
      const now = new Date()

      if (expiresAt < now) {
        // Expirou - atualizar status
        await queryDb("UPDATE licenses SET status = 'expired' WHERE id = ?", [license.id])
        await logValidation(license.id, vpsIp, false, "License expired")
        return NextResponse.json({ error: "License expired. Please renew your license.", valid: false }, { status: 403 })
      }
    }

    // 2. Verificar status da licença
    if (license.status === "suspended") {
      await logValidation(license.id, vpsIp, false, "License suspended by admin")
      return NextResponse.json(
        { error: "License suspended by administrator. Contact support for more information.", valid: false },
        { status: 403 }
      )
    }

    if (license.status === "expired") {
      await logValidation(license.id, vpsIp, false, "License expired")
      return NextResponse.json({ error: "License expired. Please renew your license.", valid: false }, { status: 403 })
    }

    if (license.status === "revoked") {
      await logValidation(license.id, vpsIp, false, "License revoked")
      return NextResponse.json({ error: "License has been revoked.", valid: false }, { status: 403 })
    }

    if (license.status !== "active") {
      await logValidation(license.id, vpsIp, false, `Invalid status: ${license.status}`)
      return NextResponse.json({ error: `License status: ${license.status}`, valid: false }, { status: 403 })
    }

    // 3. Verificar configuração de IP
    if (!license.vps_ip) {
      await logValidation(license.id, vpsIp, false, "VPS IP not configured")
      return NextResponse.json(
        {
          error: "VPS IP not configured. Please configure your VPS IP in the dashboard first.",
          valid: false,
        },
        { status: 403 }
      )
    }

    // 4. Verificar IP match
    if (license.vps_ip !== vpsIp) {
      await logValidation(license.id, vpsIp, false, `IP mismatch: expected ${license.vps_ip}, got ${vpsIp}`)
      return NextResponse.json(
        {
          error: `VPS IP mismatch. This license is bound to ${license.vps_ip}. Current IP: ${vpsIp}`,
          valid: false,
        },
        { status: 403 }
      )
    }

    // 5. Atualizar heartbeat e bot version
    await queryDb("UPDATE licenses SET last_heartbeat = NOW(), bot_version = ? WHERE id = ?", [
      botVersion || null,
      license.id,
    ])

    // 6. Registrar validação bem-sucedida
    await logValidation(license.id, vpsIp, true)

    // 7. Buscar configuração do bot
    const [config] = await queryDb<{
      guild_id: string | null
      whitelist_role_id: string | null
      log_channel_id: string | null
      accept_channel_id: string | null
      reprove_channel_id: string | null
      embed_color: string
      welcome_message: string | null
    }>("SELECT * FROM bot_configs WHERE license_id = ?", [license.id])

    return NextResponse.json({
      valid: true,
      license: {
        id: license.id,
        status: license.status,
        plan_type: license.plan_type,
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
