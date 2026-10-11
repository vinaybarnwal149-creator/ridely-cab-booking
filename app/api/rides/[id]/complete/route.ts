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

    if (ride.status !== "in_progress") {
      return errorResponse(409, "INVALID_TRANSITION", `Cannot complete ride from status ${ride.status}`);
    }

    // Free driver
    if (ride.driverId) {
      const driverProf = db.driverProfiles.get(ride.driverId);
      if (driverProf) {
        driverProf.isBusy = false;
        driverProf.totalRides = (driverProf.totalRides || 0) + 1;
        db.driverProfiles.set(ride.driverId, driverProf);
      }
    }

    const completed = {
      ...ride,
      status: "completed" as const,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.rides.set(id, completed);

    // Create payment entry if not already exists
    const paymentId = `pay_${Date.now()}`;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const receiptNum = `RCP-${todayStr}-${Math.floor(10000 + Math.random() * 90000)}`;

    db.payments.set(paymentId, {
      id: paymentId,
      rideId: id,
      riderId: ride.riderId,
      method: ride.paymentMethod,
      amountPaise: ride.totalFarePaise,
      currency: "INR",
      status: "pending",
      refundedPaise: 0,
      receiptNumber: receiptNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Notify rider
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: ride.riderId,
      type: "ride_completed",
      title: "Ride Completed!",
      body: `You have arrived at your destination. Total fare: ₹${ride.totalFarePaise / 100}`,
      data: { rideId: id, paymentId },
      createdAt: new Date().toISOString(),
    });

    return successResponse(completed);
  } catch (error) {
    return handleApiError(error);
  }
}

