import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createCrmPipelineSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const data = await prisma.crmPipeline.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        stages: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/crm/pipelines error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createCrmPipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if there's already a default pipeline for this type
    const existingDefault = await prisma.crmPipeline.findFirst({
      where: { type: parsed.data.type, isDefault: true, active: true },
    });

    const defaultStages =
      parsed.data.type === "LEADS"
        ? [
            { name: "Nuevo", color: "#6B7280", sortOrder: 0 },
            { name: "Contactado", color: "#3B82F6", sortOrder: 1 },
            { name: "Calificado", color: "#8B5CF6", sortOrder: 2 },
            { name: "Propuesta", color: "#F59E0B", sortOrder: 3 },
            { name: "Convertido", color: "#10B981", sortOrder: 4, isWon: true },
            { name: "Descartado", color: "#EF4444", sortOrder: 5, isLost: true },
          ]
        : [
            { name: "Prospecto", color: "#6B7280", sortOrder: 0 },
            { name: "Negociación", color: "#3B82F6", sortOrder: 1 },
            { name: "Propuesta Enviada", color: "#8B5CF6", sortOrder: 2 },
            { name: "Revisión", color: "#F59E0B", sortOrder: 3 },
            { name: "Ganado", color: "#10B981", sortOrder: 4, isWon: true },
            { name: "Perdido", color: "#EF4444", sortOrder: 5, isLost: true },
          ];

    const pipeline = await prisma.crmPipeline.create({
      data: {
        ...parsed.data,
        isDefault: !existingDefault,
        stages: { create: defaultStages },
      },
      include: {
        stages: { orderBy: { sortOrder: "asc" } },
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data: pipeline }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/pipelines error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
