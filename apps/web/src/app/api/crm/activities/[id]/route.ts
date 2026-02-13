import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmActivitySchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const activity = await prisma.crmActivity.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("GET /api/crm/activities/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmActivitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmActivity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    const activity = await prisma.crmActivity.update({
      where: { id },
      data: {
        ...parsed.data,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("PATCH /api/crm/activities/[id] error:", err);
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

    const existing = await prisma.crmActivity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    await prisma.crmActivity.delete({ where: { id } });

    return NextResponse.json({ message: "Actividad eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/activities/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
