"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Plus,
  Trash2,
  Car,
  Tag,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map/map-view";
import { formatPaise, formatDistance, formatDuration } from "@/lib/utils";
import { FareQuote, RideOption, RideStop } from "@/lib/types";
import { toast } from "sonner";

export default function BookRidePage() {
  const router = useRouter();

  // Locations state
  const [pickupAddress, setPickupAddress] = useState(
    "Bandra Kurla Complex (BKC), Mumbai"
  );
  const [dropoffAddress, setDropoffAddress] = useState(
    "Chhatrapati Shivaji Maharaj Terminus (CST), Mumbai"
  );
  const [stops, setStops] = useState<{ seq: number; address: string }[]>([]);

  // Quote & estimation state
  const [quote, setQuote] = useState<FareQuote | null>(null);
  const [selectedRideCode, setSelectedRideCode] = useState<string>("mini");
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Promo & payment state
  const [promoInput, setPromoInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPaise: number;
    promoId: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Fetch initial estimate
  const fetchEstimate = async () => {
    setIsEstimating(true);
    try {
      const res = await fetch("/api/fare/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: {
            lat: 19.0657,
            lng: 72.8687,
            address: pickupAddress,
          },
          dropoff: {
            lat: 18.9401,
            lng: 72.8347,
            address: dropoffAddress,
          },
          stops: stops.map((s, idx) => ({
            seq: idx + 1,
            lat: 19.01 + idx * 0.02,
            lng: 72.84 + idx * 0.01,
            address: s.address,
          })),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setQuote(data.data);
      } else {
        toast.error(data.error?.message || "Failed to calculate fare");
      }
    } catch {
      toast.error("Error connecting to fare calculator");
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [stops.length]);

  const addStop = () => {
    if (stops.length >= 3) {
      toast.error("Maximum 3 intermediate stops allowed");
      return;
    }
    setStops([...stops, { seq: stops.length + 1, address: "Dadar West, Mumbai" }]);
  };

  const removeStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  // Promo code apply
  const handleApplyPromo = async () => {
    if (!promoInput.trim() || !quote) return;
    const selectedOption = quote.options.find(
      (opt) => opt.rideTypeCode === selectedRideCode
    );
    if (!selectedOption) return;

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          rideTypeCode: selectedRideCode,
          currentTotalPaise: selectedOption.totalPaise,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAppliedPromo({
          code: data.data.code,
          discountPaise: data.data.discountPaise,
          promoId: data.data.promoId,
        });
        toast.success(data.data.message);
      } else {
        toast.error(data.error?.message || "Invalid promo code");
      }
    } catch {
      toast.error("Error verifying promo code");
    }
  };

  // Selected Option Details
  const selectedOption: RideOption | undefined = quote?.options.find(
    (opt) => opt.rideTypeCode === selectedRideCode
  );

  const finalTotalPaise = selectedOption
    ? Math.max(
        0,
        selectedOption.totalPaise - (appliedPromo ? appliedPromo.discountPaise : 0)
      )
    : 0;

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!quote || !selectedOption) return;
    setIsBooking(true);

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideTypeCode: selectedRideCode,
          pickupAddress,
          pickupLat: quote.pickup.lat,
          pickupLng: quote.pickup.lng,
          dropoffAddress,
          dropoffLat: quote.dropoff.lat,
          dropoffLng: quote.dropoff.lng,
          stops: quote.stops,
          quotedDistanceM: quote.distanceM,
          quotedDurationS: quote.durationS,
          routePolyline: quote.polyline,
          totalFarePaise: finalTotalPaise,
          baseFarePaise: selectedOption.breakdown.basePaise,
          distanceFarePaise: selectedOption.breakdown.distancePaise,
          timeFarePaise: selectedOption.breakdown.timePaise,
          surgeAmountPaise: selectedOption.breakdown.surgePaise,
          bookingFeePaise: selectedOption.breakdown.bookingFeePaise,
          discountPaise: appliedPromo ? appliedPromo.discountPaise : 0,
          promoCodeId: appliedPromo ? appliedPromo.promoId : undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success("Ride requested! Finding nearby drivers...");
        router.push(`/rides/${data.data.id}`);
      } else {
        toast.error(data.error?.message || "Could not book ride");
      }
    } catch {
      toast.error("Error creating ride");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Booking Panel */}
      <div className="w-full lg:w-[480px] bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto p-5 sm:p-6 space-y-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-normal text-[#000000] tracking-tight">
            Book a Ride
          </h1>
          <p className="text-xs text-[#767676] mt-0.5">
            Upfront prices locked for 5 minutes
          </p>
        </div>

        {/* Step 1: Locations */}
        <div className="bg-[#f6f6f6] p-4 rounded-[8px] space-y-3 relative">
          {/* Pickup */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#000000] shrink-0" />
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Pickup address"
              className="w-full bg-[#ffffff] px-3.5 py-2.5 text-xs font-normal rounded-[8px] border border-[#767676] focus:outline-none focus:border-[#000000] text-[#000000]"
            />
          </div>

          {/* Stops */}
          {stops.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-3 pl-1">
              <div className="w-2 h-2 rounded-full bg-[#767676] shrink-0" />
              <input
                type="text"
                value={stop.address}
                onChange={(e) => {
                  const updated = [...stops];
                  updated[idx].address = e.target.value;
                  setStops(updated);
                }}
                className="w-full bg-[#ffffff] px-3 py-1.5 text-xs rounded-[8px] border border-[#767676] focus:outline-none text-[#000000]"
              />
              <button
                onClick={() => removeStop(idx)}
                className="p-1 text-[#767676] hover:text-[#000000]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Dropoff */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#000000] shrink-0" />
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Destination address"
              className="w-full bg-[#ffffff] px-3.5 py-2.5 text-xs font-normal rounded-[8px] border border-[#767676] focus:outline-none focus:border-[#000000] text-[#000000]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={addStop}
              disabled={stops.length >= 3}
              className="text-xs font-medium text-[#000000] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stop ({stops.length}/3)
            </button>
            <button
              onClick={fetchEstimate}
              className="text-xs font-normal text-[#5e5e5e] hover:text-[#000000] underline cursor-pointer"
            >
              Recalculate Route
            </button>
          </div>
        </div>

        {/* Step 2: Choose Ride Type */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#767676]">
            Available Vehicle Options
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {quote?.options.map((option) => {
              const isSelected = selectedRideCode === option.rideTypeCode;
              return (
                <div
                  key={option.rideTypeCode}
                  onClick={() => setSelectedRideCode(option.rideTypeCode)}
                  className={`p-3.5 rounded-[8px] border transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#000000] bg-[#f6f6f6]"
                      : "border-[#e5e5e5] hover:border-[#767676] bg-[#ffffff]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
                        isSelected
                          ? "bg-[#000000] text-[#ffffff]"
                          : "bg-[#f6f6f6] text-[#000000]"
                      }`}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#000000] flex items-center gap-2">
                        {option.name}
                        <span className="text-[11px] font-normal text-[#767676]">
                          ({option.capacity} seats)
                        </span>
                      </div>
                      <div className="text-xs text-[#767676]">
                        {option.etaToPickupMin} mins away · Est. {quote.durationS ? formatDuration(quote.durationS) : "15m"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-medium text-[#000000] tabular-nums">
                      {formatPaise(option.totalPaise)}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-medium text-[#000000] underline">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Promo & Payment */}
        <div className="space-y-3 pt-2 border-t border-[#f6f6f6]">
          {/* Promo code */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-[#767676]" />
              <input
                type="text"
                placeholder="Promo Code (WELCOME50)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono rounded-[8px] border border-[#767676] focus:outline-none focus:border-[#000000] bg-[#ffffff] text-[#000000]"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              className="h-9 px-4 rounded-[8px] border border-[#767676] text-xs font-normal text-[#000000] hover:bg-[#f6f6f6] transition-colors shrink-0"
            >
              Apply
            </button>
          </div>

          {appliedPromo && (
            <div className="px-3 py-1.5 bg-[#f6f6f6] border border-[#e5e5e5] text-[#000000] rounded-[8px] text-xs font-medium flex items-center justify-between">
              <span>Promo {appliedPromo.code} Applied</span>
              <span className="font-bold">-{formatPaise(appliedPromo.discountPaise)}</span>
            </div>
          )}

          {/* Payment method selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 p-3 rounded-[8px] border flex items-center justify-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                paymentMethod === "card"
                  ? "border-[#000000] bg-[#000000] text-[#ffffff]"
                  : "border-[#e5e5e5] bg-[#ffffff] text-[#000000] hover:border-[#767676]"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card (Stripe)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 p-3 rounded-[8px] border flex items-center justify-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                paymentMethod === "cash"
                  ? "border-[#000000] bg-[#000000] text-[#ffffff]"
                  : "border-[#e5e5e5] bg-[#ffffff] text-[#000000] hover:border-[#767676]"
              }`}
            >
              <Banknote className="w-4 h-4" />
              Cash to Driver
            </button>
          </div>

          {/* Fare breakdown toggle */}
          {selectedOption && (
            <div className="border border-[#e5e5e5] rounded-[8px] p-3 bg-[#f6f6f6]">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between text-xs font-medium text-[#000000]"
              >
                <span>Fare Breakdown Details</span>
                {showBreakdown ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showBreakdown && (
                <div className="mt-3 pt-3 border-t border-[#e5e5e5] space-y-1.5 text-xs text-[#5e5e5e]">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span>{formatPaise(selectedOption.breakdown.basePaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance ({quote ? formatDistance(quote.distanceM) : ""})</span>
                    <span>{formatPaise(selectedOption.breakdown.distancePaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time ({quote ? formatDuration(quote.durationS) : ""})</span>
                    <span>{formatPaise(selectedOption.breakdown.timePaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking Fee</span>
                    <span>{formatPaise(selectedOption.breakdown.bookingFeePaise)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-[#000000] font-semibold">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>-{formatPaise(appliedPromo.discountPaise)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Confirm Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleConfirmBooking}
            disabled={!quote || isEstimating || isBooking}
            className="w-full h-12 bg-[#000000] text-[#ffffff] rounded-[8px] text-sm font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Confirm {selectedOption?.name || "Ride"} · {formatPaise(finalTotalPaise)}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Map Preview */}
      <div className="hidden lg:flex flex-1 h-full p-4 bg-slate-100">
        <MapView
          pickup={{
            lat: quote?.pickup.lat || 19.0657,
            lng: quote?.pickup.lng || 72.8687,
            address: pickupAddress,
          }}
          dropoff={{
            lat: quote?.dropoff.lat || 18.9401,
            lng: quote?.dropoff.lng || 72.8347,
            address: dropoffAddress,
          }}
          stops={quote?.stops}
          status="requested"
          className="h-full w-full shadow-md"
        />
      </div>
    </div>
  );
}

