"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  Car,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { formatPaise, formatDuration } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export default function DriverActiveRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [otpInput, setOtpInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchRide = async () => {
    try {
      const res = await fetch(`/api/rides/${id}`);
      const data = await res.json();
      if (data.ok) setRide(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 2500);
    return () => clearInterval(interval);
  }, [id]);

  // Mark Arrived
  const handleArrived = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${id}/arrived`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast.success("Marked arrived. Ask rider for the 4-digit OTP.");
        fetchRide();
      } else {
        toast.error(data.error?.message || "Failed to update");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start with OTP
  const handleStartRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 4) {
      toast.error("Please enter full 4-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("OTP verified! Ride started.");
        fetchRide();
      } else {
        toast.error(data.error?.message || "Invalid OTP code");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Ride
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${id}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast.success("Ride marked completed!");
        fetchRide();
      } else {
        toast.error(data.error?.message || "Failed to complete ride");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Cash Received
  const handleCashReceived = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${id}/cash-received`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast.success("Cash payment confirmed! Earning ledger updated.");
        router.push("/driver/earnings");
      } else {
        toast.error(data.error?.message || "Failed to confirm cash");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">Loading active trip controls...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Control Side Panel */}
      <div className="w-full lg:w-[480px] bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trip #{ride.id.slice(-6)}
            </span>
            <h1 className="text-xl font-black text-slate-900">Driver Navigation</h1>
          </div>
          <Badge variant={ride.status}>{ride.status}</Badge>
        </div>

        {/* Rider Info Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
              {ride.rider?.name ? ride.rider.name[0] : "R"}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{ride.rider?.name || "Passenger"}</div>
              <div className="text-xs text-slate-500">Payment: {ride.paymentMethod.toUpperCase()}</div>
            </div>
          </div>
          {ride.rider?.phone && (
            <a
              href={`tel:${ride.rider.phone}`}
              className="p-3 rounded-xl bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Route Details */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase">Pickup</span>
            <div className="font-bold text-slate-900 mt-0.5">{ride.pickupAddress}</div>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase">Drop-off</span>
            <div className="font-bold text-slate-900 mt-0.5">{ride.dropoffAddress}</div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              ride.status === "accepted" ? ride.pickupAddress : ride.dropoffAddress
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        </div>

        {/* Action Controls by Status */}
        <div className="space-y-4 pt-2">
          {ride.status === "accepted" && (
            <Button
              onClick={handleArrived}
              isLoading={isSubmitting}
              size="lg"
              className="w-full h-13 text-base font-bold shadow-md"
            >
              <Navigation className="w-5 h-5 mr-2" />
              I Have Arrived at Pickup
            </Button>
          )}

          {ride.status === "arrived" && (
            <form onSubmit={handleStartRide} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Ask Rider for 4-Digit OTP
                </span>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 4829"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-36 mx-auto text-center font-mono text-2xl font-black py-2 tracking-widest bg-white rounded-xl border-2 border-emerald-400 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                isLoading={isSubmitting}
                size="lg"
                className="w-full h-13 text-base font-bold shadow-md"
              >
                Verify OTP & Start Ride
              </Button>
            </form>
          )}

          {ride.status === "in_progress" && (
            <Button
              onClick={handleComplete}
              isLoading={isSubmitting}
              size="lg"
              className="w-full h-13 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-md"
            >
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" />
              Complete Ride at Destination
            </Button>
          )}

          {ride.status === "completed" && (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <div className="text-xs font-bold text-emerald-800 uppercase">
                  Total Fare: {formatPaise(ride.totalFarePaise)}
                </div>
                <div className="text-lg font-black text-slate-900 mt-1">
                  Net Earning: {formatPaise(Math.round(ride.totalFarePaise * 0.8))}
                </div>
              </div>

              {ride.paymentMethod === "cash" ? (
                <Button
                  onClick={handleCashReceived}
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Confirm Cash Received
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/driver/earnings")}
                  size="lg"
                  className="w-full h-12 text-sm font-bold"
                >
                  View Earnings Ledger
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="hidden lg:flex flex-1 h-full p-4 bg-slate-100">
        <MapView
          pickup={{ lat: ride.pickupLat, lng: ride.pickupLng, address: ride.pickupAddress }}
          dropoff={{ lat: ride.dropoffLat, lng: ride.dropoffLng, address: ride.dropoffAddress }}
          status={ride.status}
          className="h-full w-full shadow-md"
        />
      </div>
    </div>
  );
}

