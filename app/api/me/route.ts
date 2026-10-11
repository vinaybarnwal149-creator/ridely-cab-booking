import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const patchProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  emailNotifications: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, "UNAUTHENTICATED", "Not signed in");
    }

    const driverProfile = user.role === "driver" ? db.driverProfiles.get(user.id) : undefined;

    // Check for active ride
    let activeRideId: string | undefined;
    for (const [, ride] of db.rides) {
      if (
        (ride.riderId === user.id || ride.driverId === user.id) &&
        ["requested", "accepted", "arrived", "in_progress"].includes(ride.status)
      ) {
        activeRideId = ride.id;
        break;
      }
    }

    // Unread notifications
    let unreadCount = 0;
    for (const [, notif] of db.notifications) {
      if (notif.userId === user.id && !notif.readAt) {
        unreadCount++;
      }
    }

    return successResponse({
      profile: user,
      driverProfile,
      activeRideId,
      unreadNotifications: unreadCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, "UNAUTHENTICATED", "Not signed in");
    }

    const body = await req.json();
    const data = patchProfileSchema.parse(body);

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    db.profiles.set(user.id, updated);

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

