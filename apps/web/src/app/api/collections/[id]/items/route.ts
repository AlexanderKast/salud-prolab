import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth } from "@/lib/rbac";
import { addCollectionItemSchema } from "@salud-prolab/shared";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = addCollectionItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    // Owner only
    if (collection.userId !== session!.user.id) {
      return NextResponse.json({ error: "Solo el propietario puede modificar esta colección" }, { status: 403 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: id,
        productId: parsed.data.productId,
        notes: parsed.data.notes,
        sortOrder: parsed.data.sortOrder,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, sku: true, basePrice: true },
        },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/collections/[id]/items error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Este producto ya está en la colección" },
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
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const productIdSchema = z.object({ productId: z.string().cuid() });
    const parsed = productIdSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "productId inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
    }

    // Owner only
    if (collection.userId !== session!.user.id) {
      return NextResponse.json({ error: "Solo el propietario puede modificar esta colección" }, { status: 403 });
    }

    const item = await prisma.collectionItem.findUnique({
      where: {
        collectionId_productId: {
          collectionId: id,
          productId: parsed.data.productId,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Producto no encontrado en la colección" }, { status: 404 });
    }

    await prisma.collectionItem.delete({
      where: {
        collectionId_productId: {
          collectionId: id,
          productId: parsed.data.productId,
        },
      },
    });

    return NextResponse.json({ message: "Producto removido de la colección" });
  } catch (err) {
    console.error("DELETE /api/collections/[id]/items error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
