import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmPipelineSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const pipeline = await prisma.crmPipeline.findUnique({
      where: { id },
      include: {
        stages: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { leads: true, deals: true } },
          },
        },
        _count: { select: { leads: true, deals: true } },
      },
    });

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: pipeline });
  } catch (err) {
    console.error("GET /api/crm/pipelines/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmPipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmPipeline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pipeline no encontrado" }, { status: 404 });
    }

    const pipeline = await prisma.crmPipeline.update({
      where: { id },
      data: parsed.data,
      include: {
        stages: { where: { active: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { leads: true, deals: true } },
      },
    });

    return NextResponse.json({ data: pipeline });
  } catch (err) {
    console.error("PATCH /api/crm/pipelines/[id] error:", err);
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

    const existing = await prisma.crmPipeline.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leads: { where: { active: true } }, deals: { where: { active: true } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pipeline no encontrado" }, { status: 404 });
    }

    if (existing._count.leads > 0 || existing._count.deals > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un pipeline con leads o negocios activos" },
        { status: 400 }
      );
    }

    await prisma.crmPipeline.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Pipeline desactivado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/pipelines/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
