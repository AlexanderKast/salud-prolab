import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { moveCrmDealSchema } from "@salud-prolab/shared";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = moveCrmDealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmDeal.findUnique({
      where: { id },
      include: { stage: { select: { id: true, name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const targetStage = await prisma.crmPipelineStage.findUnique({
      where: { id: parsed.data.stageId },
    });

    if (!targetStage) {
      return NextResponse.json({ error: "Etapa destino no encontrada" }, { status: 404 });
    }

    if (targetStage.isLost && !parsed.data.lostReason) {
      return NextResponse.json(
        { error: "Se requiere una razón de pérdida para esta etapa" },
        { status: 400 }
      );
    }

    const stageChanged = existing.stageId !== parsed.data.stageId;

    const updateData: Record<string, unknown> = {
      stageId: parsed.data.stageId,
      stageOrder: parsed.data.stageOrder,
    };

    if (targetStage.isWon) {
      updateData.closedAt = new Date();
      updateData.probability = 100;
    } else if (targetStage.isLost) {
      updateData.closedAt = new Date();
      updateData.probability = 0;
      updateData.lostReason = parsed.data.lostReason;
    }

    const deal = await prisma.crmDeal.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, companyName: true } },
        stage: { select: { id: true, name: true, color: true } },
      },
    });

    if (stageChanged) {
      await prisma.crmActivity.create({
        data: {
          type: "NOTA",
          subject: `Negocio movido de "${existing.stage.name}" a "${targetStage.name}"`,
          dealId: id,
          contactId: existing.contactId,
          createdById: session!.user!.id,
        },
      });
    }

    return NextResponse.json({ data: deal });
  } catch (err) {
    console.error("PATCH /api/crm/deals/[id]/move error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
