import { NextRequest, NextResponse } from "next/server";
import { handleResendWebhook } from "@/lib/crm/resend";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if secret is configured
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (env.RESEND_WEBHOOK_SECRET && (!svixId || !svixTimestamp || !svixSignature)) {
      return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
    }

    const body = await request.json();

    await handleResendWebhook(body);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Resend webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
