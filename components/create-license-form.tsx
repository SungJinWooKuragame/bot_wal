"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CreateLicenseForm() {
  const [discordId, setDiscordId] = useState("")
  const [planType, setPlanType] = useState("lifetime")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ licenseKey?: string; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId, planType }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ licenseKey: data.licenseKey })
        setDiscordId("")
      } else {
        setResult({ error: data.error || "Erro ao criar licença" })
      }
    } catch (error) {
      console.error("[v0] Error creating license:", error)
      setResult({ error: "Erro ao criar licença" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discord-id">Discord ID do Comprador</Label>
          <Input
            id="discord-id"
            type="text"
            placeholder="123456789012345678"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-type">Tipo de Plano</Label>
          <Select value={planType} onValueChange={setPlanType}>
            <SelectTrigger id="plan-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lifetime">Lifetime</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          <Plus className="h-4 w-4" />
          {loading ? "Criando..." : "Criar Licença"}
        </Button>
      </form>

      {result && (
        <div className={`p-4 rounded-lg ${result.error ? "bg-destructive/10" : "bg-accent/10"}`}>
          {result.licenseKey ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-accent">Licença criada com sucesso!</p>
              <code className="block font-mono text-sm bg-background p-2 rounded">{result.licenseKey}</code>
            </div>
          ) : (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
