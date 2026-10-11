import { FareBreakdown, PromoCode, RideType } from "../types";

export interface CalculateFareParams {
  rideType: RideType;
  distanceMeters: number;
  durationSeconds: number;
  surgeMultiplier?: number;
  promo?: PromoCode;
  bookingFeePaise?: number;
}

export interface CalculateFareResult {
  basePaise: number;
  distancePaise: number;
  timePaise: number;
  surgePaise: number;
  bookingFeePaise: number;
  discountPaise: number;
  totalPaise: number;
}

/**
 * Pure fare calculation function
 * Formula:
 * base = base_fare
 * dist = (distance_m / 1000) * per_km
 * time = (duration_s / 60) * per_min
 * subtotal = base + dist + time
 * surged = max(min_fare, subtotal * surgeMultiplier)
 * total = surged + booking_fee - discount
 * All integer paise.
 */
export function calculateFare({
  rideType,
  distanceMeters,
  durationSeconds,
  surgeMultiplier = 1.0,
  promo,
  bookingFeePaise = 500, // default ₹5
}: CalculateFareParams): CalculateFareResult {
  const km = distanceMeters / 1000;
  const minutes = durationSeconds / 60;

  const basePaise = Math.round(rideType.baseFarePaise);
  const distancePaise = Math.round(km * rideType.perKmPaise);
  const timePaise = Math.round(minutes * rideType.perMinPaise);

  const rawStandardFare = basePaise + distancePaise + timePaise;
  const surgedFare = Math.round(rawStandardFare * surgeMultiplier);
  const fareWithMin = Math.max(rideType.minFarePaise, surgedFare);
  const surgePaise = Math.max(0, fareWithMin - rawStandardFare);

  // Discount calculation
  let discountPaise = 0;
  if (promo && promo.isActive) {
    if (fareWithMin >= promo.minFarePaise) {
      if (promo.type === "percent") {
        discountPaise = Math.round((fareWithMin * promo.value) / 100);
        if (promo.maxDiscountPaise && discountPaise > promo.maxDiscountPaise) {
          discountPaise = promo.maxDiscountPaise;
        }
      } else if (promo.type === "flat") {
        discountPaise = promo.value;
      }
    }
  }

  // Ensure discount does not exceed fare
  discountPaise = Math.min(discountPaise, fareWithMin);

  let totalPaise = fareWithMin + bookingFeePaise - discountPaise;
  // Round to nearest 100 paise (₹1)
  totalPaise = Math.round(totalPaise / 100) * 100;
  totalPaise = Math.max(rideType.minFarePaise, totalPaise);

  return {
    basePaise,
    distancePaise,
    timePaise,
    surgePaise,
    bookingFeePaise,
    discountPaise,
    totalPaise,
  };
}

