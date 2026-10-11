import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
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

    // Dispatch live email using Resend
    const { sendReceiptEmail } = await import("@/lib/notifications/email");
    await sendReceiptEmail({
      to: user.email,
      rideId: id,
      totalPaise: ride.totalFarePaise,
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
    });

    // In-app notification record
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: user.id,
      type: "receipt_sent",
      title: "Receipt Emailed",
      body: `Trip receipt for ${id} has been dispatched to ${user.email}.`,
      data: { rideId: id },
      createdAt: new Date().toISOString(),
    });

    return successResponse({ sent: true, recipient: user.email });
  } catch (error) {
    return handleApiError(error);
  }
}

