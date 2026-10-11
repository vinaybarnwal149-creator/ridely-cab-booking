import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    // Populate driver info if assigned
    if (ride.driverId) {
      const driverUser = db.profiles.get(ride.driverId);
      const driverProf = db.driverProfiles.get(ride.driverId);
      if (driverUser && driverProf) {
        ride.driver = {
          name: driverUser.fullName,
          avatarUrl: driverUser.avatarUrl,
          avgRating: driverProf.avgRating,
          ratingCount: driverProf.ratingCount,
          vehicleMake: driverProf.vehicleMake,
          vehicleModel: driverProf.vehicleModel,
          vehicleColor: driverProf.vehicleColor,
          vehiclePlate: driverProf.vehiclePlate,
          phone: driverUser.phone,
          currentLat: driverProf.currentLat,
          currentLng: driverProf.currentLng,
        };
      }
    }

    // Mask OTP for drivers (drivers must enter OTP given by the rider)
    if (user.role === "driver" && ride.driverId === user.id) {
      return successResponse({
        ...ride,
        otpCode: "****",
      });
    }

    return successResponse(ride);
  } catch (error) {
    return handleApiError(error);
  }
}

