import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { randomBytes, randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é admin
    const [adminCheck] = await queryDb<{ is_admin: number }>("SELECT is_admin FROM users WHERE id = ?", [
      session.user.id,
    ])

    console.log("[v0] Admin check:", { userId: session.user.id, isAdmin: adminCheck?.is_admin })

    if (!adminCheck || adminCheck.is_admin !== 1) {
      return Response.json({ error: "Sem permissão de admin" }, { status: 403 })
    }

    const { discordId, planType } = await request.json()

    console.log("[v0] Creating license:", { discordId, planType })

    // Buscar ou criar usuário
    let [targetUser] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [discordId])

    if (!targetUser) {
      const newUserId = randomUUID()
      await queryDb(
        "INSERT INTO users (id, discord_id, discord_username, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [newUserId, discordId, "New User"],
      )
      targetUser = { id: newUserId }
      console.log("[v0] Created new user:", newUserId)
    }

    // Gerar chave de licença
    const licenseKey = `NEXVO-${randomBytes(12).toString("hex").toUpperCase()}`

    // Criar licença
    const licenseId = randomUUID()
    await queryDb(
      "INSERT INTO licenses (id, license_key, user_id, status, plan_type, created_at) VALUES (?, ?, ?, 'active', ?, NOW())",
      [licenseId, licenseKey, targetUser.id, planType],
    )

    console.log("[v0] License created:", { licenseId, licenseKey })

    return Response.json({ success: true, licenseKey })
  } catch (error) {
    console.error("[v0] Error creating license:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
