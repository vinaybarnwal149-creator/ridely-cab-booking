import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { computeRoute } from "@/lib/maps/routes";
import { calculateFare } from "@/lib/pricing/fare";
import { FareQuote, RideOption } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const estimateSchema = z.object({
  pickup: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  dropoff: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  stops: z
    .array(
      z.object({
        seq: z.number(),
        lat: z.number(),
        lng: z.number(),
        address: z.string(),
      })
    )
    .max(3)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const { pickup, dropoff, stops = [] } = estimateSchema.parse(body);

    const route = await computeRoute(pickup, dropoff, stops);

    // Calculate surge multiplier based on online drivers in area
    const surgeMultiplier = 1.0;

    const options: RideOption[] = Array.from(db.rideTypes.values())
      .filter((rt) => rt.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((rideType) => {
        const fare = calculateFare({
          rideType,
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
          surgeMultiplier,
        });

        return {
          rideTypeCode: rideType.code,
          name: rideType.name,
          capacity: rideType.capacity,
          etaToPickupMin: Math.floor(2 + Math.random() * 4),
          totalPaise: fare.totalPaise,
          breakdown: {
            basePaise: fare.basePaise,
            distancePaise: fare.distancePaise,
            timePaise: fare.timePaise,
            surgePaise: fare.surgePaise,
            bookingFeePaise: fare.bookingFeePaise,
            discountPaise: fare.discountPaise,
          },
        };
      });

    const quoteId = `quote_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const quote: FareQuote = {
      id: quoteId,
      riderId: user.id,
      pickup,
      dropoff,
      stops,
      distanceM: route.distanceMeters,
      durationS: route.durationSeconds,
      polyline: route.polyline,
      surgeMultiplier,
      options,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    return successResponse(quote);
  } catch (error) {
    return handleApiError(error);
  }
}

