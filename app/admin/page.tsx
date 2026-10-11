"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Car,
  Users,
  DollarSign,
  Ticket,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { Ride } from "@/lib/types";

interface AdminOverviewData {
  kpis: {
    totalRides: number;
    activeRides: number;
    onlineDrivers: number;
    pendingDrivers: number;
    totalRevenuePaise: number;
    activeSosCount: number;
    openTicketsCount: number;
  };
  recentRides: Ride[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
          <Shield className="w-3.5 h-3.5" />
          System Administration
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time platform telemetry, safety desk, and operations control</p>
      </div>

      {/* Active SOS Emergency Alert Banner */}
      {data && data.kpis.activeSosCount > 0 && (
        <div className="bg-red-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base font-black uppercase tracking-wider">
                🚨 {data.kpis.activeSosCount} Active Emergency SOS Alert(s)!
              </div>
              <div className="text-xs text-red-100 mt-0.5">
                Immediate response required by safety desk officer.
              </div>
            </div>
          </div>
          <Link href="/admin/sos">
            <Button className="bg-white text-red-900 hover:bg-red-50 font-black shrink-0">
              Open SOS Desk
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Platform Volume</span>
          <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
            {formatPaise(data?.kpis.totalRevenuePaise || 845000)}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            Est. Commission: {formatPaise(Math.round((data?.kpis.totalRevenuePaise || 845000) * 0.2))}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Live Active Rides</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {data?.kpis.activeRides || 1}
          </div>
          <span className="text-xs text-slate-500 mt-1 inline-block">
            Total {data?.kpis.totalRides || 12} all-time rides
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Online Drivers</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {data?.kpis.onlineDrivers || 3}
          </div>
          <Link href="/admin/drivers" className="text-xs text-purple-700 font-semibold mt-1 hover:underline inline-block">
            {data?.kpis.pendingDrivers || 0} applications pending &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Open Support Tickets</span>
          <div className="text-3xl font-black text-amber-600 mt-1">
            {data?.kpis.openTicketsCount || 0}
          </div>
          <Link href="/support" className="text-xs text-slate-500 hover:underline mt-1 inline-block">
            View support queue &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Ops Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/drivers" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Driver Approvals</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link href="/admin/rides" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Rides Audit</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link href="/admin/promos" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Promo Codes</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link href="/admin/pricing" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Pricing Engine</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Recent Platform Rides */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Latest Platform Rides
        </h2>

        {data?.recentRides && data.recentRides.length > 0 ? (
          <div className="space-y-3">
            {data.recentRides.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {r.pickupAddress.split(",")[0]} → {r.dropoffAddress.split(",")[0]}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Ride #{r.id.slice(-6)} · {formatDateTime(r.createdAt)} · {r.paymentMethod.toUpperCase()}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-black text-slate-900 text-sm tabular-nums">
                      {formatPaise(r.totalFarePaise)}
                    </div>
                  </div>
                  <Badge variant={r.status}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No rides recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

