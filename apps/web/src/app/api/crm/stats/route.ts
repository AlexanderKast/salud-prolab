import { NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalContacts,
      newContactsThisMonth,
      totalLeads,
      totalDeals,
      wonDealsThisMonth,
      lostDealsThisMonth,
      pipelineValue,
      activeCampaigns,
    ] = await Promise.all([
      prisma.crmContact.count({ where: { active: true } }),
      prisma.crmContact.count({ where: { active: true, createdAt: { gte: startOfMonth } } }),
      prisma.crmLead.count({ where: { active: true } }),
      prisma.crmDeal.count({ where: { active: true } }),
      prisma.crmDeal.count({
        where: {
          active: true,
          closedAt: { gte: startOfMonth },
          stage: { isWon: true },
        },
      }),
      prisma.crmDeal.count({
        where: {
          active: true,
          closedAt: { gte: startOfMonth },
          stage: { isLost: true },
        },
      }),
      prisma.crmDeal.aggregate({
        where: { active: true, closedAt: null },
        _sum: { value: true },
      }),
      prisma.crmEmailCampaign.count({
        where: { status: { in: ["ENVIANDO", "PROGRAMADA"] } },
      }),
    ]);

    return NextResponse.json({
      data: {
        totalContacts,
        newContactsThisMonth,
        totalLeads,
        totalDeals,
        wonDealsThisMonth,
        lostDealsThisMonth,
        pipelineValue: pipelineValue._sum.value || 0,
        activeCampaigns,
      },
    });
  } catch (err) {
    console.error("GET /api/crm/stats error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
