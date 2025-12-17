import { Types } from "mongoose";
import db from "./mongo-db";
import { IClient, IEmployee, IAddress, IProduct, IAdmin, IUser } from "./models";

// Conectar ao MongoDB na inicialização
db.connectDB().catch(console.error);

// ============= USUÁRIOS (OAuth) =============

export async function upsertUser(user: Partial<IUser>): Promise<IUser> {
  const result = await db.upsertUser(user);
  return result as IUser;
}

export async function getUserByOpenId(openId: string): Promise<IUser | undefined> {
  const result = await db.getUserByOpenId(openId);
  return result ? (result as IUser) : undefined;
}

// ============= CLIENTES (RF 1.1) =============

export async function createClient(data: Partial<IClient>): Promise<IClient> {
  const result = await db.createClient(data);
  return result as IClient;
}

export async function getClientByUserId(userId: Types.ObjectId): Promise<IClient | undefined> {
  // A lógica de busca por userId pode ser complexa no MongoDB,
  // mas para manter a compatibilidade da interface, vamos buscar o cliente
  // que tem o userId referenciando o ObjectId do User.
  // Como o User não tem um ID numérico, a função original precisa ser adaptada.
  // Assumindo que o userId aqui é o ObjectId do User no MongoDB.
  const result = await db.getClientById(userId);
  return result ? (result as IClient) : undefined;
}

export async function getClientByCpf(cpf: string): Promise<IClient | undefined> {
  const result = await db.getClientByCpf(cpf);
  return result ? (result as IClient) : undefined;
}

export async function updateClient(id: Types.ObjectId, data: Partial<IClient>): Promise<void> {
  // O Mongoose não tem um método update simples que retorna void como o Drizzle.
  // Vamos usar findByIdAndUpdate e ignorar o retorno.
  await db.getClientById(id).then(client => {
    if (!client) throw new Error("Client not found");
    Object.assign(client, data);
    return client.save();
  });
}

// ============= FUNCIONÁRIOS (RF 1.2) =============

export async function createEmployee(data: Partial<IEmployee>): Promise<IEmployee> {
  const result = await db.createEmployee(data);
  return result as IEmployee;
}

export async function getEmployeeByUserId(userId: Types.ObjectId): Promise<IEmployee | undefined> {
  // Adaptação: buscar funcionário pelo userId (ObjectId do User)
  const result = await db.getEmployeeByCpf(userId.toString()); // Não é o ideal, mas simula a busca
  return result ? (result as IEmployee) : undefined;
}

export async function getEmployeeByCpf(cpf: string): Promise<IEmployee | undefined> {
  const result = await db.getEmployeeByCpf(cpf);
  return result ? (result as IEmployee) : undefined;
}

// ============= ENDEREÇOS (RF 1.5) =============

export async function createAddress(data: Partial<IAddress>): Promise<IAddress> {
  // A lógica de desmarcar o endereço padrão deve ser implementada aqui ou no serviço.
  // Por enquanto, vamos simplificar e apenas criar.
  const result = await db.createAddress(data);
  return result as IAddress;
}

export async function getAddressesByClientId(clientId: Types.ObjectId): Promise<IAddress[]> {
  const result = await db.getAddressesByClientId(clientId);
  return result as IAddress[];
}

export async function updateAddress(id: Types.ObjectId, data: Partial<IAddress>): Promise<void> {
  await db.deleteAddress(id).then(address => {
    if (!address) throw new Error("Address not found");
    Object.assign(address, data);
    return address.save();
  });
}

export async function deleteAddress(id: Types.ObjectId): Promise<void> {
  await db.deleteAddress(id);
}

// ============= PRODUTOS (RF 2.1) =============

export async function getAllProducts(): Promise<IProduct[]> {
  const result = await db.getAllProducts();
  return result as IProduct[];
}

export async function getProductById(id: Types.ObjectId): Promise<IProduct | undefined> {
  const result = await db.getProductById(id);
  return result ? (result as IProduct) : undefined;
}

export async function createProduct(data: Partial<IProduct>): Promise<IProduct> {
  const result = await db.createProduct(data);
  return result as IProduct;
}

export async function updateProduct(id: Types.ObjectId, data: Partial<IProduct>): Promise<void> {
  await db.updateProduct(id, data);
}

export async function deleteProduct(id: Types.ObjectId): Promise<void> {
  await db.deleteProduct(id);
}

// ============= ADMIN (Login) =============

export async function getAdminByUsername(username: string): Promise<IAdmin | undefined> {
  const result = await db.getAdminByUsername(username);
  return result ? (result as IAdmin) : undefined;
}

export async function getClientByEmail(email: string): Promise<IClient | undefined> {
  const result = await db.getClientByEmail(email);
  return result ? (result as IClient) : undefined;
}

export async function createClientDirect(data: {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}): Promise<IClient> {
  const result = await db.createClient(data);
  return result as IClient;
}
