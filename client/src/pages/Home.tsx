import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bike, ShoppingCart, MapPin, Wrench, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();

  const { data: client, isLoading: clientLoading } = trpc.clients.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Não autenticado - Mostrar tela de boas-vindas
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
            <Button
              onClick={() => setLocation("/register-client")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Criar Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Autenticado mas sem perfil de cliente
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bike className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Bem-vindo, {user?.name}!</CardTitle>
            <CardDescription className="text-base">
              Complete seu cadastro para começar a usar o AARON BIKE
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
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Autenticado com perfil de cliente - Dashboard
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
              Meu Perfil
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
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
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle>Loja Online</CardTitle>
              <CardDescription>
                Compre peças e acessórios para suas bicicletas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/products'}>
                Ver Produtos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle>Aluguel de Veículos</CardTitle>
              <CardDescription>
                Alugue bicicletas e patinetes em Utinga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em Desenvolvimento
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription>
                Gerenciar produtos e pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/admin'}>
                Acessar Admin
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle>Agendamento de Manutenção</CardTitle>
              <CardDescription>
                Agende manutenções para suas bicicletas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em Desenvolvimento
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 pt-8 border-t">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Sobre AARON BIKE</h2>
            <p className="text-muted-foreground">
              Sistema integrado de gestão para bicicletas, oferecendo soluções completas
              em e-commerce, loja física e mobilidade urbana em Utinga.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
