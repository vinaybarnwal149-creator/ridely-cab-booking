"use client";

import React, { useEffect, useState } from "react";
import { Check, X, Car, Shield, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { DriverProfile, Profile } from "@/lib/types";
import { toast } from "sonner";

interface DriverWithProfile extends DriverProfile {
  user?: Profile;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverWithProfile[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(true);

  // Reject dialog state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers?status=${tab}`);
      const data = await res.json();
      if (data.ok) setDrivers(data.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [tab]);

  const handleApprove = async (driverId: string) => {
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Driver approved! Account unlocked.");
        fetchDrivers();
      } else {
        toast.error("Failed to approve driver");
      }
    } catch {
      toast.error("Error communicating with server");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/drivers/${rejectingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        toast.info("Application rejected with reason provided");
        setRejectingId(null);
        setRejectReason("");
        fetchDrivers();
      } else {
        toast.error("Failed to reject driver");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Approvals Desk</h1>
        <p className="text-xs text-slate-500 mt-0.5">Review commercial licenses, vehicle plates, and authorize drivers</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === "pending" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === "approved" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
          }`}
        >
          Approved Active
        </button>
        <button
          onClick={() => setTab("rejected")}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === "rejected" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
          }`}
        >
          Rejected
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading driver records...</div>
      ) : drivers.length > 0 ? (
        <div className="space-y-4">
          {drivers.map((d) => (
            <div
              key={d.userId}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                    {d.user?.fullName ? d.user.fullName[0] : "D"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{d.user?.fullName || d.userId}</h3>
                    <div className="text-xs text-slate-500">{d.user?.email} · {d.user?.phone}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400">Vehicle:</span>
                    <div className="font-bold text-slate-800">{d.vehicleMake} {d.vehicleModel}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Plate Number:</span>
                    <div className="font-mono font-bold text-slate-900">{d.vehiclePlate}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">License No.:</span>
                    <div className="font-mono text-slate-800">{d.licenseNumber || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <div className="font-bold uppercase text-emerald-700">{d.rideTypeCode || "mini"}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {tab === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => setRejectingId(d.userId)}
                    variant="outline"
                    size="md"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(d.userId)}
                    size="md"
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Approve Driver
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-xs text-slate-400">No driver profiles under this filter.</p>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject Driver Application"
        description="Provide a clear reason so the driver can correct and resubmit."
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. License photo blurry or expired registration plate."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              isLoading={isSubmitting}
              variant="danger"
              size="sm"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

