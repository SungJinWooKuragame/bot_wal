import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { vpsIp } = await request.json()

    if (!vpsIp) {
      return Response.json({ error: "IP da VPS é obrigatório" }, { status: 400 })
    }

    // Verificar se o IP já está em uso por outra licença
    const [existingLicense] = await queryDb<{ id: string; license_key: string }>(
      "SELECT id, license_key FROM licenses WHERE vps_ip = ? AND status = 'active'",
      [vpsIp],
    )

    if (existingLicense) {
      return Response.json(
        {
          available: false,
          message: "Este IP já está vinculado a outra licença ativa",
        },
        { status: 409 },
      )
    }

    return Response.json({
      available: true,
      message: "IP disponível para vinculação",
    })
  } catch (error) {
    console.error("[v0] Error checking IP:", error)
    return Response.json({ error: "Erro ao verificar IP" }, { status: 500 })
  }
}
