export async function GET() {
  console.log("[v0] Discord Client ID:", process.env.DISCORD_CLIENT_ID)
  console.log("[v0] Discord Redirect URI:", process.env.DISCORD_REDIRECT_URI)

  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return Response.json(
      {
        error: "Environment variables not configured",
        clientId: clientId ? "set" : "missing",
        redirectUri: redirectUri ? "set" : "missing",
      },
      { status: 500 },
    )
  }

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`

  return Response.redirect(discordAuthUrl)
}
