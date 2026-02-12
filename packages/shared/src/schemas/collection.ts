import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const addCollectionItemSchema = z.object({
  productId: z.string().cuid(),
  notes: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddCollectionItemInput = z.infer<typeof addCollectionItemSchema>;
