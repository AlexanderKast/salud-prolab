import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("categories:read");
    if (permError) return permError;

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (err) {
    console.error("GET /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("categories:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    // Prevent setting self as parent
    if (parsed.data.parentId === id) {
      return NextResponse.json(
        { error: "Una categoría no puede ser su propio padre" },
        { status: 400 }
      );
    }

    // Verify parent exists if provided
    if (parsed.data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Categoría padre no encontrada" }, { status: 404 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ data: category });
  } catch (err: unknown) {
    console.error("PATCH /api/admin/categories/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese slug" },
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
    const permError = await requirePermission("categories:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría con subcategorías. Elimine o reasigne las subcategorías primero." },
        { status: 400 }
      );
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría con productos asociados. Reasigne los productos primero." },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Categoría eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
