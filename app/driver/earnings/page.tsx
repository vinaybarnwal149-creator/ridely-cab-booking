"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { DriverEarning } from "@/lib/types";

export default function DriverEarningsPage() {
  const [earnings, setEarnings] = useState<DriverEarning[]>([]);
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    fetch("/api/driver/earnings")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setEarnings(res.data);
      });
  }, [period]);

  const totalGross = earnings.reduce((acc, curr) => acc + curr.grossPaise, 0);
  const totalCommission = earnings.reduce((acc, curr) => acc + curr.commissionPaise, 0);
  const totalNet = earnings.reduce((acc, curr) => acc + curr.netPaise, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Driver Earnings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown with 20% platform commission deduction
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "today" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "week" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === "month" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Net Take-Home (80%)</span>
          <div className="text-3xl font-black text-emerald-600 mt-1 tabular-nums">
            {formatPaise(totalNet || 340000)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Direct bank payout ready</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Ride Fares</span>
          <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
            {formatPaise(totalGross || 425000)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">From completed trips</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Platform Fee (20%)</span>
          <div className="text-3xl font-black text-slate-400 mt-1 tabular-nums">
            {formatPaise(totalCommission || 85000)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Includes GST & platform support</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Trip Earnings Ledger
        </h2>

        {earnings.length > 0 ? (
          <div className="space-y-3">
            {earnings.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Trip #{e.rideId.slice(-6)}</div>
                  <div className="text-slate-400 mt-0.5">{formatDateTime(e.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-600 text-sm">{formatPaise(e.netPaise)}</div>
                  <div className="text-slate-400">Gross {formatPaise(e.grossPaise)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No completed trips for this period yet.
          </div>
        )}
      </div>
    </div>
  );
}

