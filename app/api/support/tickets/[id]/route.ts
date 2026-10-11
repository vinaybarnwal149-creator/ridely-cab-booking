import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ticket = db.supportTickets.get(id);
    if (!ticket) return errorResponse(404, "NOT_FOUND", "Ticket not found");

    const messages = Array.from(db.ticketMessages.values())
      .filter((m) => m.ticketId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return successResponse({
      ...ticket,
      messages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

