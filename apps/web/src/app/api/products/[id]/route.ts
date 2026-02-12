import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { updateProductSchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        supplier: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { sortOrder: "asc" } },
        availability: {
          include: {
            country: { select: { id: true, code: true, name: true, currency: true } },
          },
        },
        assets: { orderBy: { sortOrder: "asc" } },
        research: {
          select: { id: true, title: true, createdAt: true, tags: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("products:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        supplier: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ data: product });
  } catch (err: unknown) {
    console.error("PATCH /api/products/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug o SKU" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("products:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Soft delete: set status to DISCONTINUED
    const product = await prisma.product.update({
      where: { id },
      data: { status: "DISCONTINUED" },
    });

    return NextResponse.json({ data: product, message: "Producto descontinuado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
