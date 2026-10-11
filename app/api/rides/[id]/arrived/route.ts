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
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    if (ride.status !== "accepted") {
      return errorResponse(409, "INVALID_TRANSITION", `Cannot mark arrived from status ${ride.status}`);
    }

    const updated = {
      ...ride,
      status: "arrived" as const,
      arrivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.rides.set(id, updated);

    // Notify rider
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: ride.riderId,
      type: "driver_arrived",
      title: "Driver Has Arrived!",
      body: "Your cab has arrived at the pickup spot. Please board and provide your 4-digit OTP.",
      data: { rideId: id },
      createdAt: new Date().toISOString(),
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

