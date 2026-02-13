import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmDealSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const deal = await prisma.crmDeal.findUnique({
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
        order: { select: { id: true, orderNumber: true, status: true, total: true } },
        fromLead: { select: { id: true, title: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: deal });
  } catch (err) {
    console.error("GET /api/crm/deals/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmDealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmDeal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(parsed.data.expectedCloseDate);
    }

    const deal = await prisma.crmDeal.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, companyName: true },
        },
        stage: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: deal });
  } catch (err) {
    console.error("PATCH /api/crm/deals/[id] error:", err);
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

    const existing = await prisma.crmDeal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    await prisma.crmDeal.update({ where: { id }, data: { active: false } });

    return NextResponse.json({ message: "Negocio desactivado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/deals/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
