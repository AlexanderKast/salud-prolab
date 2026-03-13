import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { createMessageSchema } from "@salud-prolab/shared";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("conversations:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = createMessageSchema.safeParse({ ...body, conversationId: id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { metadata, ...restData } = parsed.data;
    const message = await prisma.message.create({
      data: {
        ...restData,
        ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
        sentAt: new Date(),
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/conversations/[id]/messages error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
