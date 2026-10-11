import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json().catch(() => ({}));
    const ids: string[] | undefined = body.ids;

    for (const [id, notif] of db.notifications) {
      if (notif.userId === user.id) {
        if (!ids || ids.includes(id)) {
          notif.readAt = new Date().toISOString();
          db.notifications.set(id, notif);
        }
      }
    }

    return successResponse({ markedRead: true });
  } catch (error) {
    return handleApiError(error);
  }
}

