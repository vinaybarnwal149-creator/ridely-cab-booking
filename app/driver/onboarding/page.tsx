"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DriverOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [rideTypeCode, setRideTypeCode] = useState<string>("mini");
  const [vehicleMake, setVehicleMake] = useState<string>("Maruti");
  const [vehicleModel, setVehicleModel] = useState<string>("Swift Dzire");
  const [vehicleYear, setVehicleYear] = useState<number>(2023);
  const [vehicleColor, setVehicleColor] = useState<string>("White");
  const [vehiclePlate, setVehiclePlate] = useState<string>("MH 02 AB 1234");
  const [licenseNumber, setLicenseNumber] = useState<string>("MH02 20180012345");
  const [licenseExpiry, setLicenseExpiry] = useState<string>("2030-12-31");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/driver/application", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideTypeCode,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleColor,
          vehiclePlate,
          licenseNumber,
          licenseExpiry,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Application submitted for review!");
        router.push("/driver/pending");
      } else {
        toast.error(data.error?.message || "Failed to submit application");
      }
    } catch {
      toast.error("Network error submitting application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Driver Partner Application</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete vehicle registration and commercial licensing details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase">Ride Category</label>
          <select
            value={rideTypeCode}
            onChange={(e) => setRideTypeCode(e.target.value)}
            className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="bike">Bike (Two-wheeler)</option>
            <option value="auto">Auto (Three-wheeler)</option>
            <option value="mini">Mini (Hatchback)</option>
            <option value="sedan">Sedan (Comfort)</option>
            <option value="xl">XL (SUV / 6 seats)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Vehicle Make</label>
            <input
              type="text"
              required
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Vehicle Model</label>
            <input
              type="text"
              required
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">License Plate Number</label>
            <input
              type="text"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Vehicle Color</label>
            <input
              type="text"
              required
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Driving License No.</label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">License Expiry Date</label>
            <input
              type="date"
              required
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full h-12 text-base font-bold">
          Submit Application
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

