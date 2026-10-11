import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const offers = Array.from(db.rideOffers.values())
      .filter((o) => o.driverId === user.id && o.status === "pending")
      .map((o) => {
        const ride = db.rides.get(o.rideId);
        return {
          ...o,
          ride,
        };
      });

    return successResponse(offers);
  } catch (error) {
    return handleApiError(error);
  }
}

