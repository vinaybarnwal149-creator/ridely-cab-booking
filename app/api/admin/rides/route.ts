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
    const status = searchParams.get("status");

    let allRides = Array.from(db.rides.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (status) {
      allRides = allRides.filter((r) => r.status === status);
    }

    return successResponse(allRides);
  } catch (error) {
    return handleApiError(error);
  }
}

