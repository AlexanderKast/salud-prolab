import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createCrmLeadSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");
    const pipelineId = searchParams.get("pipelineId");

    if (view === "kanban" && pipelineId) {
      const stages = await prisma.crmPipelineStage.findMany({
        where: { pipelineId, active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          leads: {
            where: { active: true, pipelineId },
            orderBy: { stageOrder: "asc" },
            include: {
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  companyName: true,
                },
              },
              assignedTo: { select: { id: true, name: true } },
            },
          },
          _count: { select: { leads: { where: { active: true } } } },
        },
      });

      return NextResponse.json({ data: { stages } });
    }

    // List mode
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;
    const stageId = searchParams.get("stageId") || undefined;
    const assignedToId = searchParams.get("assignedToId") || undefined;
    const source = searchParams.get("source") || undefined;

    const where: Record<string, unknown> = { active: true };
    if (pipelineId) where.pipelineId = pipelineId;
    if (stageId) where.stageId = stageId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { contact: { firstName: { contains: search, mode: "insensitive" } } },
        { contact: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.crmLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true, companyName: true },
          },
          stage: { select: { id: true, name: true, color: true } },
          pipeline: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      prisma.crmLead.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/leads error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const body = await request.json();
    const parsed = createCrmLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Auto-assign stageOrder
    const lastLead = await prisma.crmLead.findFirst({
      where: { stageId: parsed.data.stageId, active: true },
      orderBy: { stageOrder: "desc" },
      select: { stageOrder: true },
    });
    const stageOrder = (lastLead?.stageOrder ?? 0) + 1000;

    const { customFields, ...restData } = parsed.data;
    const lead = await prisma.crmLead.create({
      data: {
        ...restData,
        ...(customFields !== undefined && { customFields: customFields as Prisma.InputJsonValue }),
        stageOrder,
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, companyName: true },
        },
        stage: { select: { id: true, name: true, color: true } },
        pipeline: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/leads error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
