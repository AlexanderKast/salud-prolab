import { z } from "zod";

export const createDistributorSchema = z.object({
  companyName: z.string().min(2, "Nombre de empresa requerido"),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  distributorId: z.string().min(1, "Distribuidor requerido"),
  type: z.enum(["DROPSHIPPING_INMEDIATO", "DROPSHIPPING_PROGRAMADO", "MAQUILA_PRODUCCION"]),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantInfo: z.string().optional(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1, "Al menos un item requerido"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PRODUCCION",
    "ENVIADO",
    "ENTREGADO",
    "CANCELADO",
    "DEVUELTO",
  ]),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export const createScheduledOrderSchema = z.object({
  distributorId: z.string().min(1),
  productId: z.string().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  quantity: z.number().int().min(1),
  nextDelivery: z.string().min(1, "Fecha requerida"),
  notes: z.string().optional(),
});

export const createPriceTierSchema = z.object({
  productId: z.string().min(1),
  countryId: z.string().optional(),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().optional(),
  costPrice: z.number().min(0),
  suggestedRetail: z.number().min(0),
});

export const createPlatformReferenceSchema = z.object({
  productId: z.string().min(1),
  distributorId: z.string().optional(),
  platformName: z.enum(["EFFI", "DROPI", "HOKO", "MASTERSHOP", "SHOPIFY", "OTRO"]),
  platformProductId: z.string().min(1, "ID de plataforma requerido"),
  platformVariantId: z.string().optional(),
  syncEnabled: z.boolean().default(true),
});
