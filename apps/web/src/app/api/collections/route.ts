import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth } from "@/lib/rbac";
import { createCollectionSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    const where = { userId: session!.user.id };

    const [data, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } },
        },
      }),
      prisma.collection.count({ where }),
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
    console.error("GET /api/collections error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        ...parsed.data,
        userId: session!.user.id,
      },
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ data: collection }, { status: 201 });
  } catch (err) {
    console.error("POST /api/collections error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
