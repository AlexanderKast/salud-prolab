import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmAutomationSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:automations:read");
    if (permError) return permError;

    const { id } = await params;

    const automation = await prisma.crmAutomation.findUnique({
      where: { id },
      include: {
        pipeline: { select: { id: true, name: true, type: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: "Automatización no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: automation });
  } catch (err) {
    console.error("GET /api/crm/automations/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:automations:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmAutomation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Automatización no encontrada" }, { status: 404 });
    }

    const { triggerConfig, actionConfig, ...rest } = parsed.data;
    const automation = await prisma.crmAutomation.update({
      where: { id },
      data: {
        ...rest,
        ...(triggerConfig !== undefined && {
          triggerConfig: triggerConfig as Prisma.InputJsonValue,
        }),
        ...(actionConfig !== undefined && { actionConfig: actionConfig as Prisma.InputJsonValue }),
      },
      include: {
        pipeline: { select: { id: true, name: true, type: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: automation });
  } catch (err) {
    console.error("PATCH /api/crm/automations/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("crm:automations:write");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.crmAutomation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Automatización no encontrada" }, { status: 404 });
    }

    await prisma.crmAutomation.delete({ where: { id } });

    return NextResponse.json({ message: "Automatización eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/automations/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
