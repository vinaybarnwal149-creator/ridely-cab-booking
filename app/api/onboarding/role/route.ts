import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["rider", "driver"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const { role } = roleSchema.parse(body);

    const updated = {
      ...user,
      role,
      updatedAt: new Date().toISOString(),
    };
    db.profiles.set(user.id, updated);

    if (role === "driver" && !db.driverProfiles.has(user.id)) {
      db.driverProfiles.set(user.id, {
        userId: user.id,
        status: "pending",
        isOnline: false,
        isBusy: false,
        avgRating: 0,
        ratingCount: 0,
        totalRides: 0,
        acceptanceRate: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return successResponse({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

