import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { queryDb } from "@/lib/db"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard")
  }

  // TESTE 1: Só tenta conectar e fazer uma query simples (sem WHERE)
  let testQuery = []
  try {
    testQuery = await queryDb("SELECT 1 as test")
    console.log("Query de teste ok:", testQuery)
  } catch (error) {
    console.error("Erro na queryDb:", error)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center space-y-8">
      <div>
        <h1 className="text-5xl font-bold">Dashboard carregado!</h1>
        <p className="text-2xl mt-8">Nome: {session.user.name}</p>
        <p className="text-xl">ID Discord: {session.user.id}</p>
        <p className="mt-8">Resultado da query de teste:</p>
        <pre className="bg-card p-4 rounded mt-4">
          {JSON.stringify(testQuery, null, 2)}
        </pre>
        <p className="mt-8 text-red-500">
          Se aparecer erro acima ou página branca, o problema é na conexão/queryDb.
        </p>
      </div>
    </div>
  )
}