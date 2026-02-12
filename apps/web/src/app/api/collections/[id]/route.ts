import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth } from "@/lib/rbac";
import { updateCollectionSchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                basePrice: true,
                baseCurrency: true,
                status: true,
                assets: {
                  where: { type: "IMAGE" },
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                  select: { url: true, alt: true },
                },
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    // Only owner or public collections
    if (collection.userId !== session!.user.id && !collection.isPublic) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    return NextResponse.json({ data: collection });
  } catch (err) {
    console.error("GET /api/collections/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    // Owner only
    if (existing.userId !== session!.user.id) {
      return NextResponse.json({ error: "Solo el propietario puede editar esta colección" }, { status: 403 });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ data: collection });
  } catch (err) {
    console.error("PATCH /api/collections/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    // Owner only
    if (existing.userId !== session!.user.id) {
      return NextResponse.json({ error: "Solo el propietario puede eliminar esta colección" }, { status: 403 });
    }

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ message: "Colección eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/collections/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
