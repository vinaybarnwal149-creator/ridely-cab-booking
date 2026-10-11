import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const evt = db.sosEvents.get(id);
    if (!evt) return errorResponse(404, "NOT_FOUND", "SOS event not found");

    evt.status = "resolved";
    evt.resolvedBy = user.id;
    evt.resolvedAt = new Date().toISOString();
    db.sosEvents.set(id, evt);

    return successResponse(evt);
  } catch (error) {
    return handleApiError(error);
  }
}

