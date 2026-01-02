import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  return NextResponse.json({
    session,
    hasUser: !!session?.user,
    isAdmin: session?.user?.isAdmin,
    discordId: session?.user?.discordId,
  })
}
