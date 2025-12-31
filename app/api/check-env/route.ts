export async function GET() {
  const envVars = {
    DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI: !!process.env.DISCORD_REDIRECT_URI,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    BOT_API_SECRET: !!process.env.BOT_API_SECRET,
  }

  return Response.json({
    message: "Environment Variables Status",
    variables: envVars,
    allConfigured: Object.values(envVars).every((v) => v === true),
  })
}
