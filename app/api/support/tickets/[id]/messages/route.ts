import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const msgSchema = z.object({
  body: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ticket = db.supportTickets.get(id);
    if (!ticket) return errorResponse(404, "NOT_FOUND", "Ticket not found");

    const body = await req.json();
    const data = msgSchema.parse(body);

    const msgId = `msg_${Date.now()}`;
    const newMsg = {
      id: msgId,
      ticketId: id,
      senderId: user.id,
      isAdmin: user.role === "admin",
      body: data.body,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
    };

    db.ticketMessages.set(msgId, newMsg);

    // Update ticket updated_at
    ticket.updatedAt = new Date().toISOString();
    db.supportTickets.set(id, ticket);

    return successResponse(newMsg);
  } catch (error) {
    return handleApiError(error);
  }
}

