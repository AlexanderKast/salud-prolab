import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmLeadSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const lead = await prisma.crmLead.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            whatsapp: true,
            companyName: true,
          },
        },
        stage: { select: { id: true, name: true, color: true, isWon: true, isLost: true } },
        pipeline: { select: { id: true, name: true, type: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        convertedDeal: { select: { id: true, title: true, value: true, currency: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error("GET /api/crm/leads/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmLead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    const { customFields, ...rest } = parsed.data;
    const lead = await prisma.crmLead.update({
      where: { id },
      data: {
        ...rest,
        ...(customFields !== undefined && { customFields: customFields as Prisma.InputJsonValue }),
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, companyName: true },
        },
        stage: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error("PATCH /api/crm/leads/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("crm:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.crmLead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    await prisma.crmLead.update({ where: { id }, data: { active: false } });

    return NextResponse.json({ message: "Lead desactivado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/leads/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
