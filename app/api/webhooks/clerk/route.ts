import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    return NextResponse.json({ received: true, size: rawBody.length });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

