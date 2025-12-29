"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Server, AlertCircle } from "lucide-react"

export function ConfigureVPSForm({ licenseId }: { licenseId: string }) {
  const [vpsIp, setVpsIp] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [ipStatus, setIpStatus] = useState<{ available: boolean; message: string } | null>(null)

  const checkIpAvailability = async () => {
    if (!vpsIp) return

    setChecking(true)
    setIpStatus(null)

    try {
      const response = await fetch("/api/licenses/check-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vpsIp }),
      })

      const data = await response.json()
      setIpStatus(data)
    } catch (error) {
      console.error("[v0] Error checking IP:", error)
      setIpStatus({ available: false, message: "Erro ao verificar IP" })
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/licenses/configure-vps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, vpsIp }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao configurar VPS")
      }
    } catch (error) {
      console.error("[v0] Error configuring VPS:", error)
      alert("Erro ao configurar VPS")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vps-ip">IP da VPS</Label>
        <div className="flex gap-2">
          <Input
            id="vps-ip"
            type="text"
            placeholder="123.456.789.012"
            value={vpsIp}
            onChange={(e) => {
              setVpsIp(e.target.value)
              setIpStatus(null)
            }}
            required
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={checkIpAvailability} disabled={checking || !vpsIp}>
            {checking ? "Verificando..." : "Verificar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Digite o IP público da VPS onde o bot será executado</p>

        {ipStatus && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              ipStatus.available ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{ipStatus.message}</span>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading || !ipStatus?.available || checking}>
        <Server className="h-4 w-4" />
        {loading ? "Configurando..." : "Vincular VPS"}
      </Button>
    </form>
  )
}
