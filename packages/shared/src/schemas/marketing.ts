import { z } from "zod";

export const ESFERA_PHASES = [
  "ESTRATEGIA",
  "SEGMENTOS",
  "FUNNEL",
  "EJECUCION",
  "RECURSOS",
  "ANALISIS",
] as const;

export const playbookStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const templateTypeEnum = z.enum(["EMAIL", "SOCIAL", "LANDING", "AD", "WHATSAPP"]);

export const createPlaybookSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  status: playbookStatusEnum.default("DRAFT"),
  tags: z.array(z.string()).default([]),
});

export const updatePlaybookSchema = createPlaybookSchema.partial();

export const createPlaybookSectionSchema = z.object({
  phase: z.enum(ESFERA_PHASES),
  title: z.string().min(1),
  content: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export const updatePlaybookSectionSchema = createPlaybookSectionSchema.partial();

export const createTemplateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  type: templateTypeEnum.default("EMAIL"),
  subject: z.string().optional(),
  body: z.string().min(1, "El contenido es requerido"),
  variables: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreatePlaybookInput = z.infer<typeof createPlaybookSchema>;
export type UpdatePlaybookInput = z.infer<typeof updatePlaybookSchema>;
export type CreatePlaybookSectionInput = z.infer<typeof createPlaybookSectionSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
