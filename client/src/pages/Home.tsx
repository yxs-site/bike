import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bike, ShoppingCart, Users, LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AARON BIKE</h1>
          </div>
          <nav className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Cadastro
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground">
            Bem-vindo à AARON BIKE
          </h2>
          <p className="text-xl text-muted-foreground">
            Sua plataforma completa para comprar, alugar e manter suas bicicletas e patinetes
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              className="gap-2"
            >
              <LogIn className="h-5 w-5" />
              Entrar na Conta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/signup")}
              className="gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Criar Conta
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Nossas Funcionalidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Shop */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Loja Online</h4>
            <p className="text-muted-foreground">
              Compre bicicletas, peças e acessórios de qualidade com entrega rápida
            </p>
          </Card>

          {/* Feature 2: Rental */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Aluguel de Bicicletas</h4>
            <p className="text-muted-foreground">
              Alugue bicicletas e patinetes por hora ou dia em Utinga
            </p>
          </Card>

          {/* Feature 3: Maintenance */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Manutenção</h4>
            <p className="text-muted-foreground">
              Agende manutenção com nossos especialistas
            </p>
          </Card>
        </div>
      </section>

      {/* Admin Section */}
      <section className="container py-16 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-bold">Acesso Administrativo</h3>
          <p className="text-muted-foreground">
            Se você é um administrador, acesse o painel de controle
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation("/admin")}
          >
            Painel Admin
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 AARON BIKE. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
