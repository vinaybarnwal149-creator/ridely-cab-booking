"use client";

import React from "react";
import { MapPin, Navigation, Car, Shield } from "lucide-react";
import { RideStop } from "@/lib/types";

interface MapViewProps {
  pickup?: { lat: number; lng: number; address?: string };
  dropoff?: { lat: number; lng: number; address?: string };
  stops?: RideStop[];
  driverLocation?: { lat: number; lng: number; heading?: number };
  status?: string;
  className?: string;
}

export function MapView({
  pickup,
  dropoff,
  stops = [],
  driverLocation,
  status,
  className = "h-80 md:h-full w-full",
}: MapViewProps) {
  return (
    <div
      className={`relative bg-slate-100 overflow-hidden border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Visual map background grid mimicking city blocks */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundColor: "#f8fafc",
        }}
      />

      {/* Decorative road lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 50 150 Q 200 80, 350 220 T 650 180"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="32"
          strokeLinecap="round"
        />
        {/* Active route polyline in brand green */}
        <path
          d="M 120 180 Q 240 100, 380 200 T 580 160"
          fill="none"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Markers layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-around px-8">
        {/* Pickup Pin */}
        <div className="flex flex-col items-center animate-bounce duration-1000">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="mt-1 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-emerald-900 rounded-md shadow-xs border border-emerald-100 max-w-[130px] truncate">
            {pickup?.address ? pickup.address.split(",")[0] : "Pickup"}
          </span>
        </div>

        {/* Live Driver Car Marker */}
        {(driverLocation || status === "accepted" || status === "arrived" || status === "in_progress") && (
          <div className="flex flex-col items-center transition-all duration-700">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl border-2 border-white ring-8 ring-emerald-400/30">
                <Car className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-medium rounded-md shadow-xs">
              Driver Live
            </span>
          </div>
        )}

        {/* Dropoff Pin */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-slate-900/20">
            <Navigation className="w-5 h-5" />
          </div>
          <span className="mt-1 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-slate-900 rounded-md shadow-xs border border-slate-200 max-w-[130px] truncate">
            {dropoff?.address ? dropoff.address.split(",")[0] : "Drop-off"}
          </span>
        </div>
      </div>

      {/* Safety / GPS Watermark */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-xs">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        GPS Tracking Active · Mumbai
      </div>
    </div>
  );
}

