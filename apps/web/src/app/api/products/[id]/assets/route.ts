import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { z } from "zod";

const createAssetSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "CERTIFICATE"]).default("IMAGE"),
  url: z.string().url(),
  key: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
  alt: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const assets = await prisma.asset.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: assets });
  } catch (err) {
    console.error("GET /api/products/[id]/assets error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("products:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = createAssetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const asset = await prisma.asset.create({
      data: {
        ...parsed.data,
        productId: id,
      },
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products/[id]/assets error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
