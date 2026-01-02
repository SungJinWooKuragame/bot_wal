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
      if (!account || !profile) return false

      try {
        // Verificar se usuário já existe
        const [existingUser] = await queryDb<{ id: string }>("SELECT id FROM users WHERE discord_id = ?", [
          account.providerAccountId,
        ])

        if (!existingUser) {
          // Criar novo usuário
          await queryDb("INSERT INTO users (discord_id, discord_username, email, avatar_url) VALUES (?, ?, ?, ?)", [
            account.providerAccountId,
            (profile as any).username || user.name,
            user.email,
            user.image,
          ])
        } else {
          // Atualizar dados do usuário
          await queryDb(
            "UPDATE users SET discord_username = ?, email = ?, avatar_url = ?, last_login = NOW() WHERE discord_id = ?",
            [(profile as any).username || user.name, user.email, user.image, account.providerAccountId],
          )
        }

        return true
      } catch (error) {
        console.error("[v0] Error in signIn callback:", error)
        return false
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Buscar ID do banco de dados
        const [user] = await queryDb<{ id: string; discord_username: string; is_admin: boolean }>(
          "SELECT id, discord_username, is_admin FROM users WHERE discord_id = ?",
          [token.discordId as string],
        )

        if (user) {
          session.user.id = user.id
          session.user.discordId = token.discordId as string
          session.user.discord_username = user.discord_username
          session.user.isAdmin = user.is_admin
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
