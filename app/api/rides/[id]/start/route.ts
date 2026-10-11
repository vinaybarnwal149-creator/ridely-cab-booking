import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { verifyOtp } from "@/lib/rides/otp";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const startSchema = z.object({
  otp: z.string().length(4),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    if (ride.status !== "arrived" && ride.status !== "accepted") {
      return errorResponse(409, "INVALID_TRANSITION", `Cannot start ride from status ${ride.status}`);
    }

    const body = await req.json();
    const { otp } = startSchema.parse(body);

    verifyOtp(otp, ride.otpCode, ride.otpAttempts);

    const updated = {
      ...ride,
      status: "in_progress" as const,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.rides.set(id, updated);

    // Notify rider
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: ride.riderId,
      type: "ride_started",
      title: "Ride in Progress!",
      body: "You are on the way to your destination. Stay safe!",
      data: { rideId: id },
      createdAt: new Date().toISOString(),
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

