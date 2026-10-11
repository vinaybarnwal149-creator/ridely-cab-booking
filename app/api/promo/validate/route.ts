import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const promoSchema = z.object({
  code: z.string().min(1),
  rideTypeCode: z.string(),
  currentTotalPaise: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const body = await req.json();
    const { code, currentTotalPaise } = promoSchema.parse(body);

    const promo = db.promoCodes.get(code.toUpperCase());
    if (!promo || !promo.isActive) {
      return errorResponse(422, "PROMO_INVALID", "Invalid or expired promo code");
    }

    if (currentTotalPaise < promo.minFarePaise) {
      return errorResponse(
        422,
        "PROMO_INVALID",
        `Minimum fare of ₹${promo.minFarePaise / 100} required to apply this code`
      );
    }

    let discountPaise = 0;
    if (promo.type === "percent") {
      discountPaise = Math.round((currentTotalPaise * promo.value) / 100);
      if (promo.maxDiscountPaise && discountPaise > promo.maxDiscountPaise) {
        discountPaise = promo.maxDiscountPaise;
      }
    } else {
      discountPaise = promo.value;
    }

    discountPaise = Math.min(discountPaise, currentTotalPaise);
    const newTotalPaise = Math.max(0, currentTotalPaise - discountPaise);

    return successResponse({
      valid: true,
      promoId: promo.id,
      code: promo.code,
      discountPaise,
      newTotalPaise,
      message: `Promo applied: ₹${discountPaise / 100} saved!`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

