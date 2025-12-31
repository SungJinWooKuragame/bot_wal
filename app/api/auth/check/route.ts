import { getSession } from "@/lib/auth"

export async function GET() {
  const user = await getSession()

  return Response.json({
    authenticated: !!user,
    user: user
      ? {
          id: user.id,
          username: user.discord_username,
          avatar: user.discord_avatar,
        }
      : null,
  })
}
