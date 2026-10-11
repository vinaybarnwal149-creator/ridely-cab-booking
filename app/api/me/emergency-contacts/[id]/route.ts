import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const contact = db.emergencyContacts.get(id);
    if (!contact || contact.userId !== user.id) {
      return errorResponse(404, "NOT_FOUND", "Emergency contact not found");
    }

    db.emergencyContacts.delete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

