// server/mongo-db.ts

import mongoose, { ConnectOptions, Types } from "mongoose";
import {
  ClientModel,
  AddressModel,
  ProductModel,
  AdminModel,
  EmployeeModel,
  IClient,
  IAddress,
  IProduct,
  IAdmin,
  IEmployee,
  IUser,
  UserModel,
} from "./models";
import { cleanNumber } from "./validators";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI não está definida nas variáveis de ambiente.");
  // Em um ambiente de produção, você pode querer lançar um erro aqui
}

/**
 * Conecta ao banco de dados MongoDB.
 */
export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("Database not available: MONGO_URI is not defined.");
  }

  try {
    await mongoose.connect(MONGO_URI, {
      appName: "yxs", // O appName da URI
    } as ConnectOptions);
    console.log("Conexão com MongoDB estabelecida com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw new Error("Database not available: Falha na conexão com MongoDB.");
  }
}

// --- Funções de Usuário (User) ---

/**
 * Cria ou atualiza um usuário (usado no fluxo OAuth).
 * @param userData Dados do usuário.
 * @returns O usuário criado ou atualizado.
 */
export async function upsertUser(userData: Partial<IUser>): Promise<IUser> {
  if (!userData.openId) {
    throw new Error("User openId is required for upsert");
  }

  const filter = { openId: userData.openId };
  const update = {
    ...userData,
    lastSignedIn: new Date(),
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  const user = await UserModel.findOneAndUpdate(filter, update, options).exec();
  if (!user) {
    throw new Error("Failed to upsert user");
  }
  return user;
}

/**
 * Busca um usuário pelo openId.
 * @param openId openId do usuário.
 * @returns O usuário encontrado ou null.
 */
export async function getUserByOpenId(openId: string): Promise<IUser | null> {
  return UserModel.findOne({ openId }).exec();
}

// --- Funções de Cliente (Client) ---

/**
 * Cria um novo cliente.
 * @param clientData Dados do cliente.
 * @returns O cliente criado.
 */
export async function createClient(clientData: Partial<IClient>): Promise<IClient> {
  // O Mongoose aplica as validações e o setter (cleanNumber) automaticamente
  const newClient = new ClientModel(clientData);
  return newClient.save();
}

/**
 * Busca um cliente pelo email.
 * @param email Email do cliente.
 * @returns O cliente encontrado ou null.
 */
export async function getClientByEmail(email: string): Promise<IClient | null> {
  return ClientModel.findOne({ email }).exec();
}

/**
 * Busca um cliente pelo CPF.
 * @param cpf CPF do cliente (pode estar formatado).
 * @returns O cliente encontrado ou null.
 */
export async function getClientByCpf(cpf: string): Promise<IClient | null> {
  const cleanedCpf = cleanNumber(cpf);
  return ClientModel.findOne({ cpf: cleanedCpf }).exec();
}

/**
 * Busca um cliente pelo ID.
 * @param id ID do cliente.
 * @returns O cliente encontrado ou null.
 */
export async function getClientById(id: string | Types.ObjectId): Promise<IClient | null> {
  return ClientModel.findById(id).exec();
}

// --- Funções de Endereço (Address) ---

/**
 * Cria um novo endereço para um cliente.
 * @param addressData Dados do endereço.
 * @returns O endereço criado.
 */
export async function createAddress(addressData: Partial<IAddress>): Promise<IAddress> {
  const newAddress = new AddressModel(addressData);
  return newAddress.save();
}

/**
 * Busca todos os endereços de um cliente.
 * @param clientId ID do cliente.
 * @returns Lista de endereços.
 */
export async function getAddressesByClientId(clientId: string | Types.ObjectId): Promise<IAddress[]> {
  return AddressModel.find({ clientId }).exec();
}

/**
 * Deleta um endereço pelo ID.
 * @param addressId ID do endereço.
 * @returns O endereço deletado ou null.
 */
export async function deleteAddress(addressId: string | Types.ObjectId): Promise<IAddress | null> {
  return AddressModel.findByIdAndDelete(addressId).exec();
}

// --- Funções de Produto (Product) ---

/**
 * Busca todos os produtos.
 * @returns Lista de produtos.
 */
export async function getAllProducts(): Promise<IProduct[]> {
  return ProductModel.find({ active: true }).exec();
}

/**
 * Busca um produto pelo ID.
 * @param id ID do produto.
 * @returns O produto encontrado ou null.
 */
export async function getProductById(id: string | Types.ObjectId): Promise<IProduct | null> {
  return ProductModel.findById(id).exec();
}

/**
 * Cria um novo produto.
 * @param productData Dados do produto.
 * @returns O produto criado.
 */
export async function createProduct(productData: Partial<IProduct>): Promise<IProduct> {
  const newProduct = new ProductModel(productData);
  return newProduct.save();
}

/**
 * Atualiza um produto pelo ID.
 * @param id ID do produto.
 * @param updateData Dados para atualização.
 * @returns O produto atualizado ou null.
 */
export async function updateProduct(id: string | Types.ObjectId, updateData: Partial<IProduct>): Promise<IProduct | null> {
  return ProductModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
}

/**
 * Deleta (inativa) um produto pelo ID.
 * @param id ID do produto.
 * @returns O produto inativado ou null.
 */
export async function deleteProduct(id: string | Types.ObjectId): Promise<IProduct | null> {
  // Em vez de deletar, vamos inativar
  return ProductModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
}

// --- Funções de Admin (Admin) ---

/**
 * Busca um administrador pelo username.
 * @param username Username do administrador.
 * @returns O administrador encontrado ou null.
 */
export async function getAdminByUsername(username: string): Promise<IAdmin | null> {
  return AdminModel.findOne({ username }).exec();
}

/**
 * Cria um novo administrador.
 * @param adminData Dados do administrador.
 * @returns O administrador criado.
 */
export async function createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
  const newAdmin = new AdminModel(adminData);
  return newAdmin.save();
}

// --- Funções de Funcionário (Employee) ---

/**
 * Cria um novo funcionário.
 * @param employeeData Dados do funcionário.
 * @returns O funcionário criado.
 */
export async function createEmployee(employeeData: Partial<IEmployee>): Promise<IEmployee> {
  const newEmployee = new EmployeeModel(employeeData);
  return newEmployee.save();
}

/**
 * Busca um funcionário pelo CPF.
 * @param cpf CPF do funcionário (pode estar formatado).
 * @returns O funcionário encontrado ou null.
 */
export async function getEmployeeByCpf(cpf: string): Promise<IEmployee | null> {
  const cleanedCpf = cleanNumber(cpf);
  return EmployeeModel.findOne({ cpf: cleanedCpf }).exec();
}

// Exportar todas as funções
export default {
  connectDB,
  upsertUser,
  getUserByOpenId,
  createClient,
  getClientByEmail,
  getClientByCpf,
  getClientById,
  createAddress,
  getAddressesByClientId,
  deleteAddress,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminByUsername,
  createAdmin,
  createEmployee,
  getEmployeeByCpf,
};
