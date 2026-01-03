"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Ban, CheckCircle, Clock, Trash2, Play } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface License {
  id: string
  license_key: string
  user_id: string
  status: string
  plan_type: string
  vps_ip: string | null
  last_heartbeat: string | null
  expires_at: string | null
  created_at: string
  discord_username: string
  discord_id: string
}

export function LicenseManagementCard({ license }: { license: License }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/licenses/${license.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.message || "Erro ao executar ação")
      }
    } catch (error) {
      alert("Erro ao executar ação")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; text: string }> = {
      active: { variant: "default", text: "Ativa" },
      suspended: { variant: "destructive", text: "Suspensa" },
      expired: { variant: "secondary", text: "Expirada" },
      revoked: { variant: "outline", text: "Revogada" },
    }
    const config = variants[status] || variants.active
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const names: Record<string, string> = {
      lifetime: "Vitalício",
      monthly: "Mensal",
      yearly: "Anual",
    }
    return <Badge variant="outline">{names[plan] || plan}</Badge>
  }

  const getLastHeartbeat = () => {
    if (!license.last_heartbeat) return "Nunca"
    const date = new Date(license.last_heartbeat)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`
    return `${Math.floor(diffMins / 1440)}d atrás`
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold">{license.license_key}</h3>
            {getStatusBadge(license.status)}
            {getPlanBadge(license.plan_type)}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Cliente:</strong> {license.discord_username} ({license.discord_id})
            </p>
            <p>
              <strong>VPS IP:</strong> {license.vps_ip || "Não configurado"}
            </p>
            <p>
              <strong>Último heartbeat:</strong> {getLastHeartbeat()}
            </p>
            <p>
              <strong>Criada:</strong> {new Date(license.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {license.status === "active" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={loading}>
                <Ban className="h-4 w-4 mr-2" />
                Suspender
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suspender licença?</AlertDialogTitle>
                <AlertDialogDescription>
                  O cliente não conseguirá usar o bot até reativar a licença.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleAction("suspend")}>Suspender</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {license.status === "suspended" && (
          <Button variant="default" size="sm" onClick={() => handleAction("activate")} disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            Ativar
          </Button>
        )}

        {license.status === "active" && (
          <Button variant="secondary" size="sm" onClick={() => handleAction("expire")} disabled={loading}>
            <Clock className="h-4 w-4 mr-2" />
            Expirar
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar licença permanentemente?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita!</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAction("delete")} className="bg-destructive">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}
