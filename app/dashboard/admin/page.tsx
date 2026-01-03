import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Plus, List } from "lucide-react"
import { redirect } from "next/navigation"
import { CreateLicenseForm } from "@/components/create-license-form"
import { LicenseManagementCard } from "@/components/license-management-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const revalidate = 0 // Sem cache - sempre fresh

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

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/admin")
  }

  if (!session.user.isAdmin) {
    redirect("/dashboard")
  }

  let totalLicenses = 0
  let activeLicenses = 0
  let licenses: License[] = []

  try {
    const [total] = await queryDb<{ count: number }>("SELECT COUNT(*) as count FROM licenses")
    const [active] = await queryDb<{ count: number }>("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'")
    totalLicenses = total?.count || 0
    activeLicenses = active?.count || 0

    // Buscar todas as licenças
    licenses = await queryDb<License>(
      `SELECT 
        l.*,
        u.discord_username,
        u.discord_id
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC`
    )
  } catch (error) {
    console.error("[v0] Error fetching data:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Admin Panel</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total de Licenças</p>
            <p className="text-3xl font-bold mt-2">{totalLicenses}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Licenças Ativas</p>
            <p className="text-3xl font-bold mt-2">{activeLicenses}</p>
          </Card>
        </div>

        <Tabs defaultValue="licenses" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="licenses">
              <List className="h-4 w-4 mr-2" />
              Gerenciar Licenças
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Licença
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licenses" className="space-y-4 mt-6">
            {licenses.length === 0 ? (
              <Card className="p-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Nenhuma licença criada</h3>
                <p className="text-muted-foreground mt-2">Crie sua primeira licença na aba "Criar Nova Licença"</p>
              </Card>
            ) : (
              licenses.map((license) => <LicenseManagementCard key={license.id} license={license} />)
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card className="p-6 space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Criar Nova Licença</h2>
              </div>
              <CreateLicenseForm />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
