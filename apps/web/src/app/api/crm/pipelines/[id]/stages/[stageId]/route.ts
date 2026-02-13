import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmPipelineStageSchema } from "@salud-prolab/shared";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id, stageId } = await params;
    const body = await request.json();
    const parsed = updateCrmPipelineStageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmPipelineStage.findFirst({
      where: { id: stageId, pipelineId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 });
    }

    const stage = await prisma.crmPipelineStage.update({
      where: { id: stageId },
      data: parsed.data,
      include: {
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data: stage });
  } catch (err) {
    console.error("PATCH /api/crm/pipelines/[id]/stages/[stageId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const permError = await requirePermission("crm:delete");
    if (permError) return permError;

    const { id, stageId } = await params;

    const existing = await prisma.crmPipelineStage.findFirst({
      where: { id: stageId, pipelineId: id },
      include: {
        _count: {
          select: { leads: { where: { active: true } }, deals: { where: { active: true } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 });
    }

    if (existing._count.leads > 0 || existing._count.deals > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una etapa con leads o negocios activos. Muévalos primero." },
        { status: 400 }
      );
    }

    await prisma.crmPipelineStage.update({
      where: { id: stageId },
      data: { active: false },
    });

    return NextResponse.json({ message: "Etapa desactivada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/pipelines/[id]/stages/[stageId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
