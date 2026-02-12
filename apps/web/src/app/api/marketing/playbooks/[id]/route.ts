import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updatePlaybookSchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const playbook = await prisma.playbook.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!playbook) {
      return NextResponse.json({ error: "Playbook no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: playbook });
  } catch (err) {
    console.error("GET /api/marketing/playbooks/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("marketing:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePlaybookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Playbook no encontrado" }, { status: 404 });
    }

    const playbook = await prisma.playbook.update({
      where: { id },
      data: parsed.data,
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: playbook });
  } catch (err: unknown) {
    console.error("PATCH /api/marketing/playbooks/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un playbook con ese slug" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("marketing:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Playbook no encontrado" }, { status: 404 });
    }

    await prisma.playbook.delete({ where: { id } });

    return NextResponse.json({ message: "Playbook eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/marketing/playbooks/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
