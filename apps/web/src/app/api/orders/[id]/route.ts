import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateOrderStatusSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("orders:read");
    if (permError) return permError;

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            companyName: true,
            taxId: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, slug: true, basePrice: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("orders:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const { status, notes, trackingNumber } = parsed.data;

    // Update order status and add history entry in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Add status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          notes,
        },
      });

      // Update the order
      const updateData: Record<string, unknown> = { status };
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (notes !== undefined) updateData.notes = notes;

      return tx.order.update({
        where: { id },
        data: updateData,
        include: {
          distributor: {
            select: { id: true, companyName: true },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    return NextResponse.json({ data: order });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
