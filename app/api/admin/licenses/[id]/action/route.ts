import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { action } = await request.json()

    // Validar action
    const validActions = ["suspend", "activate", "expire", "delete"]
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }

    // Executar ação
    if (action === "delete") {
      await queryDb("DELETE FROM licenses WHERE id = ?", [id])
      return NextResponse.json({
        success: true,
        message: "Licença deletada com sucesso",
      })
    }

    // Mapear ação para status
    const statusMap: Record<string, string> = {
      suspend: "suspended",
      activate: "active",
      expire: "expired",
    }

    const newStatus = statusMap[action]

    await queryDb("UPDATE licenses SET status = ?, updated_at = NOW() WHERE id = ?", [newStatus, id])

    return NextResponse.json({
      success: true,
      message: `Licença ${action === "suspend" ? "suspensa" : action === "activate" ? "ativada" : "expirada"} com sucesso`,
    })
  } catch (error: any) {
    console.error("[Admin] Error managing license:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    )
  }
}
