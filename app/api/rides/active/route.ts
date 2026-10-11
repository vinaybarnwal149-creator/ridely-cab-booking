import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    for (const [, ride] of db.rides) {
      if (
        (ride.riderId === user.id || ride.driverId === user.id) &&
        ["requested", "accepted", "arrived", "in_progress"].includes(ride.status)
      ) {
        return successResponse(ride);
      }
    }

    return successResponse(null);
  } catch (error) {
    return handleApiError(error);
  }
}

