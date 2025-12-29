import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Activity } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ValidationLog {
  id: string
  ip_address: string
  success: boolean
  error_message: string | null
  created_at: string
}

export default async function LicenseLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let user

  try {
    user = await requireAuth()
  } catch {
    redirect("/auth/discord")
  }

  // Verificar se a licença pertence ao usuário
  const [license] = await queryDb<{ id: string; license_key: string }>(
    "SELECT id, license_key FROM licenses WHERE id = ? AND user_id = ?",
    [id, user.id],
  )

  if (!license) {
    notFound()
  }

  // Buscar logs de validação (últimos 100)
  const logs = await queryDb<ValidationLog>(
    "SELECT * FROM validation_logs WHERE license_id = ? ORDER BY created_at DESC LIMIT 100",
    [id],
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/licenses/${id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Logs de Validação</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Histórico de Validações</h2>
            <Badge variant="outline">{logs.length} registros</Badge>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma validação registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.success ? "bg-accent/5 border-accent/20" : "bg-destructive/5 border-destructive/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {log.success ? (
                        <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-medium">{log.ip_address}</span>
                          <Badge
                            variant={log.success ? "default" : "destructive"}
                            className={log.success ? "bg-accent/10 text-accent border-accent/20" : ""}
                          >
                            {log.success ? "Sucesso" : "Falha"}
                          </Badge>
                        </div>
                        {log.error_message && (
                          <p className="text-sm text-destructive break-words">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
