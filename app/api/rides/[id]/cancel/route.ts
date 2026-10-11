import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
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

    if (["completed", "cancelled", "expired"].includes(ride.status)) {
      return errorResponse(409, "INVALID_TRANSITION", `Ride is already ${ride.status}`);
    }

    const body = await req.json().catch(() => ({}));
    const { reason } = cancelSchema.parse(body);

    let feePaise = 0;
    // Cancellation fee rule: if rider cancels after accepted
    if (user.role === "rider" && ["accepted", "arrived"].includes(ride.status)) {
      feePaise = 3000; // ₹30 fee
    }

    // Free driver if assigned
    if (ride.driverId) {
      const driverProf = db.driverProfiles.get(ride.driverId);
      if (driverProf) {
        driverProf.isBusy = false;
        db.driverProfiles.set(ride.driverId, driverProf);
      }
    }

    const updated = {
      ...ride,
      status: "cancelled" as const,
      cancelledBy: user.role,
      cancelReason: reason || "Cancelled by user",
      cancellationFeePaise: feePaise,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.rides.set(id, updated);

    return successResponse({
      ride: updated,
      cancellationFeePaise: feePaise,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

