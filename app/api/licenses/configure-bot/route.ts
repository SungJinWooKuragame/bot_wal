import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const {
      licenseId,
      guildId,
      whitelistRoleId,
      logChannelId,
      acceptChannelId,
      reproveChannelId,
      embedColor,
      welcomeMessage,
    } = await request.json()

    // Verificar se a licença pertence ao usuário
    const [license] = await queryDb<{ id: string }>("SELECT id FROM licenses WHERE id = ? AND user_id = ?", [
      licenseId,
      user.id,
    ])

    if (!license) {
      return Response.json({ error: "Licença não encontrada" }, { status: 404 })
    }

    // Inserir ou atualizar configuração
    await queryDb(
      `INSERT INTO bot_configs 
       (id, license_id, guild_id, whitelist_role_id, log_channel_id, accept_channel_id, reprove_channel_id, embed_color, welcome_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       guild_id = VALUES(guild_id),
       whitelist_role_id = VALUES(whitelist_role_id),
       log_channel_id = VALUES(log_channel_id),
       accept_channel_id = VALUES(accept_channel_id),
       reprove_channel_id = VALUES(reprove_channel_id),
       embed_color = VALUES(embed_color),
       welcome_message = VALUES(welcome_message)`,
      [
        randomUUID(),
        licenseId,
        guildId ?? null,
        whitelistRoleId ?? null,
        logChannelId ?? null,
        acceptChannelId ?? null,
        reproveChannelId ?? null,
        embedColor ?? "#0099ff",
        welcomeMessage ?? null,
      ],
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving bot config:", error)
    return Response.json({ error: "Erro ao salvar configuração" }, { status: 500 })
  }
}
