import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Server, Activity, Settings, Copy, FileText } from "lucide-react"
import Link from "next/link"

interface License {
  id: string
  license_key: string
  status: string
  plan_type: string
  vps_ip: string | null
  last_heartbeat: string | null
  expires_at: string | null
  created_at: string
}

const statusColors = {
  active: "bg-accent/10 text-accent border-accent/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground border-muted",
  revoked: "bg-destructive/10 text-destructive border-destructive/20",
}

export function LicenseCard({ license }: { license: License }) {
  const isOnline = license.last_heartbeat && new Date(license.last_heartbeat).getTime() > Date.now() - 5 * 60 * 1000

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[license.status as keyof typeof statusColors]}>
              {license.status.toUpperCase()}
            </Badge>
            <Badge variant="outline">{license.plan_type}</Badge>
            {isOnline && (
              <Badge className="bg-accent/10 text-accent border-accent/20">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-muted-foreground">Chave:</span>
              <span className="font-medium">{license.license_key}</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {license.vps_ip ? (
              <div className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">VPS:</span>
                <span className="font-medium">{license.vps_ip}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Server className="h-4 w-4" />
                <span>IP não configurado</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/licenses/${license.id}/logs`}>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Logs
            </Button>
          </Link>
          <Link href={`/dashboard/licenses/${license.id}`}>
            <Button size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
