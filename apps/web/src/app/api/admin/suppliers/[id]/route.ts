import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const updateSupplierSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("suppliers:read");
    if (permError) return permError;

    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, slug: true, sku: true, status: true },
          take: 50,
          orderBy: { name: "asc" },
        },
        _count: { select: { products: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: supplier });
  } catch (err) {
    console.error("GET /api/admin/suppliers/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("suppliers:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ data: supplier });
  } catch (err: unknown) {
    console.error("PATCH /api/admin/suppliers/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un proveedor con ese slug" },
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
    const permError = await requirePermission("suppliers:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un proveedor con productos asociados. Desactívelo en su lugar." },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({ message: "Proveedor eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/admin/suppliers/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
