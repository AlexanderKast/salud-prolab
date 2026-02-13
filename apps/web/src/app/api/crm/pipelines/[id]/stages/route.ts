import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createCrmPipelineStageSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const stages = await prisma.crmPipelineStage.findMany({
      where: { pipelineId: id, active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data: stages });
  } catch (err) {
    console.error("GET /api/crm/pipelines/[id]/stages error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = createCrmPipelineStageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const pipeline = await prisma.crmPipeline.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline no encontrado" }, { status: 404 });
    }

    // Auto-assign sortOrder if not provided or 0
    let sortOrder = parsed.data.sortOrder;
    if (sortOrder === 0) {
      const lastStage = await prisma.crmPipelineStage.findFirst({
        where: { pipelineId: id, active: true },
        orderBy: { sortOrder: "desc" },
      });
      sortOrder = (lastStage?.sortOrder ?? -1) + 1;
    }

    const stage = await prisma.crmPipelineStage.create({
      data: {
        ...parsed.data,
        sortOrder,
        pipelineId: id,
      },
      include: {
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data: stage }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/pipelines/[id]/stages error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
