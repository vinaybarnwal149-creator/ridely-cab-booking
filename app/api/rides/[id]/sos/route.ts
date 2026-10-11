import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { SosEvent } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    const userContacts = Array.from(db.emergencyContacts.values()).filter(
      (c) => c.userId === user.id
    );

    const publicToken = `sos_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const sosId = `sos_evt_${Date.now()}`;

    const newSos: SosEvent = {
      id: sosId,
      rideId: id,
      riderId: user.id,
      status: "active",
      publicToken,
      tokenExpiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      lat: ride.pickupLat,
      lng: ride.pickupLng,
      contactsNotified: userContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
      createdAt: new Date().toISOString(),
    };

    db.sosEvents.set(sosId, newSos);

    // Notify Admin
    const adminNotifId = `notif_admin_${Date.now()}`;
    db.notifications.set(adminNotifId, {
      id: adminNotifId,
      userId: "user_admin",
      type: "sos_alert",
      title: "🚨 EMERGENCY SOS TRIGGERED",
      body: `Rider ${user.fullName} triggered SOS for ride ${id}. Track link: /sos/${publicToken}`,
      data: { rideId: id, sosId, publicToken },
      createdAt: new Date().toISOString(),
    });

    return successResponse({
      sosId,
      publicToken,
      contactsNotifiedCount: userContacts.length,
      trackingUrl: `/sos/${publicToken}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

