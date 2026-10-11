import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    let users = Array.from(db.profiles.values());
    if (roleFilter) {
      users = users.filter((u) => u.role === roleFilter);
    }

    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

