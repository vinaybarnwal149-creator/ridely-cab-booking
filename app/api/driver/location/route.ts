import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  rideId: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const data = locationSchema.parse(body);

    const driverProf = db.driverProfiles.get(user.id);
    if (!driverProf) {
      return errorResponse(404, "NOT_FOUND", "Driver profile not found");
    }

    driverProf.currentLat = data.lat;
    driverProf.currentLng = data.lng;
    if (data.heading !== undefined) driverProf.heading = data.heading;
    driverProf.locationUpdatedAt = new Date().toISOString();

    db.driverProfiles.set(user.id, driverProf);

    return successResponse({ updated: true, lat: data.lat, lng: data.lng });
  } catch (error) {
    return handleApiError(error);
  }
}

