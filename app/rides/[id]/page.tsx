"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Phone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OtpDisplay } from "@/components/ui/otp-display";
import { MapView } from "@/components/map/map-view";
import { formatPaise, formatDuration, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export default function LiveRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [sosHolding, setSosHolding] = useState<boolean>(false);
  const [sosProgress, setSosProgress] = useState<number>(0);

  // Poll ride state every 2 seconds
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`/api/rides/${id}`);
        const data = await res.json();
        if (data.ok) {
          setRide(data.data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRide();
    const interval = setInterval(fetchRide, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // Handle Cancel
  const handleCancelRide = async () => {
    if (!confirm("Are you sure you want to cancel this ride?")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/rides/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by rider" }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.info(
          data.data.cancellationFeePaise > 0
            ? `Ride cancelled. Fee of ₹${data.data.cancellationFeePaise / 100} applied.`
            : "Ride cancelled."
        );
        router.push("/dashboard");
      } else {
        toast.error(data.error?.message || "Could not cancel ride");
      }
    } catch {
      toast.error("Error cancelling ride");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle SOS 2-second press and hold
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosHolding) {
      timer = setInterval(() => {
        setSosProgress((prev) => {
          if (prev >= 100) {
            triggerSos();
            setSosHolding(false);
            return 0;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      setSosProgress(0);
    }
    return () => clearInterval(timer);
  }, [sosHolding]);

  const triggerSos = async () => {
    try {
      const res = await fetch(`/api/rides/${id}/sos`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        toast.error(
          "🚨 EMERGENCY SOS DISPATCHED: Live tracking URL sent to emergency contacts and admin desk!",
          { duration: 8000 }
        );
      } else {
        toast.error(data.error?.message || "Failed to trigger SOS");
      }
    } catch {
      toast.error("Error sending emergency SOS");
    }
  };

  if (isLoading || !ride) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">
            Loading ride telemetry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Control Card */}
      <div className="w-full lg:w-[480px] bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trip #{ride.id.slice(-6)}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {ride.status === "requested" && "Finding Nearby Driver..."}
              {ride.status === "accepted" && "Driver is on the way!"}
              {ride.status === "arrived" && "Driver has arrived at pickup"}
              {ride.status === "in_progress" && "Trip in progress"}
              {ride.status === "completed" && "Trip completed!"}
              {ride.status === "cancelled" && "Trip was cancelled"}
            </h1>
          </div>
          <Badge variant={ride.status}>{ride.status}</Badge>
        </div>

        {/* 1. Requested: Radar animation */}
        {ride.status === "requested" && (
          <div className="flex flex-col items-center justify-center py-8 bg-amber-50/60 rounded-3xl border border-amber-200/80">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 radar-circle" />
              <div className="absolute w-16 h-16 rounded-full bg-amber-400/30 radar-circle" />
              <div className="relative w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Matching with nearest drivers
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
              Sending offers to drivers within 5 km. This typically takes 10–30 seconds.
            </p>
          </div>
        )}

        {/* 2. Accepted / Arrived / In Progress: Driver Details & OTP */}
        {(ride.status === "accepted" ||
          ride.status === "arrived" ||
          ride.status === "in_progress") && (
          <div className="space-y-4">
            {/* Driver Profile Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                  {ride.driver?.name ? ride.driver.name[0] : "D"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {ride.driver?.name || "Assigned Driver"}
                  </div>
                  <div className="text-xs text-slate-500">
                    ★ {ride.driver?.avgRating || "4.9"} ({ride.driver?.ratingCount || 120} trips)
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {ride.driver?.vehicleMake} {ride.driver?.vehicleModel} ({ride.driver?.vehicleColor})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 shadow-2xs">
                  {ride.driver?.vehiclePlate || "MH 02 BG 4512"}
                </span>
                {ride.driver?.phone && (
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="mt-2 flex items-center justify-end text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </a>
                )}
              </div>
            </div>

            {/* OTP Display - only for rider during accepted / arrived */}
            {(ride.status === "accepted" || ride.status === "arrived") && (
              <OtpDisplay otp={ride.otpCode} />
            )}

            {/* Emergency SOS Button during trip */}
            {ride.status === "in_progress" && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200/80 flex flex-col items-center">
                <div className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Emergency SOS Protocol
                </div>
                <p className="text-[11px] text-red-700 text-center mb-3">
                  Press and hold for 2 seconds to alert emergency contacts and send live location.
                </p>

                <div className="relative w-full">
                  <button
                    type="button"
                    onMouseDown={() => setSosHolding(true)}
                    onMouseUp={() => setSosHolding(false)}
                    onTouchStart={() => setSosHolding(true)}
                    onTouchEnd={() => setSosHolding(false)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all relative overflow-hidden select-none cursor-pointer"
                  >
                    {sosProgress > 0 ? `Hold (${sosProgress}%)` : "Press & Hold SOS"}
                    <div
                      className="absolute left-0 bottom-0 top-0 bg-red-900/40 transition-all duration-100 pointer-events-none"
                      style={{ width: `${sosProgress}%` }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Completed State: Pay & Review CTAs */}
        {ride.status === "completed" && (
          <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                You have reached your destination!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Total fare due: <strong className="text-base text-slate-900">{formatPaise(ride.totalFarePaise)}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link href={`/rides/${ride.id}/pay`}>
                <Button size="lg" className="w-full h-12 text-sm font-bold shadow-sm">
                  Pay Now / Verify Payment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/rides/${ride.id}/rate`}>
                <Button variant="outline" size="md" className="w-full">
                  Rate Driver
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Route Summary */}
        <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Pickup: </span>
            <span className="font-semibold text-slate-800">{ride.pickupAddress}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Destination: </span>
            <span className="font-semibold text-slate-800">{ride.dropoffAddress}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1">
            <span>Payment Method:</span>
            <span className="font-bold uppercase text-slate-900">{ride.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Locked Fare:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatPaise(ride.totalFarePaise)}</span>
          </div>
        </div>

        {/* Cancel Button if eligible */}
        {["requested", "accepted", "arrived"].includes(ride.status) && (
          <div className="mt-auto pt-4">
            <Button
              onClick={handleCancelRide}
              isLoading={isCancelling}
              variant="danger"
              size="md"
              className="w-full"
            >
              Cancel Ride
            </Button>
          </div>
        )}
      </div>

      {/* Right Map View */}
      <div className="hidden lg:flex flex-1 h-full p-4 bg-slate-100">
        <MapView
          pickup={{
            lat: ride.pickupLat,
            lng: ride.pickupLng,
            address: ride.pickupAddress,
          }}
          dropoff={{
            lat: ride.dropoffLat,
            lng: ride.dropoffLng,
            address: ride.dropoffAddress,
          }}
          stops={ride.stops}
          driverLocation={
            ride.driver?.currentLat && ride.driver?.currentLng
              ? { lat: ride.driver.currentLat, lng: ride.driver.currentLng }
              : undefined
          }
          status={ride.status}
          className="h-full w-full shadow-md"
        />
      </div>
    </div>
  );
}

