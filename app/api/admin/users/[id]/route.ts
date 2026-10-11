import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const patchUserSchema = z.object({
  isSuspended: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const { id } = await params;
    const targetUser = db.profiles.get(id);
    if (!targetUser) return errorResponse(404, "NOT_FOUND", "User not found");

    const body = await req.json();
    const data = patchUserSchema.parse(body);

    targetUser.isSuspended = data.isSuspended;
    targetUser.updatedAt = new Date().toISOString();
    db.profiles.set(id, targetUser);

    return successResponse(targetUser);
  } catch (error) {
    return handleApiError(error);
  }
}

