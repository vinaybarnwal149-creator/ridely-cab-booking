"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";

export default function DriverHistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRides(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-600" />
          Driver Trip History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Summary of all journeys completed or handled by you</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading trips...</div>
      ) : rides.length > 0 ? (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Link
              key={ride.id}
              href={`/driver/rides/${ride.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={ride.status}>{ride.status}</Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDateTime(ride.createdAt)} · {ride.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {ride.pickupAddress.split(",")[0]} → {ride.dropoffAddress.split(",")[0]}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-emerald-600">
                  {formatPaise(Math.round(ride.totalFarePaise * 0.8))}
                </div>
                <div className="text-[11px] text-slate-400">
                  Gross: {formatPaise(ride.totalFarePaise)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-xs text-slate-400">No trips recorded yet. Turn online to accept incoming requests!</p>
        </div>
      )}
    </div>
  );
}

