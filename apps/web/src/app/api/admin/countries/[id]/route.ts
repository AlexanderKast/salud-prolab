import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const updateCountrySchema = z.object({
  code: z.string().min(2).max(3).toUpperCase().optional(),
  name: z.string().min(2).max(100).optional(),
  currency: z.enum(["COP", "USD"]).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("countries:read");
    if (permError) return permError;

    const { id } = await params;

    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        availability: {
          include: {
            product: { select: { id: true, name: true, slug: true, sku: true } },
          },
          take: 50,
        },
        _count: { select: { availability: true, priceRules: true } },
      },
    });

    if (!country) {
      return NextResponse.json({ error: "País no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: country });
  } catch (err) {
    console.error("GET /api/admin/countries/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("countries:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCountrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "País no encontrado" }, { status: 404 });
    }

    const country = await prisma.country.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: country });
  } catch (err: unknown) {
    console.error("PATCH /api/admin/countries/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un país con ese código" },
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
    const permError = await requirePermission("countries:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.country.findUnique({
      where: { id },
      include: { _count: { select: { availability: true, priceRules: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "País no encontrado" }, { status: 404 });
    }

    if (existing._count.availability > 0 || existing._count.priceRules > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un país con disponibilidad de productos o reglas de precio asociadas. Desactívelo en su lugar." },
        { status: 400 }
      );
    }

    await prisma.country.delete({ where: { id } });

    return NextResponse.json({ message: "País eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/admin/countries/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
