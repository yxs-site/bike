import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { isValidCPF, isValidPhone, formatCPF, formatPhone } from "@shared/validators";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function RegisterClient() {
  const [, setLocation] = useLocation();
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Perfil de cliente criado com sucesso!");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto muito grande. Máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      // Remover o prefixo "data:image/...;base64,"
      const base64Data = base64.split(',')[1];
      setPhotoBase64(base64Data || null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpf || !phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!isValidCPF(cpf)) {
      toast.error("CPF inválido");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Telefone inválido");
      return;
    }

    createClient.mutate({
      cpf,
      phone,
      photoBase64: photoBase64 || undefined,
    });
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro de Cliente</CardTitle>
          <CardDescription>
            Complete seu perfil para acessar todos os recursos do AARON BIKE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Foto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/20">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Label
                  htmlFor="photo"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition"
                >
                  <Camera className="w-4 h-4" />
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Foto obrigatória para segurança (máx. 5MB)
              </p>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setCpf(formatCPF(cleaned));
                }}
                maxLength={14}
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="text"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setPhone(formatPhone(cleaned));
                }}
                maxLength={15}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createClient.isPending}
            >
              {createClient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando perfil...
                </>
              ) : (
                "Criar Perfil de Cliente"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/")}
            >
              Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
