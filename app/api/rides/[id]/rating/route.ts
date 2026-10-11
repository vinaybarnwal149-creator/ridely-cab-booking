import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { Rating } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional(),
  comment: z.string().max(500).optional(),
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

    if (ride.status !== "completed") {
      return errorResponse(409, "INVALID_STATE", "Only completed rides can be rated");
    }

    const body = await req.json();
    const data = ratingSchema.parse(body);

    const rateeId = user.role === "rider" ? (ride.driverId || "") : ride.riderId;

    const ratingId = `rate_${Date.now()}`;
    const newRating: Rating = {
      id: ratingId,
      rideId: id,
      raterId: user.id,
      rateeId,
      raterRole: user.role,
      stars: data.stars,
      tags: data.tags || [],
      comment: data.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.ratings.set(ratingId, newRating);

    // Update driver rating stats
    if (user.role === "rider" && ride.driverId) {
      const driverProf = db.driverProfiles.get(ride.driverId);
      if (driverProf) {
        const currentTotal = driverProf.avgRating * driverProf.ratingCount;
        const newCount = driverProf.ratingCount + 1;
        const newAvg = (currentTotal + data.stars) / newCount;
        driverProf.avgRating = parseFloat(newAvg.toFixed(2));
        driverProf.ratingCount = newCount;
        db.driverProfiles.set(ride.driverId, driverProf);
      }
    }

    return successResponse(newRating);
  } catch (error) {
    return handleApiError(error);
  }
}

