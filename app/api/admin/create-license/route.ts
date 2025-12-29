import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { randomBytes, randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Verificar se é admin
    const [adminCheck] = await queryDb<{ is_admin: boolean }>("SELECT is_admin FROM users WHERE id = ?", [user.id])

    if (!adminCheck?.is_admin) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { discordId, planType } = await request.json()

    // Buscar ou criar usuário
    let [targetUser] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [discordId])

    if (!targetUser) {
      const newUserId = randomUUID()
      await queryDb("INSERT INTO users (id, discord_id, discord_username) VALUES (?, ?, ?)", [
        newUserId,
        discordId,
        "Unknown User",
      ])
      targetUser = { id: newUserId }
    }

    // Gerar chave de licença
    const licenseKey = `FL-${randomBytes(16).toString("hex").toUpperCase()}`

    // Criar licença
    const licenseId = randomUUID()
    await queryDb("INSERT INTO licenses (id, license_key, user_id, status, plan_type) VALUES (?, ?, ?, 'active', ?)", [
      licenseId,
      licenseKey,
      targetUser.id,
      planType,
    ])

    return Response.json({ success: true, licenseKey })
  } catch (error) {
    console.error("[v0] Error creating license:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
