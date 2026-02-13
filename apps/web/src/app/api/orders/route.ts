import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createOrderSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("orders:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const distributorId = searchParams.get("distributorId") || undefined;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (distributorId) where.distributorId = distributorId;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          distributor: {
            select: { id: true, companyName: true, city: true, country: true },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
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
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("orders:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { distributorId, type, notes, shippingAddress, items } = parsed.data;

    // Verify distributor exists
    const distributor = await prisma.distributor.findUnique({ where: { id: distributorId } });
    if (!distributor) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 });
    }

    // Calculate totals from items
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = 0;
    const total = subtotal + tax;

    // Auto-generate order number
    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        distributorId,
        orderNumber,
        type,
        notes,
        shippingAddress,
        subtotal,
        tax,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantInfo: item.variantInfo,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
        statusHistory: {
          create: {
            status: "PENDIENTE",
            notes: "Orden creada",
          },
        },
      },
      include: {
        distributor: {
          select: { id: true, companyName: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/orders error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe una orden con ese número" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
