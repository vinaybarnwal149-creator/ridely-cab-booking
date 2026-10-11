import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { PaymentProvider } from "@/lib/payments/provider";
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

    // Check payment state
    let existingPayment = Array.from(db.payments.values()).find((p) => p.rideId === id);

    if (existingPayment && existingPayment.status === "succeeded") {
      return errorResponse(409, "ALREADY_PAID", "Ride has already been paid for");
    }

    const intent = await PaymentProvider.createPaymentIntent({
      amountPaise: ride.totalFarePaise,
      currency: "inr",
      rideId: id,
      riderId: user.id,
    });

    // In dev / test card mode, automatically mark succeeded
    if (!existingPayment) {
      existingPayment = {
        id: `pay_${Date.now()}`,
        rideId: id,
        riderId: user.id,
        method: "card",
        amountPaise: ride.totalFarePaise,
        currency: "INR",
        status: "succeeded",
        stripePaymentIntentId: intent.paymentIntentId,
        refundedPaise: 0,
        paidAt: new Date().toISOString(),
        receiptNumber: `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.payments.set(existingPayment.id, existingPayment);
    } else {
      existingPayment.status = "succeeded";
      existingPayment.paidAt = new Date().toISOString();
      db.payments.set(existingPayment.id, existingPayment);
    }

    // Driver earnings
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

    return successResponse({
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      status: "succeeded",
      amountPaise: ride.totalFarePaise,
      receiptNumber: existingPayment.receiptNumber,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

