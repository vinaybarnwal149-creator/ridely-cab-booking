import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const pricingSchema = z.object({
  rideTypeCode: z.string(),
  baseFarePaise: z.number().int().positive(),
  perKmPaise: z.number().int().positive(),
  perMinPaise: z.number().int().positive(),
  minFarePaise: z.number().int().positive(),
});

export async function GET() {
  try {
    const rideTypes = Array.from(db.rideTypes.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const settings = {
      surge: db.appSettings.get("surge"),
      commissionPercent: db.appSettings.get("commission_percent") || 20,
      cancellationFeePaise: db.appSettings.get("cancellation_fee_paise") || 3000,
      bookingFeePaise: db.appSettings.get("booking_fee_paise") || 500,
    };

    return successResponse({ rideTypes, settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const body = await req.json();
    const data = pricingSchema.parse(body);

    const rideType = db.rideTypes.get(data.rideTypeCode);
    if (!rideType) return errorResponse(404, "NOT_FOUND", "Ride type not found");

    rideType.baseFarePaise = data.baseFarePaise;
    rideType.perKmPaise = data.perKmPaise;
    rideType.perMinPaise = data.perMinPaise;
    rideType.minFarePaise = data.minFarePaise;
    db.rideTypes.set(data.rideTypeCode, rideType);

    return successResponse(rideType);
  } catch (error) {
    return handleApiError(error);
  }
}

