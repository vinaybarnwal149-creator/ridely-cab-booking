"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Power,
  TrendingUp,
  Award,
  Star,
  MapPin,
  Check,
  X,
  Navigation,
  Car,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownRing } from "@/components/ui/countdown-ring";
import { formatPaise, formatDistance } from "@/lib/utils";
import { RideOffer, DriverProfile } from "@/lib/types";
import { toast } from "sonner";

export default function DriverDashboardPage() {
  const router = useRouter();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    rides: number;
    grossPaise: number;
    netPaise: number;
    onlineMinutes: number;
    acceptanceRate: number;
    rating: number;
  }>({
    rides: 8,
    grossPaise: 425000,
    netPaise: 340000,
    onlineMinutes: 240,
    acceptanceRate: 98.5,
    rating: 4.88,
  });

  const [activeOffer, setActiveOffer] = useState<RideOffer | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Poll for incoming offers & status
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/driver/offers");
        const data = await res.json();
        if (data.ok && data.data && data.data.length > 0) {
          setActiveOffer(data.data[0]);
        } else {
          setActiveOffer(null);
        }
      } catch (err) {
        console.error("Error polling driver offers:", err);
      }
    };

    fetchOffers();
    const interval = setInterval(fetchOffers, 2000);
    return () => clearInterval(interval);
  }, []);

  // Offer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeOffer) {
      setCountdown(30);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeOffer?.id]);

  const toggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await fetch("/api/driver/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: nextState }),
      });
      toast.info(nextState ? "You are now ONLINE" : "You are now OFFLINE");
    } catch {
      toast.error("Failed to update driver status");
    }
  };

  const handleAccept = async () => {
    if (!activeOffer) return;
    try {
      const res = await fetch(`/api/rides/${activeOffer.rideId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Ride accepted! Navigating to pickup...");
        router.push(`/driver/rides/${activeOffer.rideId}`);
      } else {
        toast.error(data.error?.message || "Ride unavailable");
        setActiveOffer(null);
      }
    } catch {
      toast.error("Error accepting ride");
    }
  };

  const handleDecline = async () => {
    if (!activeOffer) return;
    try {
      await fetch(`/api/rides/${activeOffer.rideId}/decline`, {
        method: "POST",
      });
      setActiveOffer(null);
      toast.info("Offer declined");
    } catch {
      toast.error("Error declining offer");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Big Online Switch */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Driver Partner Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status:{" "}
            <span
              className={`font-bold uppercase ${
                isOnline ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {isOnline ? "Online & Receiving Requests" : "Offline"}
            </span>
          </p>
        </div>

        <button
          onClick={toggleOnline}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md cursor-pointer ${
            isOnline
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-slate-200 hover:bg-slate-300 text-slate-700"
          }`}
        >
          <Power className="w-5 h-5" />
          {isOnline ? "GO OFFLINE" : "GO ONLINE"}
        </button>
      </div>

      {/* Incoming Offer Modal / Card */}
      {activeOffer && activeOffer.ride && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500 animate-in zoom-in-95 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  New Trip Request Nearby!
                </span>
                <div className="text-lg font-bold">
                  {formatDistance(activeOffer.distanceToPickupM || 1200)} away
                </div>
              </div>
            </div>

            <CountdownRing remainingSeconds={countdown} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Pickup Location:</span>
              <div className="font-bold text-white text-sm mt-0.5">
                {activeOffer.ride.pickupAddress}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Drop-off Destination:</span>
              <div className="font-bold text-white text-sm mt-0.5">
                {activeOffer.ride.dropoffAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div>
              <span className="text-xs text-slate-400">Estimated Net Earning:</span>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                {formatPaise(Math.round(activeOffer.ride.totalFarePaise * 0.8))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDecline}
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4 mr-1.5" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Accept Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Today's KPI Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Today&apos;s Earnings</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {formatPaise(stats.netPaise)}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            Gross: {formatPaise(stats.grossPaise)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Completed Rides</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.rides}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">
            {stats.onlineMinutes} mins active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Driver Rating</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            {stats.rating}
          </div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Top Rated Partner</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Acceptance Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.acceptanceRate}%
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Excellent Standing</span>
        </div>
      </div>
    </div>
  );
}

