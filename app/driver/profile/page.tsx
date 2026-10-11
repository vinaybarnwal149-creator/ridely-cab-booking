"use client";

import React, { useEffect, useState } from "react";
import { User, Car, ShieldCheck, Star } from "lucide-react";
import { DriverProfile, Profile } from "@/lib/types";

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [driverProf, setDriverProf] = useState<DriverProfile | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setProfile(res.data.profile);
          setDriverProf(res.data.driverProfile);
        }
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Partner Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your vehicle details, ratings, and documentation status</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile?.fullName ? profile.fullName[0] : "D"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.fullName || "Driver Partner"}</h2>
            <div className="text-xs text-slate-500">{profile?.email} · {profile?.phone}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{driverProf?.avgRating || "4.9"} rating ({driverProf?.ratingCount || 140} reviews)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider">Registered Vehicle</h3>
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
            <div>
              <span className="text-slate-400">Make & Model:</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {driverProf?.vehicleMake || "Maruti"} {driverProf?.vehicleModel || "Swift Dzire"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Plate Number:</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {driverProf?.vehiclePlate || "MH 02 BG 4512"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Color:</span>
              <div className="font-bold text-slate-900 mt-0.5">{driverProf?.vehicleColor || "Silver"}</div>
            </div>
            <div>
              <span className="text-slate-400">Ride Type:</span>
              <div className="font-bold uppercase text-emerald-700 mt-0.5">{driverProf?.rideTypeCode || "mini"}</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Status: Verified & Approved Driver Partner</span>
        </div>
      </div>
    </div>
  );
}

