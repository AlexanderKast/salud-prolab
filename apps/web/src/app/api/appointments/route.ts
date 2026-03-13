import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createAppointmentSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("appointments:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;
    const assignedToId = searchParams.get("assignedToId") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (from || to) {
      where.startAt = {};
      if (from) (where.startAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.startAt as Record<string, unknown>).lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { startAt: "asc" },
        skip,
        take: limit,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("appointments:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { startAt, endAt, ...restData } = parsed.data;
    const appointment = await prisma.appointment.create({
      data: {
        ...restData,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        createdById: session!.user!.id,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/appointments error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
