import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const driverProf = db.driverProfiles.get(user.id);
    const earnings = Array.from(db.driverEarnings.values()).filter(
      (e) => e.driverId === user.id
    );

    const grossPaise = earnings.reduce((acc, curr) => acc + curr.grossPaise, 0);
    const netPaise = earnings.reduce((acc, curr) => acc + curr.netPaise, 0);

    return successResponse({
      rides: earnings.length || driverProf?.totalRides || 0,
      grossPaise,
      netPaise,
      onlineMinutes: 240,
      acceptanceRate: driverProf?.acceptanceRate || 98.5,
      rating: driverProf?.avgRating || 4.9,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

