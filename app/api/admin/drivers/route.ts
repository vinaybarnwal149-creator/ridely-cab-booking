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

    let drivers = Array.from(db.driverProfiles.values()).map((dp) => {
      const profile = db.profiles.get(dp.userId);
      return {
        ...dp,
        user: profile,
      };
    });

    if (status) {
      drivers = drivers.filter((d) => d.status === status);
    }

    return successResponse(drivers);
  } catch (error) {
    return handleApiError(error);
  }
}

