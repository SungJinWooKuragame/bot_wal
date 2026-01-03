import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Buscar todas as licenças com informações do usuário
    const licenses = await queryDb<{
      id: string
      license_key: string
      user_id: string
      status: string
      plan_type: string
      vps_ip: string | null
      last_heartbeat: string | null
      expires_at: string | null
      created_at: string
      discord_username: string
      discord_id: string
    }>(
      `SELECT 
        l.*,
        u.discord_username,
        u.discord_id
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC`
    )

    return NextResponse.json({
      success: true,
      licenses,
    })
  } catch (error: any) {
    console.error("[Admin] Error fetching licenses:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    )
  }
}
