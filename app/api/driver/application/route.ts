import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { DriverProfile } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const appSchema = z.object({
  rideTypeCode: z.string(),
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(2),
  vehicleYear: z.number().int().min(2005).max(2027),
  vehicleColor: z.string().min(2),
  vehiclePlate: z.string().min(4),
  licenseNumber: z.string().min(4),
  licenseExpiry: z.string(),
  licenseDocPath: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const driverProf = db.driverProfiles.get(user.id);
    return successResponse(driverProf || null);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const data = appSchema.parse(body);

    const existing = db.driverProfiles.get(user.id);

    const updated: DriverProfile = {
      ...(existing || {
        userId: user.id,
        isOnline: false,
        isBusy: false,
        avgRating: 5.0,
        ratingCount: 0,
        totalRides: 0,
        acceptanceRate: 100,
        createdAt: new Date().toISOString(),
      }),
      userId: user.id,
      status: "pending",
      rejectionReason: undefined,
      rideTypeCode: data.rideTypeCode,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      vehicleColor: data.vehicleColor,
      vehiclePlate: data.vehiclePlate,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      licenseDocPath: data.licenseDocPath,
      updatedAt: new Date().toISOString(),
    };

    db.driverProfiles.set(user.id, updated);

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

