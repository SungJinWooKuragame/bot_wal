"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"

interface AuditLog {
  id: string
  user_id: string
  license_id: string | null
  action: string
  details: string
  ip_address: string | null
  created_at: string
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>("")
  const [offset, setOffset] = useState(0)

  if (status === "loading") return null
  if (!session?.user?.isAdmin) redirect("/dashboard")

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams()
        if (filterAction) query.append("action", filterAction)
        query.append("offset", offset.toString())
        query.append("limit", "50")

        const res = await fetch(`/api/admin/audit-logs?${query}`)
        const data = await res.json()

        if (data.success) {
          setLogs(data.logs)
        }
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [filterAction, offset])

  const exportCSV = () => {
    const headers = ["ID", "Usuário", "Licença", "Ação", "Detalhes", "IP", "Data"]
    const rows = logs.map((log) => [
      log.id,
      log.user_id,
      log.license_id || "-",
      log.action,
      log.details,
      log.ip_address || "-",
      new Date(log.created_at).toLocaleString("pt-BR"),
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
        <p className="text-gray-500">Acompanhe todas as ações do sistema</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Filtrar por Ação</label>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as ações</SelectItem>
              <SelectItem value="license_created">Licença Criada</SelectItem>
              <SelectItem value="license_suspended">Licença Suspensa</SelectItem>
              <SelectItem value="license_activated">Licença Ativada</SelectItem>
              <SelectItem value="license_expired">Licença Expirada</SelectItem>
              <SelectItem value="license_deleted">Licença Deletada</SelectItem>
              <SelectItem value="bot_validated">Bot Validado</SelectItem>
              <SelectItem value="bot_heartbeat">Bot Heartbeat</SelectItem>
              <SelectItem value="whitelist_submitted">Whitelist Enviado</SelectItem>
              <SelectItem value="config_updated">Config Atualizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Licença</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.user_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">
                      {log.license_id ? log.license_id.slice(0, 8) : "-"}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="text-sm">{log.ip_address || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => setOffset(Math.max(0, offset - 50))}
          disabled={offset === 0}
          variant="outline"
        >
          Anterior
        </Button>
        <Button onClick={() => setOffset(offset + 50)}>Próxima</Button>
      </div>
    </div>
  )
}
