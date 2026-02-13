import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const reorderSchema = z.object({
  stageIds: z.array(z.string()).min(1, "Al menos una etapa requerida"),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

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

    await prisma.$transaction(
      parsed.data.stageIds.map((stageId, index) =>
        prisma.crmPipelineStage.update({
          where: { id: stageId },
          data: { sortOrder: index },
        })
      )
    );

    const stages = await prisma.crmPipelineStage.findMany({
      where: { pipelineId: id, active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { leads: true, deals: true } } },
    });

    return NextResponse.json({ data: stages });
  } catch (err) {
    console.error("PATCH /api/crm/pipelines/[id]/stages/reorder error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
