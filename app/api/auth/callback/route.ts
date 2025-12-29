import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { queryDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return Response.redirect(new URL("/", request.url))
  }

  try {
    // Trocar código por token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    })

    const tokenData = await tokenResponse.json()

    // Buscar dados do usuário
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const discordUser = await userResponse.json()

    // Criar ou atualizar usuário no banco
    const userId = randomUUID()
    await queryDb(
      `INSERT INTO users (id, discord_id, discord_username, discord_avatar, email) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       discord_username = VALUES(discord_username),
       discord_avatar = VALUES(discord_avatar),
       email = VALUES(email),
       id = LAST_INSERT_ID(id)`,
      [userId, discordUser.id, discordUser.username, discordUser.avatar, discordUser.email],
    )

    // Buscar ID do usuário
    const [user] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [discordUser.id])

    // Criar sessão
    const cookieStore = await cookies()
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return Response.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return Response.redirect(new URL("/", request.url))
  }
}
