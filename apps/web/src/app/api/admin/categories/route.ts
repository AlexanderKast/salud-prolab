import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { slugify } from "@salud-prolab/shared";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("categories:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const flat = searchParams.get("flat") === "true";
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    if (flat) {
      // Return flat list with pagination
      const page = Math.max(1, Number(searchParams.get("page")) || 1);
      const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.category.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          skip,
          take: limit,
          include: {
            parent: { select: { id: true, name: true, slug: true } },
            _count: { select: { products: true, children: true } },
          },
        }),
        prisma.category.count({ where }),
      ]);

      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Return tree structure (top-level categories with children)
    const data = await prisma.category.findMany({
      where: { ...where, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: active !== null && active !== undefined ? { active: active === "true" } : {},
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("categories:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

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

    // Verify parent exists if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Categoría padre no encontrada" }, { status: 404 });
      }
    }

    const category = await prisma.category.create({
      data,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/admin/categories error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese slug" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
