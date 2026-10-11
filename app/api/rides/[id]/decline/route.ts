import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    for (const [offerId, offer] of db.rideOffers) {
      if (offer.rideId === id && offer.driverId === user.id) {
        offer.status = "declined";
        offer.respondedAt = new Date().toISOString();
        db.rideOffers.set(offerId, offer);
      }
    }

    return successResponse({ declined: true });
  } catch (error) {
    return handleApiError(error);
  }
}

