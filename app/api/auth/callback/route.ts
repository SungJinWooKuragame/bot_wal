import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { queryDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  console.log("[v0] Callback recebido com code:", code ? "sim" : "não")

  if (!code) {
    console.log("[v0] Sem código, redirecionando para home")
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
    console.log("[v0] Token recebido:", tokenData.access_token ? "sim" : "não")

    // Buscar dados do usuário
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const discordUser = await userResponse.json()
    console.log("[v0] Usuário Discord:", discordUser.username)

    // Criar ou atualizar usuário no banco
    const userId = randomUUID()
    await queryDb(
      `INSERT INTO users (id, discord_id, discord_username, discord_avatar, email) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       discord_username = VALUES(discord_username),
       discord_avatar = VALUES(discord_avatar),
       email = VALUES(email)`,
      [userId, discordUser.id, discordUser.username, discordUser.avatar, discordUser.email],
    )

    // Buscar ID do usuário
    const [user] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [discordUser.id])
    console.log("[v0] User ID salvo no banco:", user?.id)

    // Criar sessão
    const cookieStore = await cookies()
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    console.log("[v0] Sessão criada, redirecionando para dashboard")
    return Response.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("[v0] Erro na autenticação:", error)
    return Response.redirect(new URL("/?error=auth", request.url))
  }
}
