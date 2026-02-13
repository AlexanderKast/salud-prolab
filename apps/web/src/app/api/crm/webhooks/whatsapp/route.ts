import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook, validateWebhookSignature, handleIncomingWebhook } from "@/lib/crm/whatsapp";

// GET - Webhook verification (Meta subscription setup)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifyWebhook(mode, token, challenge);

  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST - Incoming webhook events
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Validate signature
    const isValid = await validateWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("WhatsApp webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    await handleIncomingWebhook(payload);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
