import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { PromoCode } from "@/lib/types";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const createPromoSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(["percent", "flat"]),
  value: z.number().positive(),
  maxDiscountPaise: z.number().positive().optional(),
  minFarePaise: z.number().default(0),
  firstRideOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const promos = Array.from(db.promoCodes.values());
    return successResponse(promos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const body = await req.json();
    const data = createPromoSchema.parse(body);

    const codeUpper = data.code.toUpperCase();
    if (db.promoCodes.has(codeUpper)) {
      return errorResponse(409, "PROMO_EXISTS", "Promo code already exists");
    }

    const newPromo: PromoCode = {
      id: `promo_${Date.now()}`,
      code: codeUpper,
      description: data.description,
      type: data.type,
      value: data.value,
      maxDiscountPaise: data.maxDiscountPaise,
      minFarePaise: data.minFarePaise,
      validFrom: new Date().toISOString(),
      perUserLimit: 1,
      firstRideOnly: data.firstRideOnly,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
    };

    db.promoCodes.set(codeUpper, newPromo);

    return successResponse(newPromo);
  } catch (error) {
    return handleApiError(error);
  }
}

