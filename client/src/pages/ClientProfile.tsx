import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { isValidCEP, formatCEP } from "@shared/validators";
import { toast } from "sonner";

export default function ClientProfile() {
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();

  // Queries
  const { data: client, isLoading: clientLoading } = trpc.clients.getMyProfile.useQuery();
  const { data: addresses = [], isLoading: addressesLoading } = trpc.addresses.list.useQuery();

  // Mutations
  const createAddress = trpc.addresses.create.useMutation({
    onSuccess: () => {
      toast.success("Endereço adicionado!");
      utils.addresses.list.invalidate();
      setShowAddressDialog(false);
      resetAddressForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteAddress = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast.success("Endereço removido!");
      utils.addresses.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Address form state
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    isDefault: false,
  });

  const resetAddressForm = () => {
    setAddressForm({
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
      isDefault: false,
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidCEP(addressForm.cep)) {
      toast.error("CEP inválido");
      return;
    }

    // Adicionar outras validações de campos obrigatórios aqui se necessário

    createAddress.mutate(addressForm);
  };



  if (clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

    if (!client) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Perfil não encontrado</CardTitle>
              <CardDescription>
                Você ainda não completou seu cadastro como cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/register-client"} className="w-full">
                Completar Cadastro
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">AARON BIKE</h1>
          <Button variant="outline" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Informações do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              {client.photoUrl && (
                <img
                  src={client.photoUrl}
                  alt="Foto do cliente"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                />
              )}
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user?.name || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{client.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Meus Endereços</CardTitle>
              <CardDescription>Gerencie seus endereços de entrega</CardDescription>
            </div>
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Endereço</DialogTitle>
                  <DialogDescription>
                    Adicione um novo endereço de entrega
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={addressForm.cep}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "");
                        setAddressForm({ ...addressForm, cep: formatCEP(cleaned) });
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={addressForm.number}
                        onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={addressForm.neighborhood}
                      onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">UF *</Label>
                      <Input
                        id="state"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase() })}
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createAddress.isPending}>
                    {createAddress.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Endereço"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {addressesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum endereço cadastrado
              </p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-secondary/50 transition"
                  >
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                        {address.isDefault === 1 && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                            Padrão
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAddress.mutate({ id: address.id })}
                      disabled={deleteAddress.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
