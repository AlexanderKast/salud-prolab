import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("audit:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const type = searchParams.get("type") || undefined;
    const processed = searchParams.get("processed");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (processed !== null && processed !== undefined) {
      where.processed = processed === "true";
    }

    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("audit:read");
    if (permError) return permError;

    const body = await request.json();
    const { type, payload } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Tipo de evento requerido" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: { type, payload },
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
