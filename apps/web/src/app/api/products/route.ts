import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { productFiltersSchema, createProductSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);

    const rawFilters = {
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      supplierId: searchParams.get("supplierId") || undefined,
      status: searchParams.get("status") || undefined,
      country: searchParams.get("country") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    };

    const parsed = productFiltersSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Filtros inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const filters = parsed.data;
    const { page, limit, sortBy, sortOrder, search, categoryId, supplierId, status, country, minPrice, maxPrice, tags } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { search: search.split(" ").join(" & ") } },
        { description: { search: search.split(" ").join(" & ") } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) (where.basePrice as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.basePrice as Record<string, unknown>).lte = maxPrice;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (country) {
      where.availability = {
        some: {
          country: { code: country },
          available: true,
        },
      };
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    if (sortBy === "price") {
      orderBy.basePrice = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          supplier: { select: { id: true, name: true, slug: true } },
          _count: { select: { variants: true, assets: true, availability: true } },
        },
      }),
      prisma.product.count({ where }),
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
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("products:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        supplier: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/products error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug o SKU" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
