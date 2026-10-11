"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Car, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver">("rider");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmRole = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error?.message || "Failed to set role");
        return;
      }

      toast.success(`Role selected: ${selectedRole.toUpperCase()}`);
      if (selectedRole === "driver") {
        router.push("/driver/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Network error while selecting role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-2">
        Welcome to Ridely
      </h1>
      <p className="text-sm text-slate-600 text-center mb-10 max-w-md">
        How do you plan to use Ridely today? You can choose one role per profile.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        {/* Rider Card */}
        <div
          onClick={() => setSelectedRole("rider")}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
            selectedRole === "rider"
              ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-500/10"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <User className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">I Need Rides</h3>
          <p className="text-xs text-slate-500">
            Book cabs, autos, and bikes with upfront pricing and safety features.
          </p>
        </div>

        {/* Driver Card */}
        <div
          onClick={() => setSelectedRole("driver")}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
            selectedRole === "driver"
              ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-500/10"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <Car className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">I Want to Drive</h3>
          <p className="text-xs text-slate-500">
            Earn money on flexible hours with low commission and quick payouts.
          </p>
        </div>
      </div>

      <Button
        onClick={handleConfirmRole}
        isLoading={isLoading}
        size="lg"
        className="w-full h-12 text-base font-semibold"
      >
        Continue as {selectedRole === "rider" ? "Rider" : "Driver Partner"}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

