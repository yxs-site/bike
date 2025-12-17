import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= CLIENTES (RF 1.1) =============
  clients: router({
    // Login de cliente
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const client = await db.getClientByEmail(input.email);
        if (!client) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        // Comparar senha com hash SHA256
        const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
        if (client.password !== passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        // Retornar dados do cliente (sem password)
        return {
          id: client.id,
          email: client.email,
          name: client.name,
        };
      }),

    // Signup de cliente
    signup: publicProcedure
      .input(z.object({
        name: z.string().min(3),
        email: z.string().email(),
        phone: z.string().min(10),
        cpf: z.string().length(14),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        // Validar senhas
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "As senhas não conferem",
          });
        }

        // Verificar se email já existe
        const existingEmail = await db.getClientByEmail(input.email);
        if (existingEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email já cadastrado",
          });
        }

        // Verificar se CPF já existe
        const existingCpf = await db.getClientByCpf(input.cpf);
        if (existingCpf) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CPF já cadastrado",
          });
        }

        // Hash da senha
        const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");

        // Criar cliente
        const client = await db.createClientDirect({
          name: input.name,
          email: input.email,
          phone: input.phone,
          cpf: input.cpf,
          password: passwordHash,
        });

        return {
          id: client.id,
          email: client.email,
          name: client.name,
        };
      }),

    // Criar perfil de cliente
    create: protectedProcedure
      .input(z.object({
        cpf: z.string().length(14, "CPF deve ter 14 caracteres (com pontuação)"),
        phone: z.string().min(10, "Telefone inválido"),
        photoBase64: z.string().optional(), // Base64 da foto
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se já existe cliente para este usuário
        const existing = await db.getClientByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Usuário já possui perfil de cliente" 
          });
        }

        // Verificar unicidade do CPF
        const cpfExists = await db.getClientByCpf(input.cpf);
        if (cpfExists) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "CPF já cadastrado" 
          });
        }

        let photoUrl: string | null = null;

        // Upload da foto se fornecida
        if (input.photoBase64) {
          try {
            const buffer = Buffer.from(input.photoBase64, 'base64');
            const fileName = `client-${ctx.user.id}-${Date.now()}.jpg`;
            const { url } = await storagePut(`clients/${fileName}`, buffer, "image/jpeg");
            photoUrl = url;
          } catch (error) {
            console.error("Erro ao fazer upload da foto:", error);
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: "Falha ao fazer upload da foto" 
            });
          }
        }

        const client = await db.createClient({
          userId: ctx.user.id,
          name: ctx.user.name || "Cliente",
          email: ctx.user.email || "",
          cpf: input.cpf,
          phone: input.phone,
          password: "", // Senha vazia para usuários OAuth
          photoUrl,
        });

        return client;
      }),

    // Obter perfil do cliente logado
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientByUserId(ctx.user.id);
    }),

    // Atualizar perfil do cliente
    updateProfile: protectedProcedure
      .input(z.object({
        phone: z.string().min(10).optional(),
        photoBase64: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const client = await db.getClientByUserId(ctx.user.id);
        if (!client) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Perfil de cliente não encontrado" 
          });
        }

        const updateData: any = {};
        if (input.phone) updateData.phone = input.phone;

        if (input.photoBase64) {
          const buffer = Buffer.from(input.photoBase64, 'base64');
          const fileName = `client-${ctx.user.id}-${Date.now()}.jpg`;
          const { url } = await storagePut(`clients/${fileName}`, buffer, "image/jpeg");
          updateData.photoUrl = url;
        }

        await db.updateClient(client.id, updateData);
        return { success: true };
      }),
  }),

  // ============= FUNCIONÁRIOS (RF 1.2) =============
  employees: router({
    // Criar perfil de funcionário (apenas admin pode criar)
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        cpf: z.string().length(14),
        phone: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "Apenas administradores podem criar funcionários" 
          });
        }

        // Verificar unicidade do CPF
        const cpfExists = await db.getEmployeeByCpf(input.cpf);
        if (cpfExists) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "CPF já cadastrado" 
          });
        }

        const employee = await db.createEmployee(input);
        return employee;
      }),

    // Obter perfil do funcionário logado
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getEmployeeByUserId(ctx.user.id);
    }),
  }),

  // ============= ENDEREÇOS (RF 1.5) =============
  addresses: router({
    // Criar novo endereço
    create: protectedProcedure
      .input(z.object({
        cep: z.string().length(9, "CEP deve ter 9 caracteres (com hífen)"),
        street: z.string().min(3, "Rua inválida"),
        number: z.string().min(1, "Número inválido"),
        neighborhood: z.string().min(3, "Bairro inválido"),
        city: z.string().min(3, "Cidade inválida"),
        state: z.string().length(2, "Estado deve ter 2 caracteres"),
        complement: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const client = await db.getClientByUserId(ctx.user.id);
        if (!client) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Perfil de cliente não encontrado. Crie um perfil primeiro." 
          });
        }

        const address = await db.createAddress({
          clientId: client.id,
          cep: input.cep,
          street: input.street,
          number: input.number,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          complement: input.complement || null,
          isDefault: input.isDefault ? 1 : 0,
        });

        return address;
      }),

    // Listar endereços do cliente logado
    list: protectedProcedure.query(async ({ ctx }) => {
      const client = await db.getClientByUserId(ctx.user.id);
      if (!client) return [];

      return await db.getAddressesByClientId(client.id);
    }),

    // Atualizar endereço
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        cep: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        complement: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const client = await db.getClientByUserId(ctx.user.id);
        if (!client) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Perfil de cliente não encontrado" 
          });
        }

        const updateData: any = {};
        if (input.cep) updateData.cep = input.cep;
        if (input.street) updateData.street = input.street;
        if (input.number) updateData.number = input.number;
        if (input.neighborhood) updateData.neighborhood = input.neighborhood;
        if (input.city) updateData.city = input.city;
        if (input.state) updateData.state = input.state;
        if (input.complement !== undefined) updateData.complement = input.complement;
        if (input.isDefault !== undefined) updateData.isDefault = input.isDefault ? 1 : 0;

        await db.updateAddress(input.id, updateData);
        return { success: true };
      }),

    // Deletar endereço
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAddress(input.id);
        return { success: true };
      }),
  }),

  // ============= PRODUTOS (RF 2.1) =============
  products: router({
    // Listar todos os produtos ativos
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),

    // Obter produto por ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
  }),

  // ============= ADMIN (Login) =============
  admin: router({
    // Login do administrador
    login: publicProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const admin = await db.getAdminByUsername(input.username);
        if (!admin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário ou senha inválidos",
          });
        }

        // Comparar senha com hash SHA256
        const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
        if (admin.password !== passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário ou senha inválidos",
          });
        }

        if (admin.active !== 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Administrador inativo",
          });
        }

        // Retornar dados do admin (sem password)
        return {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
        };
      }),

    // Criar produto (apenas admin)
    createProduct: publicProcedure
      .input(z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        price: z.number().min(0),
        category: z.string().min(3),
        imageUrl: z.string().optional(),
        stock: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // Nota: Em produção, verificar se o usuário é admin
        return await db.createProduct({
          name: input.name,
          description: input.description || null,
          price: Math.round(input.price * 100), // Converter para centavos
          category: input.category,
          imageUrl: input.imageUrl || null,
          stock: input.stock,
          active: 1,
        });
      }),

    // Atualizar produto (apenas admin)
    updateProduct: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.price !== undefined) updateData.price = Math.round(input.price * 100);
        if (input.category) updateData.category = input.category;
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
        if (input.stock !== undefined) updateData.stock = input.stock;

        await db.updateProduct(input.id, updateData);
        return { success: true };
      }),

    // Deletar produto (apenas admin)
    deleteProduct: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
