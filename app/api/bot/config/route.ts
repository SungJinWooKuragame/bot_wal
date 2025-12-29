import type { NextRequest } from "next/server"
import { queryDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const licenseKey = searchParams.get("licenseKey")

    if (!licenseKey) {
      return Response.json({ error: "License key is required" }, { status: 400 })
    }

    // Buscar licença
    const [license] = await queryDb<{ id: string; status: string }>(
      "SELECT id, status FROM licenses WHERE license_key = ?",
      [licenseKey],
    )

    if (!license || license.status !== "active") {
      return Response.json({ error: "Invalid or inactive license" }, { status: 403 })
    }

    // Buscar configuração
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
    console.error("[v0] Config fetch error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
