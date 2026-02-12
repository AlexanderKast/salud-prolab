import { z } from "zod";

export const productStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "DISCONTINUED",
]);

export const currencyEnum = z.enum(["COP", "USD"]);

export const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  shortDesc: z.string().max(500).optional(),
  sku: z.string().min(1, "SKU es requerido").max(50),
  status: productStatusEnum.default("DRAFT"),
  categoryId: z.string().cuid().optional().nullable(),
  supplierId: z.string().cuid().optional().nullable(),
  basePrice: z.number().positive("El precio debe ser positivo"),
  baseCurrency: currencyEnum.default("USD"),
  weight: z.number().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(320).optional(),
  faqs: z.any().optional(),
  restrictions: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  status: productStatusEnum.optional(),
  country: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  attributes: z.record(z.string()).optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateVariantSchema = createVariantSchema.partial();

export const countryAvailabilitySchema = z.object({
  countryId: z.string().cuid(),
  available: z.boolean().default(true),
  localPrice: z.number().positive().optional().nullable(),
  localCurrency: currencyEnum.optional().nullable(),
  notes: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type CountryAvailabilityInput = z.infer<typeof countryAvailabilitySchema>;
