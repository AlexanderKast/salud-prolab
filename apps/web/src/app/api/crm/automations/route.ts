import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createCrmAutomationSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:automations:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.crmAutomation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          pipeline: { select: { id: true, name: true, type: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.crmAutomation.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/automations error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:automations:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createCrmAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { triggerConfig, actionConfig, ...rest } = parsed.data;
    const automation = await prisma.crmAutomation.create({
      data: {
        ...rest,
        ...(triggerConfig !== undefined && {
          triggerConfig: triggerConfig as Prisma.InputJsonValue,
        }),
        ...(actionConfig !== undefined && { actionConfig: actionConfig as Prisma.InputJsonValue }),
        createdById: session!.user!.id,
      },
      include: {
        pipeline: { select: { id: true, name: true, type: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: automation }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/automations error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
