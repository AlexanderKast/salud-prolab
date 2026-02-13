import { z } from "zod";

// ── Enums ────────────────────────────────────────────────

export const crmContactTypeEnum = z.enum(["PERSONA", "EMPRESA"]);
export const crmContactSourceEnum = z.enum([
  "MANUAL",
  "IMPORTACION",
  "WEB",
  "REFERIDO",
  "WHATSAPP",
  "EMAIL",
  "OTRO",
]);
export const crmPipelineTypeEnum = z.enum(["LEADS", "DEALS"]);
export const crmActivityTypeEnum = z.enum([
  "NOTA",
  "LLAMADA",
  "EMAIL",
  "WHATSAPP",
  "REUNION",
  "TAREA",
]);
export const crmCampaignStatusEnum = z.enum([
  "BORRADOR",
  "PROGRAMADA",
  "ENVIANDO",
  "COMPLETADA",
  "CANCELADA",
]);

// ── Contacts ─────────────────────────────────────────────

export const createCrmContactSchema = z.object({
  type: crmContactTypeEnum.default("PERSONA"),
  source: crmContactSourceEnum.default("MANUAL"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyName: z.string().optional(),
  position: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  distributorId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const updateCrmContactSchema = createCrmContactSchema.partial();

// ── Pipelines ────────────────────────────────────────────

export const createCrmPipelineSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: crmPipelineTypeEnum,
  description: z.string().optional(),
});

export const updateCrmPipelineSchema = createCrmPipelineSchema.partial();

export const createCrmPipelineStageSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido")
    .default("#6B7280"),
  sortOrder: z.number().int().min(0).default(0),
  isWon: z.boolean().default(false),
  isLost: z.boolean().default(false),
});

export const updateCrmPipelineStageSchema = createCrmPipelineStageSchema.partial();

// ── Leads ────────────────────────────────────────────────

export const createCrmLeadSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  contactId: z.string().min(1, "Contacto requerido"),
  source: crmContactSourceEnum.default("MANUAL"),
  sourceDetail: z.string().optional(),
  assignedToId: z.string().optional(),
  score: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.unknown()).optional(),
});

export const updateCrmLeadSchema = createCrmLeadSchema.partial();

export const moveCrmLeadSchema = z.object({
  stageId: z.string().min(1),
  stageOrder: z.number().int().min(0),
});

export const convertCrmLeadSchema = z.object({
  dealPipelineId: z.string().min(1),
  dealStageId: z.string().min(1),
  value: z.number().min(0, "Valor debe ser positivo"),
  currency: z.enum(["COP", "USD"]).default("COP"),
});

// ── Deals ────────────────────────────────────────────────

export const createCrmDealSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  contactId: z.string().min(1, "Contacto requerido"),
  value: z.number().min(0, "Valor debe ser positivo"),
  currency: z.enum(["COP", "USD"]).default("COP"),
  probability: z.number().int().min(0).max(100).default(50),
  expectedCloseDate: z.string().optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.unknown()).optional(),
});

export const updateCrmDealSchema = createCrmDealSchema.partial();

export const moveCrmDealSchema = z.object({
  stageId: z.string().min(1),
  stageOrder: z.number().int().min(0),
  lostReason: z.string().optional(),
});

// ── Activities ───────────────────────────────────────────

export const createCrmActivitySchema = z.object({
  type: crmActivityTypeEnum,
  subject: z.string().min(1, "Asunto requerido"),
  body: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
  scheduledAt: z.string().optional(),
});

export const updateCrmActivitySchema = createCrmActivitySchema.partial();

// ── Email Campaigns ──────────────────────────────────────

export const createCrmCampaignSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  subject: z.string().min(1, "Asunto requerido"),
  body: z.string().min(1, "Contenido requerido"),
  templateId: z.string().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email("Email inválido").optional().or(z.literal("")),
  scheduledAt: z.string().optional(),
  recipientContactIds: z.array(z.string()).min(1, "Al menos un destinatario"),
});

export const updateCrmCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  templateId: z.string().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional().or(z.literal("")),
  scheduledAt: z.string().optional(),
});

// ── WhatsApp ─────────────────────────────────────────────

export const sendCrmWhatsAppSchema = z.object({
  contactId: z.string().min(1, "Contacto requerido"),
  templateName: z.string().optional(),
  templateParams: z.record(z.string()).optional(),
  body: z.string().optional(),
});

// ── Automations ──────────────────────────────────────────

export const createCrmAutomationSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  trigger: z.enum([
    "LEAD_CREADO",
    "LEAD_ETAPA_CAMBIADA",
    "DEAL_CREADO",
    "DEAL_ETAPA_CAMBIADA",
    "DEAL_GANADO",
    "DEAL_PERDIDO",
    "CONTACTO_CREADO",
    "ACTIVIDAD_CREADA",
  ]),
  triggerConfig: z.record(z.unknown()).optional(),
  action: z.enum([
    "ENVIAR_EMAIL",
    "ENVIAR_WHATSAPP",
    "CREAR_ACTIVIDAD",
    "MOVER_ETAPA",
    "ASIGNAR_USUARIO",
    "NOTIFICAR",
  ]),
  actionConfig: z.record(z.unknown()).optional(),
  pipelineId: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateCrmAutomationSchema = createCrmAutomationSchema.partial();

// ── Type exports ─────────────────────────────────────────

export type CreateCrmContactInput = z.infer<typeof createCrmContactSchema>;
export type UpdateCrmContactInput = z.infer<typeof updateCrmContactSchema>;
export type CreateCrmPipelineInput = z.infer<typeof createCrmPipelineSchema>;
export type CreateCrmPipelineStageInput = z.infer<typeof createCrmPipelineStageSchema>;
export type CreateCrmLeadInput = z.infer<typeof createCrmLeadSchema>;
export type MoveCrmLeadInput = z.infer<typeof moveCrmLeadSchema>;
export type ConvertCrmLeadInput = z.infer<typeof convertCrmLeadSchema>;
export type CreateCrmDealInput = z.infer<typeof createCrmDealSchema>;
export type MoveCrmDealInput = z.infer<typeof moveCrmDealSchema>;
export type CreateCrmActivityInput = z.infer<typeof createCrmActivitySchema>;
export type CreateCrmCampaignInput = z.infer<typeof createCrmCampaignSchema>;
export type SendCrmWhatsAppInput = z.infer<typeof sendCrmWhatsAppSchema>;
export type CreateCrmAutomationInput = z.infer<typeof createCrmAutomationSchema>;
