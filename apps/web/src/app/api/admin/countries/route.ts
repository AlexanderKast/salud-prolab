import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const createCountrySchema = z.object({
  code: z.string().min(2).max(3).toUpperCase(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  currency: z.enum(["COP", "USD"]).default("COP"),
  taxRate: z.number().min(0).max(1).default(0),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("countries:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.country.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        include: {
          _count: { select: { availability: true } },
        },
      }),
      prisma.country.count({ where }),
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
    console.error("GET /api/admin/countries error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("countries:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createCountrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: parsed.data,
    });

    return NextResponse.json({ data: country }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/admin/countries error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un país con ese código" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
