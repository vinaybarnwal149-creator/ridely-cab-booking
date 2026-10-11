import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { generateOtp } from "@/lib/rides/otp";
import { Ride } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const createRideSchema = z.object({
  rideTypeCode: z.string(),
  pickupAddress: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffAddress: z.string(),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  stops: z
    .array(
      z.object({
        seq: z.number(),
        address: z.string(),
        lat: z.number(),
        lng: z.number(),
      })
    )
    .optional(),
  quotedDistanceM: z.number(),
  quotedDurationS: z.number(),
  routePolyline: z.string(),
  totalFarePaise: z.number(),
  baseFarePaise: z.number(),
  distanceFarePaise: z.number(),
  timeFarePaise: z.number(),
  surgeAmountPaise: z.number().default(0),
  bookingFeePaise: z.number().default(500),
  discountPaise: z.number().default(0),
  promoCodeId: z.string().optional(),
  paymentMethod: z.enum(["card", "cash"]),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let userRides = Array.from(db.rides.values()).filter((r) =>
      user.role === "driver" ? r.driverId === user.id : r.riderId === user.id
    );

    if (statusFilter) {
      userRides = userRides.filter((r) => r.status === statusFilter);
    }

    // Sort newest first
    userRides.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return successResponse(userRides);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    // Check for existing active ride
    for (const [, r] of db.rides) {
      if (
        r.riderId === user.id &&
        ["requested", "accepted", "arrived", "in_progress"].includes(r.status)
      ) {
        return errorResponse(
          409,
          "ACTIVE_RIDE_EXISTS",
          "You already have an active ride in progress. Complete or cancel it first.",
          { activeRideId: r.id }
        );
      }
    }

    const body = await req.json();
    const data = createRideSchema.parse(body);

    const rideId = `ride_${Date.now()}`;
    const otpCode = generateOtp();

    const newRide: Ride = {
      id: rideId,
      riderId: user.id,
      rideTypeCode: data.rideTypeCode,
      status: "requested",
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffAddress: data.dropoffAddress,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      stops: data.stops || [],
      routePolyline: data.routePolyline,
      quotedDistanceM: data.quotedDistanceM,
      quotedDurationS: data.quotedDurationS,
      surgeMultiplier: 1.0,
      baseFarePaise: data.baseFarePaise,
      distanceFarePaise: data.distanceFarePaise,
      timeFarePaise: data.timeFarePaise,
      surgeAmountPaise: data.surgeAmountPaise,
      bookingFeePaise: data.bookingFeePaise,
      discountPaise: data.discountPaise,
      promoCodeId: data.promoCodeId,
      totalFarePaise: data.totalFarePaise,
      cancellationFeePaise: 0,
      paymentMethod: data.paymentMethod,
      otpCode,
      otpAttempts: 0,
      matchRound: 1,
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rider: {
        name: user.fullName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    };

    db.rides.set(rideId, newRide);

    // Automatic matching: find nearest online driver
    let matchedDriverId: string | null = null;
    for (const [dId, dp] of db.driverProfiles) {
      if (dp.isOnline && !dp.isBusy && dp.status === "approved") {
        matchedDriverId = dId;
        break;
      }
    }

    if (matchedDriverId) {
      const offerId = `offer_${Date.now()}`;
      db.rideOffers.set(offerId, {
        id: offerId,
        rideId,
        driverId: matchedDriverId,
        status: "pending",
        round: 1,
        distanceToPickupM: 1400,
        expiresAt: new Date(Date.now() + 30 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        ride: newRide,
      });

      // Notification for driver
      const notifId = `notif_${Date.now()}`;
      db.notifications.set(notifId, {
        id: notifId,
        userId: matchedDriverId,
        type: "offer_received",
        title: "New Ride Offer Nearby!",
        body: `Trip to ${data.dropoffAddress.split(",")[0]} · ₹${data.totalFarePaise / 100}`,
        data: { rideId, offerId },
        createdAt: new Date().toISOString(),
      });
    }

    return successResponse(newRide);
  } catch (error) {
    return handleApiError(error);
  }
}

