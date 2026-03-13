import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createTagSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("tags:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    const data = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/tags error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("tags:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const slug = parsed.data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const tag = await prisma.tag.create({
      data: { ...parsed.data, slug },
    });

    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/tags error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe un tag con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
