import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updatePlaybookSectionSchema } from "@salud-prolab/shared";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const permError = await requirePermission("marketing:write");
    if (permError) return permError;

    const { id, sectionId } = await params;
    const body = await request.json();
    const parsed = updatePlaybookSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify section belongs to this playbook
    const existing = await prisma.playbookSection.findFirst({
      where: { id: sectionId, playbookId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
    }

    const section = await prisma.playbookSection.update({
      where: { id: sectionId },
      data: parsed.data,
    });

    return NextResponse.json({ data: section });
  } catch (err) {
    console.error("PATCH /api/marketing/playbooks/[id]/sections/[sectionId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const permError = await requirePermission("marketing:delete");
    if (permError) return permError;

    const { id, sectionId } = await params;

    // Verify section belongs to this playbook
    const existing = await prisma.playbookSection.findFirst({
      where: { id: sectionId, playbookId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
    }

    await prisma.playbookSection.delete({ where: { id: sectionId } });

    return NextResponse.json({ message: "Sección eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/marketing/playbooks/[id]/sections/[sectionId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
