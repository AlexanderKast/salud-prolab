import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { moveCrmLeadSchema } from "@salud-prolab/shared";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = moveCrmLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmLead.findUnique({
      where: { id },
      include: { stage: { select: { id: true, name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    const targetStage = await prisma.crmPipelineStage.findUnique({
      where: { id: parsed.data.stageId },
    });

    if (!targetStage) {
      return NextResponse.json({ error: "Etapa destino no encontrada" }, { status: 404 });
    }

    const stageChanged = existing.stageId !== parsed.data.stageId;

    const lead = await prisma.crmLead.update({
      where: { id },
      data: {
        stageId: parsed.data.stageId,
        stageOrder: parsed.data.stageOrder,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, companyName: true } },
        stage: { select: { id: true, name: true, color: true } },
      },
    });

    // Log stage change as activity
    if (stageChanged) {
      await prisma.crmActivity.create({
        data: {
          type: "NOTA",
          subject: `Lead movido de "${existing.stage.name}" a "${targetStage.name}"`,
          leadId: id,
          contactId: existing.contactId,
          createdById: session!.user!.id,
        },
      });
    }

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error("PATCH /api/crm/leads/[id]/move error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
