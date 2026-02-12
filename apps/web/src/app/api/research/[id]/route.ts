import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateResearchNoteSchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const note = await prisma.researchNote.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        benchmarks: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Nota de investigación no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: note });
  } catch (err) {
    console.error("GET /api/research/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("research:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateResearchNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.researchNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Nota de investigación no encontrada" }, { status: 404 });
    }

    const note = await prisma.researchNote.update({
      where: { id },
      data: parsed.data,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        _count: { select: { benchmarks: true } },
      },
    });

    return NextResponse.json({ data: note });
  } catch (err) {
    console.error("PATCH /api/research/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("research:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.researchNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Nota de investigación no encontrada" }, { status: 404 });
    }

    await prisma.researchNote.delete({ where: { id } });

    return NextResponse.json({ message: "Nota eliminada exitosamente" });
  } catch (err) {
    console.error("DELETE /api/research/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
