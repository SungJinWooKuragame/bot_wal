"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Check } from "lucide-react"

export function CreateLicenseForm() {
  const [discordId, setDiscordId] = useState("")
  const [planType, setPlanType] = useState("lifetime")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ licenseKey?: string; error?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    console.log("[v0] Submitting license creation:", { discordId, planType })

    try {
      const response = await fetch("/api/admin/create-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId, planType }),
      })

      const data = await response.json()
      console.log("[v0] Response:", data)

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

  const copyLicenseKey = () => {
    if (result?.licenseKey) {
      navigator.clipboard.writeText(result.licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
            placeholder="662055385187745821"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Cole o ID do Discord do cliente que comprou o bot</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-type">Tipo de Plano</Label>
          <Select value={planType} onValueChange={setPlanType}>
            <SelectTrigger id="plan-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lifetime">Lifetime (Vitalício)</SelectItem>
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
        <div
          className={`p-4 rounded-lg border ${result.error ? "bg-destructive/10 border-destructive" : "bg-accent/10 border-accent"}`}
        >
          {result.licenseKey ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-accent">Licença criada com sucesso!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-background p-3 rounded border">{result.licenseKey}</code>
                <Button size="sm" variant="outline" onClick={copyLicenseKey} className="gap-2 bg-transparent">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Envie esta chave para o cliente. Ele irá ativá-la no dashboard.
              </p>
            </div>
          ) : (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
