// server/models.ts

import { Schema, model, connect, Document } from "mongoose";
import { isValidCPF, isValidEmail, isValidPhone, cleanNumber } from "../shared/validators";

// --- Interfaces para Tipagem (Opcional, mas recomendado) ---

export interface IUser extends Document {
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface IClient extends Document {
  userId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password?: string; // Opcional, pois pode ser autenticação OAuth
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress extends Document {
  clientId: Schema.Types.ObjectId;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number; // Preço em centavos
  category: string;
  imageUrl?: string;
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin extends Document {
  username: string;
  password?: string; // Hash bcrypt
  email: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployee extends Document {
  userId?: Schema.Types.ObjectId;
  cpf: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Schemas Mongoose ---

// 0. User Schema (Para compatibilidade com o fluxo OAuth)
const UserSchema = new Schema<IUser>(
  {
    openId: { type: String, required: true, unique: true, maxlength: 64 },
    name: { type: String },
    email: { type: String, maxlength: 320 },
    loginMethod: { type: String, maxlength: 64 },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    lastSignedIn: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// 1. Client Schema

// 1. Client Schema
const ClientSchema = new Schema<IClient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, maxlength: 255 },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => isValidEmail(v),
        message: (props) => `${props.value} não é um email válido.`,
      },
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      // Pre-processamento para limpar o CPF antes de salvar
      set: (v: string) => cleanNumber(v),
      validate: {
        validator: (v: string) => isValidCPF(v),
        message: (props) => `${props.value} não é um CPF válido.`,
      },
    },
    phone: {
      type: String,
      required: true,
      // Pre-processamento para limpar o telefone antes de salvar
      set: (v: string) => cleanNumber(v),
      validate: {
        validator: (v: string) => isValidPhone(v),
        message: (props) => `${props.value} não é um telefone válido.`,
      },
    },
    password: { type: String, required: false, maxlength: 255 }, // Hash
    photoUrl: { type: String },
  },
  { timestamps: true }
);

// 2. Address Schema
const AddressSchema = new Schema<IAddress>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    cep: { type: String, required: true, maxlength: 10 },
    street: { type: String, required: true, maxlength: 255 },
    number: { type: String, required: true, maxlength: 20 },
    neighborhood: { type: String, required: true, maxlength: 100 },
    city: { type: String, required: true, maxlength: 100 },
    state: { type: String, required: true, maxlength: 2 },
    complement: { type: String },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// 3. Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, maxlength: 255 },
    description: { type: String },
    price: { type: Number, required: true, min: 0 }, // Preço em centavos
    category: { type: String, required: true, maxlength: 100 },
    imageUrl: { type: String },
    stock: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// 4. Admin Schema
const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, maxlength: 100 },
    password: { type: String, required: true, maxlength: 255 }, // Hash bcrypt
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => isValidEmail(v),
        message: (props) => `${props.value} não é um email válido.`,
      },
    },
    name: { type: String, required: true, maxlength: 255 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// 5. Employee Schema
const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cpf: {
      type: String,
      required: true,
      unique: true,
      set: (v: string) => cleanNumber(v),
      validate: {
        validator: (v: string) => isValidCPF(v),
        message: (props) => `${props.value} não é um CPF válido.`,
      },
    },
    phone: {
      type: String,
      required: true,
      set: (v: string) => cleanNumber(v),
      validate: {
        validator: (v: string) => isValidPhone(v),
        message: (props) => `${props.value} não é um telefone válido.`,
      },
    },
  },
  { timestamps: true }
);

// --- Modelos ---

export const UserModel = model<IUser>("User", UserSchema);
export const ClientModel = model<IClient>("Client", ClientSchema);
export const AddressModel = model<IAddress>("Address", AddressSchema);
export const ProductModel = model<IProduct>("Product", ProductSchema);
export const AdminModel = model<IAdmin>("Admin", AdminSchema);
export const EmployeeModel = model<IEmployee>("Employee", EmployeeSchema);

// Exportar todos os modelos
export default {
  UserModel,
  ClientModel,
  AddressModel,
  ProductModel,
  AdminModel,
  EmployeeModel,
};
