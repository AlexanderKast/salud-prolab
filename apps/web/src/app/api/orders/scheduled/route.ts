import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createScheduledOrderSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("orders:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const active = searchParams.get("active");
    const distributorId = searchParams.get("distributorId") || undefined;

    const where: Record<string, unknown> = {};

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    if (distributorId) {
      where.distributorId = distributorId;
    }

    const [data, total] = await Promise.all([
      prisma.scheduledOrder.findMany({
        where,
        orderBy: { nextDelivery: "asc" },
        skip,
        take: limit,
        include: {
          distributor: {
            select: {
              id: true,
              companyName: true,
              city: true,
              country: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.scheduledOrder.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/orders/scheduled error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("orders:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createScheduledOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { distributorId, productId, frequency, quantity, nextDelivery, notes } = parsed.data;

    // Verify distributor exists
    const distributor = await prisma.distributor.findUnique({ where: { id: distributorId } });
    if (!distributor) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 });
    }

    const scheduledOrder = await prisma.scheduledOrder.create({
      data: {
        distributorId,
        productId,
        frequency,
        quantity,
        nextDelivery: new Date(nextDelivery),
        notes,
      },
      include: {
        distributor: {
          select: {
            id: true,
            companyName: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json({ data: scheduledOrder }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders/scheduled error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
