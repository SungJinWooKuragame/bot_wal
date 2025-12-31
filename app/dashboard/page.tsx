import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Server, Activity, AlertCircle } from "lucide-react"
import { LicenseCard } from "@/components/license-card"
import { redirect } from "next/navigation"

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

export default async function DashboardPage() {
  let user
  try {
    user = await requireAuth()
  } catch {
    redirect("/api/auth/discord")
  }

  const licenses = await queryDb<License>("SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC", [
    user.id,
  ])

  const activeLicenses = licenses.filter((l) => l.status === "active").length
  const totalLicenses = licenses.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.discord_username}</span>
            <Button variant="outline" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Licenças Ativas</span>
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <p className="text-3xl font-bold">{activeLicenses}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Licenças</span>
              <Server className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{totalLicenses}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <AlertCircle className="h-4 w-4 text-chart-3" />
            </div>
            <p className="text-3xl font-bold">Operacional</p>
          </Card>
        </div>

        {/* Licenses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Minhas Licenças</h2>
            <Button>Nova Licença</Button>
          </div>

          {licenses.length === 0 ? (
            <Card className="p-12 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhuma licença encontrada</h3>
              <p className="text-muted-foreground">Entre em contato para adquirir sua primeira licença</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {licenses.map((license) => (
                <LicenseCard key={license.id} license={license} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
