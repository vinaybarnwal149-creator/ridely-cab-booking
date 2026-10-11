import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { SupportTicket, TicketCategory } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const ticketSchema = z.object({
  category: z.enum([
    "payment",
    "lost_item",
    "driver_behaviour",
    "ride_issue",
    "app_bug",
    "other",
  ]),
  subject: z.string().min(3),
  description: z.string().min(10),
  rideId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const tickets = Array.from(db.supportTickets.values())
      .filter((t) => (user.role === "admin" ? true : t.userId === user.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(tickets);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const data = ticketSchema.parse(body);

    const ticketId = `tkt_${Date.now()}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user.id,
      category: data.category as TicketCategory,
      subject: data.subject,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    db.supportTickets.set(ticketId, newTicket);

    // Initial message
    const msgId = `msg_${Date.now()}`;
    db.ticketMessages.set(msgId, {
      id: msgId,
      ticketId,
      senderId: user.id,
      isAdmin: false,
      body: data.description,
      attachments: [],
      createdAt: new Date().toISOString(),
    });

    return successResponse(newTicket);
  } catch (error) {
    return handleApiError(error);
  }
}

