import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createDistributorSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("distributors:read");
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
        { companyName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { taxId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.distributor.findMany({
        where,
        orderBy: { companyName: "asc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      prisma.distributor.count({ where }),
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
    console.error("GET /api/distributors error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("distributors:write");
    if (permError) return permError;

    // Get current user session to link distributor
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createDistributorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const distributor = await prisma.distributor.create({
      data: {
        ...parsed.data,
        userId: session!.user!.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ data: distributor }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/distributors error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un distribuidor con esos datos" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
