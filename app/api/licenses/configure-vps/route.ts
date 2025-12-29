import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { licenseId, vpsIp } = await request.json()

    // Validar IP
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ipRegex.test(vpsIp)) {
      return Response.json({ error: "IP inválido" }, { status: 400 })
    }

    // Verificar se a licença pertence ao usuário
    const [license] = await queryDb<{ id: string; vps_ip: string | null }>(
      "SELECT id, vps_ip FROM licenses WHERE id = ? AND user_id = ?",
      [licenseId, user.id],
    )

    if (!license) {
      return Response.json({ error: "Licença não encontrada" }, { status: 404 })
    }

    // Atualizar IP da VPS
    await queryDb("UPDATE licenses SET vps_ip = ?, activated_at = NOW() WHERE id = ?", [vpsIp, licenseId])

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error configuring VPS:", error)
    return Response.json({ error: "Erro ao configurar VPS" }, { status: 500 })
  }
}
