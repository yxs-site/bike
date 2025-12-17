import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertClient, clients, Client,
  InsertEmployee, employees, Employee,
  InsertAddress, addresses, Address,
  InsertProduct, products, Product,
  InsertAdmin, admins, Admin
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= CLIENTES (RF 1.1) =============

export async function createClient(data: InsertClient): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data) as any;
  const [newClient] = await db.select().from(clients).where(eq(clients.id, Number(result.insertId)));
  
  if (!newClient) throw new Error("Failed to create client");
  return newClient;
}

export async function getClientByUserId(userId: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [client] = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
  return client;
}

export async function getClientByCpf(cpf: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [client] = await db.select().from(clients).where(eq(clients.cpf, cpf)).limit(1);
  return client;
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(eq(clients.id, id));
}

// ============= FUNCIONÁRIOS (RF 1.2) =============

export async function createEmployee(data: InsertEmployee): Promise<Employee> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(employees).values(data) as any;
  const [newEmployee] = await db.select().from(employees).where(eq(employees.id, Number(result.insertId)));
  
  if (!newEmployee) throw new Error("Failed to create employee");
  return newEmployee;
}

export async function getEmployeeByUserId(userId: number): Promise<Employee | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [employee] = await db.select().from(employees).where(eq(employees.userId, userId)).limit(1);
  return employee;
}

export async function getEmployeeByCpf(cpf: string): Promise<Employee | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [employee] = await db.select().from(employees).where(eq(employees.cpf, cpf)).limit(1);
  return employee;
}

// ============= ENDEREÇOS (RF 1.5) =============

export async function createAddress(data: InsertAddress): Promise<Address> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Se este endereço for marcado como padrão, desmarcar outros
  if (data.isDefault === 1) {
    await db.update(addresses)
      .set({ isDefault: 0 })
      .where(eq(addresses.clientId, data.clientId));
  }

  const result = await db.insert(addresses).values(data) as any;
  const [newAddress] = await db.select().from(addresses).where(eq(addresses.id, Number(result.insertId)));
  
  if (!newAddress) throw new Error("Failed to create address");
  return newAddress;
}

export async function getAddressesByClientId(clientId: number): Promise<Address[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(addresses).where(eq(addresses.clientId, clientId));
}

export async function updateAddress(id: number, data: Partial<InsertAddress>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Se este endereço for marcado como padrão, desmarcar outros
  if (data.isDefault === 1) {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    if (address) {
      await db.update(addresses)
        .set({ isDefault: 0 })
        .where(eq(addresses.clientId, address.clientId));
    }
  }

  await db.update(addresses).set(data).where(eq(addresses.id, id));
}

export async function deleteAddress(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(addresses).where(eq(addresses.id, id));
}

// ============= PRODUTOS (RF 2.1) =============

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products).where(eq(products.active, 1));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product;
}

export async function createProduct(data: InsertProduct): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(data) as any;
  const [newProduct] = await db.select().from(products).where(eq(products.id, Number(result.insertId)));
  
  if (!newProduct) throw new Error("Failed to create product");
  return newProduct;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(products).where(eq(products.id, id));
}

// ============= ADMIN (Login) =============

export async function getAdminByUsername(username: string): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [admin] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  return admin;
}
