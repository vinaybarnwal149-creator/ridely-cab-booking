"use client";

import React, { useEffect, useState, use } from "react";
import { ShieldAlert, Car, MapPin, Clock, AlertTriangle } from "lucide-react";
import { MapView } from "@/components/map/map-view";

interface SosData {
  sosStatus: string;
  riderFirstName: string;
  rideStatus?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  driverName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  currentLat?: number;
  currentLng?: number;
  updatedAt: string;
}

export default function PublicSosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SosData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sos/public/${token}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          setData(res.data);
        } else {
          setError(res.error?.message || "SOS link is invalid or expired");
        }
      })
      .catch(() => setError("Failed to fetch SOS tracking info"))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Connecting to Emergency Tracker...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">SOS Link Unavailable</h1>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <p className="text-xs text-slate-400">
            If you believe someone is in immediate danger, please dial local emergency services: 112 (India).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Urgent header */}
        <div className="p-4 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-red-400 uppercase tracking-wider">
                Emergency Live Location Shared
              </div>
              <div className="text-xs text-slate-300">
                {data.riderFirstName} has triggered an active SOS alert on Ridely.
              </div>
            </div>
          </div>
          <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black animate-pulse">
            LIVE
          </div>
        </div>

        {/* Live Map */}
        <div className="h-80 md:h-96 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <MapView
            pickup={{
              lat: data.currentLat || 19.076,
              lng: data.currentLng || 72.8777,
              address: data.pickupAddress,
            }}
            dropoff={{
              lat: 19.086,
              lng: 72.8877,
              address: data.dropoffAddress,
            }}
            driverLocation={{
              lat: data.currentLat || 19.076,
              lng: data.currentLng || 72.8777,
            }}
            status="in_progress"
            className="h-full w-full"
          />
        </div>

        {/* Vehicle & Trip Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              Driver & Vehicle Info
            </h3>
            <div>
              <div className="text-lg font-bold text-white">{data.driverName || "Assigned Driver"}</div>
              <div className="text-xs text-slate-400">
                {data.vehicleMake} {data.vehicleModel} ({data.vehicleColor})
              </div>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-800 text-emerald-400 rounded-lg text-sm font-mono font-bold">
                {data.vehiclePlate || "MH 02 BG 4512"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Trip Route
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500">From: </span>
                <span className="text-white font-medium">{data.pickupAddress}</span>
              </div>
              <div>
                <span className="text-slate-500">To: </span>
                <span className="text-white font-medium">{data.dropoffAddress}</span>
              </div>
              <div>
                <span className="text-slate-500">Current Status: </span>
                <span className="text-emerald-400 font-bold uppercase">{data.rideStatus || "In Progress"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          Disclaimer: This web tracker provides vehicle telemetry via Ridely servers. In case of genuine emergency, please contact police at 112 directly.
        </div>
      </div>
    </div>
  );
}

