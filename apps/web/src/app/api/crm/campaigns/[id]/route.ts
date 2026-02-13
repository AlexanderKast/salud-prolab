import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmCampaignSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:campaigns:read");
    if (permError) return permError;

    const { id } = await params;

    const campaign = await prisma.crmEmailCampaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
        recipients: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            openedAt: true,
            clickedAt: true,
            bouncedAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { recipients: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: campaign });
  } catch (err) {
    console.error("GET /api/crm/campaigns/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:campaigns:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmEmailCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (existing.status !== "BORRADOR") {
      return NextResponse.json(
        { error: "Solo se pueden editar campañas en estado borrador" },
        { status: 400 }
      );
    }

    const campaign = await prisma.crmEmailCampaign.update({
      where: { id },
      data: {
        ...parsed.data,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
    });

    return NextResponse.json({ data: campaign });
  } catch (err) {
    console.error("PATCH /api/crm/campaigns/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("crm:campaigns:write");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.crmEmailCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (existing.status !== "BORRADOR") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar campañas en estado borrador" },
        { status: 400 }
      );
    }

    await prisma.crmEmailCampaign.delete({ where: { id } });

    return NextResponse.json({ message: "Campaña eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/campaigns/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
