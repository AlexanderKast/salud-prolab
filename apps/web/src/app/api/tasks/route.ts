import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createTaskSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("tasks:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedToId = searchParams.get("assignedToId") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ priority: "desc" }, { dueDate: { sort: "asc", nulls: "last" } }],
        skip,
        take: limit,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("tasks:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dueDate, ...restData } = parsed.data;
    const task = await prisma.task.create({
      data: {
        ...restData,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        createdById: session!.user!.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
