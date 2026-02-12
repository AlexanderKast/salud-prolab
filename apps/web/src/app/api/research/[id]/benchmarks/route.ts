import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { createBenchmarkSchema } from "@salud-prolab/shared";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const note = await prisma.researchNote.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ error: "Nota de investigación no encontrada" }, { status: 404 });
    }

    const benchmarks = await prisma.competitorBenchmark.findMany({
      where: { researchNoteId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: benchmarks });
  } catch (err) {
    console.error("GET /api/research/[id]/benchmarks error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("research:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();

    // Support _method: DELETE for deleting a benchmark
    if (body._method === "DELETE") {
      return handleDeleteBenchmark(id, body.benchmarkId);
    }

    const parsed = createBenchmarkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const note = await prisma.researchNote.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ error: "Nota de investigación no encontrada" }, { status: 404 });
    }

    const benchmark = await prisma.competitorBenchmark.create({
      data: {
        ...parsed.data,
        researchNoteId: id,
      },
    });

    return NextResponse.json({ data: benchmark }, { status: 201 });
  } catch (err) {
    console.error("POST /api/research/[id]/benchmarks error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

async function handleDeleteBenchmark(noteId: string, benchmarkId: unknown) {
  try {
    const idSchema = z.string().cuid();
    const parsed = idSchema.safeParse(benchmarkId);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "benchmarkId inválido" },
        { status: 400 }
      );
    }

    const benchmark = await prisma.competitorBenchmark.findFirst({
      where: { id: parsed.data, researchNoteId: noteId },
    });

    if (!benchmark) {
      return NextResponse.json({ error: "Benchmark no encontrado" }, { status: 404 });
    }

    await prisma.competitorBenchmark.delete({ where: { id: parsed.data } });

    return NextResponse.json({ message: "Benchmark eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE benchmark error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
