import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Ridely API",
    time: new Date().toISOString(),
  });
}

