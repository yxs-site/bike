import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bike, Loader2, ShoppingCart, User, Wrench } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: client, isLoading: clientLoading } = trpc.clients.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bike className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">AARON BIKE</CardTitle>
            <CardDescription className="text-base">
              Sistema de Gestão Integrada: E-commerce, Loja Física e Mobilidade Urbana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full"
              size="lg"
            >
              Entrar no Sistema
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário autenticado mas sem perfil de cliente
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Bem-vindo, {user?.name}!</CardTitle>
            <CardDescription>
              Complete seu cadastro para começar a usar o EcoBike System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setLocation("/register-client")}
              className="w-full"
              size="lg"
            >
              Completar Cadastro
            </Button>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="w-full"
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário autenticado com perfil completo
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">AARON BIKE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => setLocation("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Bem-vindo ao AARON BIKE
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie suas compras, aluguéis de bicicletas e manutenções em um só lugar
            </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>E-commerce</CardTitle>
              <CardDescription>
                Compre peças, acessórios e veículos online com entrega ou retirada na loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bike className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Aluguel de Veículos</CardTitle>
              <CardDescription>
                Alugue bicicletas e patinetes em Utinga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Manutenção</CardTitle>
              <CardDescription>
                Agende manutenções e acompanhe orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Módulo de Usuários Implementado ✅</CardTitle>
              <CardDescription>
                Funcionalidades disponíveis na versão atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">RF 1.1: Cadastro de Cliente com CPF, Telefone e Foto</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">RF 1.3: Login e Gestão de Perfil</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">RF 1.5: Gestão de Endereços (criar, listar, deletar)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
