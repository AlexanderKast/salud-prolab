import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { slugify } from "@salud-prolab/shared";
import { z } from "zod";

const createSupplierSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  contactName: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().nullable(),
  country: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

const updateSupplierSchema = createSupplierSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("suppliers:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.supplier.count({ where }),
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
    console.error("GET /api/admin/suppliers error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("suppliers:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      slug: parsed.data.slug || slugify(parsed.data.name),
    };

    const supplier = await prisma.supplier.create({
      data,
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/admin/suppliers error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un proveedor con ese slug" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
