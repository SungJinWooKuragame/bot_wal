import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
        session: null,
      })
    }

    // Tenta buscar admin status do banco
    let adminStatus = null
    let dbError = null

    try {
      const users = await queryDb<{ is_admin: number; discord_id: string }>(
        "SELECT is_admin, discord_id FROM users WHERE discord_id = ?",
        [session.user.discordId],
      )

      if (users && users.length > 0) {
        adminStatus = users[0]
      }
    } catch (error: any) {
      dbError = error.message
    }

    return NextResponse.json({
      success: true,
      session: {
        user: session.user,
      },
      adminStatus,
      dbError,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    )
  }
}
