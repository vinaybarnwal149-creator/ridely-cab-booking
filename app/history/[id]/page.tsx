"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Mail,
  RotateCcw,
  AlertTriangle,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { formatPaise, formatDistance, formatDuration, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export default function RideHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [isEmailing, setIsEmailing] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/rides/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRide(res.data);
      });
  }, [id]);

  const handleEmailReceipt = async () => {
    setIsEmailing(true);
    try {
      const res = await fetch(`/api/rides/${id}/receipt/email`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Receipt invoice sent to ${data.data.recipient}!`);
      } else {
        toast.error("Failed to email receipt");
      }
    } catch {
      toast.error("Error sending email");
    } finally {
      setIsEmailing(false);
    }
  };

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">Loading trip summary...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Trip Details
            </h1>
            <Badge variant={ride.status}>{ride.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDateTime(ride.createdAt)} · Ride ID: {ride.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/rides/${ride.id}/receipt`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="h-9">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Download Receipt
            </Button>
          </a>
          <Button
            onClick={handleEmailReceipt}
            isLoading={isEmailing}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Email Invoice
          </Button>
          <Link href="/book">
            <Button size="sm" className="h-9">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Rebook Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Map Snapshot */}
      <div className="h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
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
          status={ride.status}
          className="h-full w-full"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route & Timestamps */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Journey Itinerary
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 mt-1 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Pickup Location</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{ride.pickupAddress}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-4 ring-slate-100 mt-1 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Destination</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{ride.dropoffAddress}</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Distance:</span>
              <div className="font-bold text-slate-800 mt-0.5">{formatDistance(ride.quotedDistanceM)}</div>
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>
              <div className="font-bold text-slate-800 mt-0.5">{formatDuration(ride.quotedDurationS)}</div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown & Driver */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Fare Summary
          </h2>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Fare</span>
              <span>{formatPaise(ride.baseFarePaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Distance Fare</span>
              <span>{formatPaise(ride.distanceFarePaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Fare</span>
              <span>{formatPaise(ride.timeFarePaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Booking Fee</span>
              <span>{formatPaise(ride.bookingFeePaise)}</span>
            </div>
            {ride.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied</span>
                <span>-{formatPaise(ride.discountPaise)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid ({ride.paymentMethod.toUpperCase()})</span>
              <span>{formatPaise(ride.totalFarePaise)}</span>
            </div>
          </div>

          {/* Support Ticket Link */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href={`/support/new?rideId=${ride.id}`}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report an Issue with this Trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

