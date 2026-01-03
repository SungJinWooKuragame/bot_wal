"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/licenses/configure-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, ...formData }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Configurações salvas com sucesso!" })
        router.refresh()
      } else {
        setMessage({ type: "error", text: data.message || "Erro ao salvar configurações" })
      }
    } catch (error) {
      console.error("[Bot Config] Error saving config:", error)
      setMessage({ type: "error", text: "Erro de conexão ao salvar configurações" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-accent/10 text-accent border border-accent/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">Como obter os IDs do Discord:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Ative o Modo Desenvolvedor em Configurações → Avançado</li>
            <li>Clique com botão direito no servidor/canal/cargo</li>
            <li>Selecione "Copiar ID"</li>
          </ol>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guild-id">
            ID do Servidor <span className="text-destructive">*</span>
          </Label>
          <Input
            id="guild-id"
            placeholder="123456789012345678"
            value={formData.guildId}
            onChange={(e) => setFormData({ ...formData, guildId: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-id">
            ID do Cargo Whitelist <span className="text-destructive">*</span>
          </Label>
          <Input
            id="role-id"
            placeholder="123456789012345678"
            value={formData.whitelistRoleId}
            onChange={(e) => setFormData({ ...formData, whitelistRoleId: e.target.value })}
            required
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
          placeholder="Bem-vindo ao servidor! Use {user} para mencionar o usuário."
          value={formData.welcomeMessage}
          onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Variáveis disponíveis: {"{user}"}, {"{server}"}</p>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        <Save className="h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </form>
  )
}
