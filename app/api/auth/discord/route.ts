import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { queryDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // Se NÃO tem código → é o início do login: redireciona pro Discord
  if (!code) {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify%20email`

    return Response.redirect(discordAuthUrl)
  }

  // Se TEM código → é o callback: processa o token, cria sessão, etc.
  try {
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

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const discordUser = await userResponse.json()

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

    const [user] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [discordUser.id])

    const cookieStore = await cookies()
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return Response.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("[Auth] Error:", error)
    return Response.redirect(new URL("/", request.url))
  }
}