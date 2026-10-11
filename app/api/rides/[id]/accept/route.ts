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
    if (user.role !== "driver" && user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Only drivers can accept rides");
    }

    const { id } = await params;
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    if (ride.status !== "requested") {
      return errorResponse(409, "RIDE_UNAVAILABLE", "Ride is no longer available");
    }

    const driverProf = db.driverProfiles.get(user.id);
    if (driverProf) {
      driverProf.isBusy = true;
      db.driverProfiles.set(user.id, driverProf);
    }

    const updated = {
      ...ride,
      driverId: user.id,
      status: "accepted" as const,
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.rides.set(id, updated);

    // Notify rider
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: ride.riderId,
      type: "ride_accepted",
      title: "Driver Accepted Your Ride!",
      body: `${user.fullName} is arriving in ~3 mins. Share OTP when you board.`,
      data: { rideId: id },
      createdAt: new Date().toISOString(),
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

