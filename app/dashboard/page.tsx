import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ShieldCheck, Server, Activity, AlertCircle, Plus } from "lucide-react"
import { LicenseCard } from "@/components/license-card"
import { queryDb } from "@/lib/db"

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
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard")
  }

  let licenses: License[] = []
  let activeLicenses = 0
  let totalLicenses = 0

  try {
    licenses = await queryDb<License>(
      "SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
      [session.user.id]
    )

    activeLicenses = licenses.filter((l) => l.status === "active").length
    totalLicenses = licenses.length
  } catch (error) {
    console.error("Erro ao buscar licenças (não crasha mais):", error)
    // Fallback seguro – mostra dashboard vazio sem crashar o server
    licenses = []
    activeLicenses = 0
    totalLicenses = 0
  }

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
            <span className="text-sm text-muted-foreground">
              {session.user.name || "Usuário"}
            </span>
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
            <Button asChild className="gap-2">
              <a href="/dashboard/admin">
                <Plus className="h-4 w-4" />
                Nova Licença
              </a>
            </Button>
          </div>

          {licenses.length === 0 ? (
            <Card className="p-12 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhuma licença encontrada</h3>
              <p className="text-muted-foreground">Compre sua licença para aparecer aqui!</p>
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