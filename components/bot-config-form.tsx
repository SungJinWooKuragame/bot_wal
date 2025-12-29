"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

interface BotConfig {
  guild_id: string | null
  whitelist_role_id: string | null
  log_channel_id: string | null
  accept_channel_id: string | null
  reprove_channel_id: string | null
  embed_color: string
  welcome_message: string | null
}

export function BotConfigForm({ licenseId, config }: { licenseId: string; config?: BotConfig }) {
  const [formData, setFormData] = useState({
    guildId: config?.guild_id || "",
    whitelistRoleId: config?.whitelist_role_id || "",
    logChannelId: config?.log_channel_id || "",
    acceptChannelId: config?.accept_channel_id || "",
    reproveChannelId: config?.reprove_channel_id || "",
    embedColor: config?.embed_color || "#0099ff",
    welcomeMessage: config?.welcome_message || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/licenses/configure-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, ...formData }),
      })

      if (response.ok) {
        alert("Configurações salvas com sucesso!")
      } else {
        alert("Erro ao salvar configurações")
      }
    } catch (error) {
      console.error("[v0] Error saving config:", error)
      alert("Erro ao salvar configurações")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guild-id">ID do Servidor</Label>
          <Input
            id="guild-id"
            placeholder="123456789012345678"
            value={formData.guildId}
            onChange={(e) => setFormData({ ...formData, guildId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-id">ID do Cargo Whitelist</Label>
          <Input
            id="role-id"
            placeholder="123456789012345678"
            value={formData.whitelistRoleId}
            onChange={(e) => setFormData({ ...formData, whitelistRoleId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="log-channel">ID Canal de Logs</Label>
          <Input
            id="log-channel"
            placeholder="123456789012345678"
            value={formData.logChannelId}
            onChange={(e) => setFormData({ ...formData, logChannelId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accept-channel">ID Canal Aceitos</Label>
          <Input
            id="accept-channel"
            placeholder="123456789012345678"
            value={formData.acceptChannelId}
            onChange={(e) => setFormData({ ...formData, acceptChannelId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reprove-channel">ID Canal Reprovados</Label>
          <Input
            id="reprove-channel"
            placeholder="123456789012345678"
            value={formData.reproveChannelId}
            onChange={(e) => setFormData({ ...formData, reproveChannelId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="embed-color">Cor dos Embeds</Label>
          <div className="flex gap-2">
            <Input
              id="embed-color"
              type="color"
              value={formData.embedColor}
              onChange={(e) => setFormData({ ...formData, embedColor: e.target.value })}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.embedColor}
              onChange={(e) => setFormData({ ...formData, embedColor: e.target.value })}
              placeholder="#0099ff"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
        <Textarea
          id="welcome-message"
          placeholder="Bem-vindo ao servidor! {user}"
          value={formData.welcomeMessage}
          onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        <Save className="h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </form>
  )
}
