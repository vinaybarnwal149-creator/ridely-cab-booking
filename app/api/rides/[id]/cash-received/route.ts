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

    // Find payment
    let paymentFound = false;
    for (const [pId, pay] of db.payments) {
      if (pay.rideId === id) {
        pay.status = "succeeded";
        pay.paidAt = new Date().toISOString();
        db.payments.set(pId, pay);
        paymentFound = true;
        break;
      }
    }

    // Driver earnings (commission default 20%)
    if (ride.driverId) {
      const grossPaise = ride.totalFarePaise;
      const commissionPercent = 20;
      const commissionPaise = Math.round((grossPaise * commissionPercent) / 100);
      const netPaise = grossPaise - commissionPaise;

      const earningId = `earn_${Date.now()}`;
      db.driverEarnings.set(earningId, {
        id: earningId,
        driverId: ride.driverId,
        rideId: id,
        grossPaise,
        commissionPaise,
        netPaise,
        commissionPercent,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    return successResponse({ success: true, paymentConfirmed: paymentFound });
  } catch (error) {
    return handleApiError(error);
  }
}

