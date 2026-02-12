import { z } from "zod";

export const createResearchNoteSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(200),
  content: z.string().min(1, "El contenido es requerido"),
  source: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateResearchNoteSchema = createResearchNoteSchema.partial();

export const createBenchmarkSchema = z.object({
  competitor: z.string().min(1, "El nombre del competidor es requerido"),
  url: z.string().url("URL inválida").optional().nullable(),
  price: z.number().positive().optional().nullable(),
  currency: z.enum(["COP", "USD"]).default("COP"),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().min(0).optional().nullable(),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const updateBenchmarkSchema = createBenchmarkSchema.partial();

export type CreateResearchNoteInput = z.infer<typeof createResearchNoteSchema>;
export type UpdateResearchNoteInput = z.infer<typeof updateResearchNoteSchema>;
export type CreateBenchmarkInput = z.infer<typeof createBenchmarkSchema>;
