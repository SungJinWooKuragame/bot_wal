import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getLogs } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters = {
      action: searchParams.get("action") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    }

    const logs = await getLogs(filters)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error: any) {
    console.error("[Audit Logs] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
