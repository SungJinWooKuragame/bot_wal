import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string
      discord_username: string
      isAdmin: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface JWT {
    discordId?: string
  }
}
