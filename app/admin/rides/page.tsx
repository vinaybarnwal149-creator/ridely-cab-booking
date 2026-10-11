"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Filter, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = statusFilter ? `/api/admin/rides?status=${statusFilter}` : "/api/admin/rides";
    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRides(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rides Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of all platform bookings</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-4">Ride ID</th>
                <th className="p-4">Route</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Method</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rides.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">#{r.id.slice(-6)}</td>
                  <td className="p-4 max-w-xs truncate">
                    {r.pickupAddress.split(",")[0]} → {r.dropoffAddress.split(",")[0]}
                  </td>
                  <td className="p-4"><Badge variant={r.status}>{r.status}</Badge></td>
                  <td className="p-4 font-black text-slate-900">{formatPaise(r.totalFarePaise)}</td>
                  <td className="p-4 uppercase font-bold text-slate-500">{r.paymentMethod}</td>
                  <td className="p-4 text-slate-400">{formatDateTime(r.createdAt)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/history/${r.id}`} className="text-emerald-700 font-bold hover:underline">
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

