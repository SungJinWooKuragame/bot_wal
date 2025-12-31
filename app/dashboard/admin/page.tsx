import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"  // Caminho pro seu authOptions
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Plus } from "lucide-react"
import { CreateLicenseForm } from "@/components/create-license-form"
import { queryDb } from "@/lib/db"  // Mantém sua função de query (assumindo que funciona com MySQL)

// Esta página é só para admin criar licenças
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/admin")  // Redireciona pro login oficial
  }

  // Busca o usuário no banco pra checar se é admin (baseado no email ou id do Discord)
  // Ajuste conforme sua tabela users (ex: coluna discord_id ou email)
  const [userRecord] = await queryDb<{ is_admin: boolean }>(
    "SELECT is_admin FROM users WHERE discord_id = ? OR email = ?",
    [session.user.id, session.user.email]
  )

  if (!userRecord?.is_admin) {
    redirect("/dashboard")  // Ou pra home se preferir
  }

  // Queries pras stats
  const totalLicenses = await queryDb<{ count: number }>("SELECT COUNT(*) as count FROM licenses")
  const activeLicenses = await queryDb<{ count: number }>(
    "SELECT COUNT(*) as count FROM licenses WHERE status = 'active'"
  )

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

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total de Licenças</p>
            <p className="text-3xl font-bold mt-2">{totalLicenses[0]?.count || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Licenças Ativas</p>
            <p className="text-3xl font-bold mt-2">{activeLicenses[0]?.count || 0}</p>
          </Card>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Criar Nova Licença</h2>
          </div>
          <CreateLicenseForm />
        </Card>
      </div>
    </div>
  )
}