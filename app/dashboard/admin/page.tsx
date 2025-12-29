import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Plus } from "lucide-react"
import { redirect } from "next/navigation"
import { CreateLicenseForm } from "@/components/create-license-form"

// Esta página é só para admin criar licenças
export default async function AdminPage() {
  let user
  try {
    user = await requireAuth()
  } catch {
    redirect("/auth/discord")
  }

  // Verificar se é admin (você deve adicionar uma coluna is_admin na tabela users)
  const [adminCheck] = await queryDb<{ is_admin: boolean }>("SELECT is_admin FROM users WHERE id = ?", [user.id])

  if (!adminCheck?.is_admin) {
    redirect("/dashboard")
  }

  const totalLicenses = await queryDb<{ count: number }>("SELECT COUNT(*) as count FROM licenses")
  const activeLicenses = await queryDb<{ count: number }>(
    "SELECT COUNT(*) as count FROM licenses WHERE status = 'active'",
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
