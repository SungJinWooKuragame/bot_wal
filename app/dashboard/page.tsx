import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center space-y-8">
      <div>
        <h1 className="text-5xl font-bold">Bem-vindo ao Dashboard! 🎉</h1>
        <p className="text-2xl mt-8">Login com Discord funcionando perfeitamente!</p>
        <p className="text-xl mt-4">Seu nome: <strong>{session.user.name}</strong></p>
        <p className="text-xl">Seu email: <strong>{session.user.email || "Não fornecido"}</strong></p>
        <p className="text-xl text-muted-foreground mt-8">ID do Discord (use como user_id no banco): <code>{session.user.id}</code></p>
        <p className="mt-12 text-lg">Agora vamos adicionar as licenças e stats sem crash.</p>
      </div>
    </div>
  )
}