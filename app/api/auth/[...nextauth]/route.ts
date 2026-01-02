import NextAuth, { type NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { queryDb } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) {
        return false
      }

      try {
        const existingUsers = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [
          account.providerAccountId,
        ])

        if (!existingUsers || existingUsers.length === 0) {
          await queryDb("INSERT INTO users (discord_id, discord_username, email, avatar_url) VALUES (?, ?, ?, ?)", [
            account.providerAccountId,
            (profile as any).username || user.name,
            user.email,
            user.image,
          ])
        } else {
          await queryDb(
            "UPDATE users SET discord_username = ?, email = ?, avatar_url = ?, updated_at = NOW() WHERE discord_id = ?",
            [(profile as any).username || user.name, user.email, user.image, account.providerAccountId],
          )
        }

        return true
      } catch (error) {
        console.error("[v0] Error in signIn callback:", error)
        return true
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = account.providerAccountId
      }

      // SEMPRE revalidar isAdmin do banco - nunca cachear
      if (token.discordId) {
        try {
          const users = await queryDb<{ is_admin: number }>("SELECT is_admin FROM users WHERE discord_id = ?", [
            token.discordId as string,
          ])

          if (users && users.length > 0) {
            token.isAdmin = users[0].is_admin === 1
          } else {
            token.isAdmin = false
          }
        } catch (error) {
          console.error("[v0] Error loading isAdmin in JWT:", error)
          token.isAdmin = false
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.discordId) {
        try {
          const users = await queryDb<{ id: string; discord_username: string; is_admin: number }>(
            "SELECT id, discord_username, is_admin FROM users WHERE discord_id = ?",
            [token.discordId as string],
          )

          if (users && users.length > 0) {
            const user = users[0]
            session.user.id = user.id
            session.user.discordId = token.discordId as string
            session.user.discord_username = user.discord_username
            session.user.isAdmin = (token.isAdmin as boolean) || user.is_admin === 1
          } else {
            session.user.isAdmin = false
          }
        } catch (error) {
          console.error("[v0] Error loading session:", error)
          session.user.isAdmin = false
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
