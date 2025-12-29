import { cookies } from "next/headers"
import { queryDb } from "./db"

export interface User {
  id: string
  discord_id: string
  discord_username: string
  discord_avatar: string | null
  email: string | null
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")

  if (!sessionToken) {
    return null
  }

  try {
    const [user] = await queryDb<User>("SELECT * FROM users WHERE id = ?", [sessionToken.value])
    return user || null
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
