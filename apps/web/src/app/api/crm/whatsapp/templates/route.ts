import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { fetchTemplates } from "@/lib/crm/whatsapp";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const permError = await requirePermission("crm:whatsapp:read");
    if (permError) return permError;

    // Fetch from Meta Cloud API if configured
    if (env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      const templates = await fetchTemplates();
      return NextResponse.json({ data: templates });
    }

    // Fallback: placeholder templates for development
    const templates = [
      {
        name: "bienvenida",
        language: "es",
        status: "APPROVED",
        category: "MARKETING",
      },
      {
        name: "seguimiento",
        language: "es",
        status: "APPROVED",
        category: "MARKETING",
      },
      {
        name: "oferta_especial",
        language: "es",
        status: "APPROVED",
        category: "MARKETING",
      },
    ];

    return NextResponse.json({ data: templates });
  } catch (err) {
    console.error("GET /api/crm/whatsapp/templates error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
