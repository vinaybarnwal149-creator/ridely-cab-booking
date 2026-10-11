"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/utils";
import { RideType } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPricingPage() {
  const [rideTypes, setRideTypes] = useState<RideType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.ok) setRideTypes(data.data.rideTypes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleUpdate = async (rt: RideType) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideTypeCode: rt.code,
          baseFarePaise: rt.baseFarePaise,
          perKmPaise: rt.perKmPaise,
          perMinPaise: rt.perMinPaise,
          minFarePaise: rt.minFarePaise,
        }),
      });
      if (res.ok) {
        toast.success(`Pricing for ${rt.name} updated!`);
      } else {
        toast.error("Failed to update pricing");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          Vehicle Pricing Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure base, distance, and duration rates (all in paise)</p>
      </div>

      <div className="space-y-4">
        {rideTypes.map((rt, idx) => (
          <div key={rt.code} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{rt.name} ({rt.code.toUpperCase()})</h3>
                <span className="text-xs text-slate-400">{rt.capacity} passenger capacity</span>
              </div>
              <Button onClick={() => handleUpdate(rt)} isLoading={isSaving} size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Rates
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 uppercase">Base Fare (Paise)</label>
                <input
                  type="number"
                  value={rt.baseFarePaise}
                  onChange={(e) => {
                    const updated = [...rideTypes];
                    updated[idx].baseFarePaise = Number(e.target.value);
                    setRideTypes(updated);
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 uppercase">Per Km (Paise)</label>
                <input
                  type="number"
                  value={rt.perKmPaise}
                  onChange={(e) => {
                    const updated = [...rideTypes];
                    updated[idx].perKmPaise = Number(e.target.value);
                    setRideTypes(updated);
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 uppercase">Per Min (Paise)</label>
                <input
                  type="number"
                  value={rt.perMinPaise}
                  onChange={(e) => {
                    const updated = [...rideTypes];
                    updated[idx].perMinPaise = Number(e.target.value);
                    setRideTypes(updated);
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 uppercase">Min Fare (Paise)</label>
                <input
                  type="number"
                  value={rt.minFarePaise}
                  onChange={(e) => {
                    const updated = [...rideTypes];
                    updated[idx].minFarePaise = Number(e.target.value);
                    setRideTypes(updated);
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

