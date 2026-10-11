import { NextRequest } from "next/server";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    let sosEvent = null;
    for (const [, evt] of db.sosEvents) {
      if (evt.publicToken === token) {
        sosEvent = evt;
        break;
      }
    }

    if (!sosEvent) {
      return errorResponse(404, "NOT_FOUND", "SOS tracking link is invalid or expired");
    }

    if (new Date(sosEvent.tokenExpiresAt).getTime() < Date.now()) {
      return errorResponse(410, "EXPIRED", "This SOS emergency link has expired");
    }

    const ride = db.rides.get(sosEvent.rideId);
    const rider = db.profiles.get(sosEvent.riderId);
    const driver = ride?.driverId ? db.profiles.get(ride.driverId) : undefined;
    const driverProf = ride?.driverId ? db.driverProfiles.get(ride.driverId) : undefined;

    return successResponse({
      sosStatus: sosEvent.status,
      riderFirstName: rider?.fullName.split(" ")[0] || "Rider",
      rideStatus: ride?.status,
      pickupAddress: ride?.pickupAddress,
      dropoffAddress: ride?.dropoffAddress,
      routePolyline: ride?.routePolyline,
      driverName: driver?.fullName,
      vehicleMake: driverProf?.vehicleMake,
      vehicleModel: driverProf?.vehicleModel,
      vehiclePlate: driverProf?.vehiclePlate,
      vehicleColor: driverProf?.vehicleColor,
      currentLat: driverProf?.currentLat || ride?.pickupLat,
      currentLng: driverProf?.currentLng || ride?.pickupLng,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

