import { requireAuth } from "@/lib/auth"
import { queryDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Server, ArrowLeft, Copy, RefreshCw, FileText } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ConfigureVPSForm } from "@/components/configure-vps-form"
import { BotConfigForm } from "@/components/bot-config-form"
import { LicenseQuestionsForm } from "@/components/license-questions-form"

interface License {
  id: string
  license_key: string
  status: string
  plan_type: string
  vps_ip: string | null
  vps_hostname: string | null
  last_heartbeat: string | null
  bot_version: string | null
  expires_at: string | null
  activated_at: string | null
  created_at: string
}

interface BotConfig {
  guild_id: string | null
  whitelist_role_id: string | null
  log_channel_id: string | null
  accept_channel_id: string | null
  reprove_channel_id: string | null
  embed_color: string
  welcome_message: string | null
}

export default async function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let user

  try {
    user = await requireAuth()
  } catch {
    redirect("/auth/discord")
  }

  const [license] = await queryDb<License>("SELECT * FROM licenses WHERE id = ? AND user_id = ?", [id, user.id])

  if (!license) {
    notFound()
  }

  const [botConfig] = await queryDb<BotConfig>("SELECT * FROM bot_configs WHERE license_id = ?", [id])

  const isOnline = license.last_heartbeat && new Date(license.last_heartbeat).getTime() > Date.now() - 5 * 60 * 1000

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Detalhes da Licença</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline && (
              <Badge className="bg-accent/10 text-accent border-accent/20">
                <div className="h-2 w-2 rounded-full bg-accent mr-2 animate-pulse" />
                Online
              </Badge>
            )}
            <Link href={`/dashboard/licenses/${id}/logs`}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Ver Logs
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* License Info */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Informações da Licença</h2>
              <Badge
                className={
                  license.status === "active"
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {license.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Chave da Licença</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-muted p-2 rounded">{license.license_key}</code>
                  <Button size="sm" variant="outline" className="shrink-0 bg-transparent">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tipo de Plano</p>
                <p className="font-medium capitalize">{license.plan_type}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status do Bot</p>
                <p className="font-medium">{isOnline ? "Online" : "Offline"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Versão do Bot</p>
                <p className="font-medium">{license.bot_version || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Última Atividade</p>
                <p className="font-medium">
                  {license.last_heartbeat
                    ? new Date(license.last_heartbeat).toLocaleString("pt-BR")
                    : "Nunca conectado"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Criada em</p>
                <p className="font-medium">{new Date(license.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* VPS Configuration */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Configuração da VPS</h2>
          </div>

          {license.vps_ip ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-sm text-muted-foreground">IP Vinculado</p>
                <p className="font-mono text-lg font-bold">{license.vps_ip}</p>
                {license.vps_hostname && (
                  <p className="text-sm text-muted-foreground">Hostname: {license.vps_hostname}</p>
                )}
              </div>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Alterar IP da VPS
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Configure o IP da VPS onde o bot irá operar.</p>
              <ConfigureVPSForm licenseId={license.id} />
            </div>
          )}
        </Card>

        {/* Bot Configuration */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold">Configuração do Bot</h2>
          <BotConfigForm licenseId={license.id} config={botConfig} />
        </Card>

        {/* Whitelist Questions */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold">Questões de Whitelist</h2>
          <p className="text-muted-foreground">
            Customize as perguntas que os usuários precisam responder para entrar no servidor.
          </p>
          <LicenseQuestionsForm licenseId={license.id} />
        </Card>

        {/* Download Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Download do Bot</h2>
          <p className="text-muted-foreground">
            Baixe o bot e execute na VPS configurada. O bot será automaticamente vinculado a esta licença.
          </p>
          <Button className="w-full gap-2" size="lg" disabled={!license.vps_ip}>
            <Server className="h-5 w-5" />
            Baixar Bot para VPS
          </Button>
          {!license.vps_ip && (
            <p className="text-sm text-destructive">Configure o IP da VPS antes de fazer o download</p>
          )}
        </Card>
      </div>
    </div>
  )
}
