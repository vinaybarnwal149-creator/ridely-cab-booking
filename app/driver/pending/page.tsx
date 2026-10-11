"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverProfile } from "@/lib/types";

export default function DriverPendingPage() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  const checkStatus = () => {
    fetch("/api/driver/application")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setProfile(res.data);
      });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const isApproved = profile?.status === "approved";

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-md ${
        isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}>
        {isApproved ? <ShieldCheck className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-spin" />}
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900">
          {isApproved ? "Application Approved! 🎉" : "Application Under Review"}
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          {isApproved
            ? "Your documents have been verified by the Ridely safety desk. You can now go online to accept ride requests."
            : "Our verification team is reviewing your vehicle plate and commercial driver's license. This typically takes 2–4 hours during business days."}
        </p>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        {isApproved ? (
          <Link href="/driver">
            <Button size="lg" className="w-full">
              Open Driver Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button onClick={checkStatus} variant="outline" size="md" className="w-full">
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh Approval Status
          </Button>
        )}

        <Link href="/help" className="text-xs text-slate-400 hover:text-slate-600">
          Have questions? Visit Help Center
        </Link>
      </div>
    </div>
  );
}

