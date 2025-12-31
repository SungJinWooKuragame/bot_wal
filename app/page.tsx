"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Zap, Lock, Server } from "lucide-react"
import { signIn } from "next-auth/react";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.authenticated)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleLoginClick = () => {
    if (isLoggedIn) {
      window.location.href = "/dashboard";
    } else {
      signIn("discord", { callbackUrl: "/dashboard" });  // Inicia login oficial e vai direto pro dashboard após autorizar
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">FiveM WL Bot</span>
          </div>
          <Button onClick={handleLoginClick} disabled={isLoading}>
            {isLoading ? "Carregando..." : isLoggedIn ? "Ir para Dashboard" : "Acessar Dashboard"}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Sistema de Whitelist Profissional para FiveM
          </h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Gerencie a whitelist da sua cidade FiveM com segurança, controle total e sistema de licenças moderno.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2" onClick={handleLoginClick} disabled={isLoading}>
              <ShieldCheck className="h-5 w-5" />
              {isLoading ? "Carregando..." : isLoggedIn ? "Acessar Dashboard" : "Começar Agora"}
            </Button>
            <Button size="lg" variant="outline" onClick={handleLoginClick} disabled={isLoading}>
              {isLoggedIn ? "Meu Painel" : "Ver Planos"}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Sistema de Licenças</h3>
            <p className="text-muted-foreground">
              Cada licença é vinculada ao IP da VPS, garantindo segurança e evitando uso não autorizado.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Server className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Dashboard Web</h3>
            <p className="text-muted-foreground">
              Gerencie suas licenças, configure o bot e monitore tudo através de um painel moderno e intuitivo.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="text-xl font-bold">Bot Modernizado</h3>
            <p className="text-muted-foreground">
              Código atualizado, otimizado e com todas as funcionalidades de whitelist que você precisa.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 FiveM WL Bot. Sistema de licenciamento seguro.</p>
        </div>
      </footer>
    </div>
  )
}
