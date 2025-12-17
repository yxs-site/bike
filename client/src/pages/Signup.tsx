import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { isValidCPF, isValidPhone, formatCPF, formatPhone, isValidEmail } from "@shared/validators";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = trpc.clients.signup.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      setLocation("/login");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer cadastro");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Email inválido");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error("Telefone inválido");
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return;
    }

    setIsLoading(true);
    signupMutation.mutate(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      {
        onSettled: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bike className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">AARON BIKE</CardTitle>
          <CardDescription className="text-base">
            Crie sua conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  const formatted = formatPhone(cleaned);
                  setFormData((prev) => ({ ...prev, phone: formatted }));
                }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  const formatted = formatCPF(cleaned);
                  setFormData((prev) => ({ ...prev, cpf: formatted }));
                }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-primary hover:underline font-medium"
              >
                Faça login
              </button>
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setLocation("/")}
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
