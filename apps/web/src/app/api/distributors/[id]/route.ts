import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const updateDistributorSchema = z.object({
  companyName: z.string().min(2).optional(),
  taxId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("distributors:read");
    if (permError) return permError;

    const { id } = await params;

    const distributor = await prisma.distributor.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            type: true,
            status: true,
            total: true,
            createdAt: true,
          },
          take: 50,
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { orders: true, scheduledOrders: true, platformReferences: true } },
      },
    });

    if (!distributor) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: distributor });
  } catch (err) {
    console.error("GET /api/distributors/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("distributors:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDistributorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.distributor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 });
    }

    const distributor = await prisma.distributor.update({
      where: { id },
      data: parsed.data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ data: distributor });
  } catch (err: unknown) {
    console.error("PATCH /api/distributors/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un distribuidor con esos datos" },
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
    const permError = await requirePermission("distributors:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.distributor.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 });
    }

    if (existing._count.orders > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un distribuidor con órdenes asociadas. Desactívelo en su lugar.",
        },
        { status: 400 }
      );
    }

    await prisma.distributor.delete({ where: { id } });

    return NextResponse.json({ message: "Distribuidor eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/distributors/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
