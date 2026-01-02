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
      console.log("[v0] signIn callback triggered", { user, accountId: account?.providerAccountId })

      if (!account || !profile) {
        console.error("[v0] Missing account or profile in signIn")
        return false
      }

      try {
        // Verificar se usuário já existe
        const existingUsers = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [
          account.providerAccountId,
        ])

        console.log("[v0] Existing user check:", existingUsers)

        if (!existingUsers || existingUsers.length === 0) {
          // Criar novo usuário
          console.log("[v0] Creating new user")
          await queryDb("INSERT INTO users (discord_id, discord_username, email, avatar_url) VALUES (?, ?, ?, ?)", [
            account.providerAccountId,
            (profile as any).username || user.name,
            user.email,
            user.image,
          ])
          console.log("[v0] User created successfully")
        } else {
          // Atualizar dados do usuário
          console.log("[v0] Updating existing user")
          await queryDb(
            "UPDATE users SET discord_username = ?, email = ?, avatar_url = ?, updated_at = NOW() WHERE discord_id = ?",
            [(profile as any).username || user.name, user.email, user.image, account.providerAccountId],
          )
          console.log("[v0] User updated successfully")
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
        console.log("[v0] JWT token set with discordId:", token.discordId)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.discordId) {
        try {
          // Buscar dados do usuário no banco
          const users = await queryDb<{ id: string; discord_username: string; is_admin: number }>(
            "SELECT id, discord_username, is_admin FROM users WHERE discord_id = ?",
            [token.discordId as string],
          )

          if (users && users.length > 0) {
            const user = users[0]
            session.user.id = user.id
            session.user.discordId = token.discordId as string
            session.user.discord_username = user.discord_username
            session.user.isAdmin = user.is_admin === 1
            console.log("[v0] Session loaded:", {
              discordId: token.discordId,
              isAdmin: session.user.isAdmin,
              userId: user.id,
            })
          } else {
            console.warn("[v0] User not found in database for session")
          }
        } catch (error) {
          console.error("[v0] Error loading session:", error)
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
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
