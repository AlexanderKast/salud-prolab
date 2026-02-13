import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createPriceTierSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("price-tiers:read");
    if (permError) return permError;

    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const priceTiers = await prisma.priceTier.findMany({
      where: { productId: id },
      orderBy: { minQuantity: "asc" },
      include: {
        country: {
          select: { id: true, code: true, name: true, currency: true },
        },
      },
    });

    return NextResponse.json({ data: priceTiers });
  } catch (err) {
    console.error("GET /api/products/[id]/price-tiers error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("price-tiers:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = createPriceTierSchema.safeParse({ ...body, productId: id });

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

    const priceTier = await prisma.priceTier.create({
      data: {
        productId: id,
        countryId: parsed.data.countryId,
        minQuantity: parsed.data.minQuantity,
        maxQuantity: parsed.data.maxQuantity,
        costPrice: parsed.data.costPrice,
        suggestedRetail: parsed.data.suggestedRetail,
      },
      include: {
        country: {
          select: { id: true, code: true, name: true, currency: true },
        },
      },
    });

    return NextResponse.json({ data: priceTier }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products/[id]/price-tiers error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
