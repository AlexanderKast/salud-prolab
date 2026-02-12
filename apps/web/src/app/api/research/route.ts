import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { createResearchNoteSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;

    const [data, total] = await Promise.all([
      prisma.researchNote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          _count: { select: { benchmarks: true } },
        },
      }),
      prisma.researchNote.count({ where }),
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
    console.error("GET /api/research error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("research:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createResearchNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const note = await prisma.researchNote.create({
      data: parsed.data,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        _count: { select: { benchmarks: true } },
      },
    });

    return NextResponse.json({ data: note }, { status: 201 });
  } catch (err) {
    console.error("POST /api/research error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
