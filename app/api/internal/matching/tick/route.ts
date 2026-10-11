import { NextResponse } from "next/server";
import { db } from "@/lib/db/mock-db";

export async function POST() {
  const now = Date.now();
  let expiredOffers = 0;
  let expiredRides = 0;

  for (const [id, offer] of db.rideOffers) {
    if (offer.status === "pending" && new Date(offer.expiresAt).getTime() < now) {
      offer.status = "expired";
      db.rideOffers.set(id, offer);
      expiredOffers++;
    }
  }

  for (const [id, ride] of db.rides) {
    if (
      ride.status === "requested" &&
      now - new Date(ride.requestedAt).getTime() > 120 * 1000
    ) {
      ride.status = "expired";
      ride.updatedAt = new Date().toISOString();
      db.rides.set(id, ride);
      expiredRides++;
    }
  }

  return NextResponse.json({
    ok: true,
    data: { expiredOffers, expiredRides },
  });
}

