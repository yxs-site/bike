import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

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
          cpf: input.cpf,
          phone: input.phone,
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
});

export type AppRouter = typeof appRouter;
