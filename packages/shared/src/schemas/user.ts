import { z } from "zod";

export const roleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "ANALYST",
  "DROPSHIPPER",
  "GUEST",
]);

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: roleEnum.default("GUEST"),
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: roleEnum.optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
