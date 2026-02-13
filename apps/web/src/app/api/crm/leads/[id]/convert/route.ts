import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { convertCrmLeadSchema } from "@salud-prolab/shared";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = convertCrmLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id },
      include: { contact: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    if (lead.convertedDealId) {
      return NextResponse.json({ error: "Este lead ya fue convertido a negocio" }, { status: 400 });
    }

    // Auto-assign stageOrder for the deal
    const lastDeal = await prisma.crmDeal.findFirst({
      where: { stageId: parsed.data.dealStageId, active: true },
      orderBy: { stageOrder: "desc" },
      select: { stageOrder: true },
    });
    const stageOrder = (lastDeal?.stageOrder ?? 0) + 1000;

    const result = await prisma.$transaction(async (tx) => {
      const deal = await tx.crmDeal.create({
        data: {
          title: lead.title,
          description: lead.description,
          pipelineId: parsed.data.dealPipelineId,
          stageId: parsed.data.dealStageId,
          stageOrder,
          value: parsed.data.value,
          currency: parsed.data.currency,
          contactId: lead.contactId,
          assignedToId: lead.assignedToId,
          tags: lead.tags,
        },
      });

      const updatedLead = await tx.crmLead.update({
        where: { id },
        data: {
          convertedAt: new Date(),
          convertedDealId: deal.id,
        },
      });

      await tx.crmActivity.create({
        data: {
          type: "NOTA",
          subject: `Lead convertido a negocio: ${deal.title}`,
          leadId: id,
          dealId: deal.id,
          contactId: lead.contactId,
          createdById: session!.user!.id,
        },
      });

      return { lead: updatedLead, deal };
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/leads/[id]/convert error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
