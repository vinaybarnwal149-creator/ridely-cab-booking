"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Calendar, MapPin, ChevronRight, Car, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";

export default function RideHistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const url = statusFilter ? `/api/rides?status=${statusFilter}` : "/api/rides";
    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRides(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            Ride History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View all past journeys and download invoices
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
            <option value="requested">Requested</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading trips...</div>
      ) : rides.length > 0 ? (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Link
              key={ride.id}
              href={`/history/${ride.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={ride.status}>{ride.status}</Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDateTime(ride.createdAt)} · {ride.rideTypeCode.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {ride.pickupAddress.split(",")[0]} → {ride.dropoffAddress.split(",")[0]}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    {formatPaise(ride.totalFarePaise)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    {ride.paymentMethod}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Car className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No rides found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not booked any rides yet under this filter. Ready to travel?
          </p>
          <Link href="/book" className="inline-block pt-2">
            <span className="text-xs font-bold text-emerald-700 hover:underline">
              Book your first ride &rarr;
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

