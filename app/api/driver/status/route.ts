import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const statusSchema = z.object({
  online: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const { online, lat, lng } = statusSchema.parse(body);

    const driverProf = db.driverProfiles.get(user.id);
    if (!driverProf) {
      return errorResponse(404, "NOT_FOUND", "Driver profile not found");
    }

    if (!online && driverProf.isBusy) {
      return errorResponse(409, "DRIVER_BUSY", "Cannot go offline while on an active ride");
    }

    driverProf.isOnline = online;
    if (lat !== undefined && lng !== undefined) {
      driverProf.currentLat = lat;
      driverProf.currentLng = lng;
    }
    driverProf.locationUpdatedAt = new Date().toISOString();
    driverProf.updatedAt = new Date().toISOString();

    db.driverProfiles.set(user.id, driverProf);

    return successResponse(driverProf);
  } catch (error) {
    return handleApiError(error);
  }
}

