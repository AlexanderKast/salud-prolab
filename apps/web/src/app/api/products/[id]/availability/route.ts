import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { countryAvailabilitySchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const availability = await prisma.productCountryAvailability.findMany({
      where: { productId: id },
      include: {
        country: { select: { id: true, code: true, name: true, currency: true } },
      },
    });

    return NextResponse.json({ data: availability });
  } catch (err) {
    console.error("GET /api/products/[id]/availability error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("products:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = countryAvailabilitySchema.safeParse(body);

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

    const availability = await prisma.productCountryAvailability.upsert({
      where: {
        productId_countryId: {
          productId: id,
          countryId: parsed.data.countryId,
        },
      },
      update: {
        available: parsed.data.available,
        localPrice: parsed.data.localPrice,
        localCurrency: parsed.data.localCurrency,
        notes: parsed.data.notes,
      },
      create: {
        productId: id,
        countryId: parsed.data.countryId,
        available: parsed.data.available,
        localPrice: parsed.data.localPrice,
        localCurrency: parsed.data.localCurrency,
        notes: parsed.data.notes,
      },
      include: {
        country: { select: { id: true, code: true, name: true, currency: true } },
      },
    });

    return NextResponse.json({ data: availability }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products/[id]/availability error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PUT delegates to the same upsert logic as POST
  return POST(request, { params });
}
