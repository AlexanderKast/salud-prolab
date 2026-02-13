import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createPlatformReferenceSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("platforms:read");
    if (permError) return permError;

    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const platformReferences = await prisma.platformProductReference.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: {
        distributor: {
          select: { id: true, companyName: true, city: true, country: true },
        },
      },
    });

    return NextResponse.json({ data: platformReferences });
  } catch (err) {
    console.error("GET /api/products/[id]/platforms error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("platforms:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = createPlatformReferenceSchema.safeParse({ ...body, productId: id });

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

    const platformReference = await prisma.platformProductReference.create({
      data: {
        productId: id,
        distributorId: parsed.data.distributorId,
        platformName: parsed.data.platformName,
        platformProductId: parsed.data.platformProductId,
        platformVariantId: parsed.data.platformVariantId,
        syncEnabled: parsed.data.syncEnabled,
      },
      include: {
        distributor: {
          select: { id: true, companyName: true, city: true, country: true },
        },
      },
    });

    return NextResponse.json({ data: platformReference }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/products/[id]/platforms error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          error:
            "Ya existe una referencia de plataforma con esa combinación de producto, plataforma y distribuidor",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
