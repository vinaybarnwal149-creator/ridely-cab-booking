"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export default function PayRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [cardNumber, setCardNumber] = useState<string>("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState<string>("12/28");
  const [cvv, setCvv] = useState<string>("123");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/rides/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRide(res.data);
      });
  }, [id]);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/rides/${id}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        setIsPaid(true);
        toast.success("Payment succeeded! Receipt generated.");
        setTimeout(() => {
          router.push(`/rides/${id}/rate`);
        }, 1500);
      } else {
        toast.error(data.error?.message || "Payment failed");
      }
    } catch {
      toast.error("Network error during payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">Loading payment details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Trip Payment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Secure test mode checkout</p>
        </div>

        {/* Amount Card */}
        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-center">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Total Amount Due
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
            {formatPaise(ride.totalFarePaise)}
          </div>
        </div>

        {/* Card Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Card Number (Stripe Test Card)</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Expiry (MM/YY)</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Encrypted with 256-bit SSL. PCI-DSS compliant.</span>
        </div>

        <Button
          onClick={handlePay}
          isLoading={isProcessing}
          disabled={isPaid}
          size="lg"
          className="w-full h-12 text-base font-bold shadow-md"
        >
          {isPaid ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              Paid Successfully
            </span>
          ) : (
            `Pay ${formatPaise(ride.totalFarePaise)} Now`
          )}
        </Button>
      </div>
    </div>
  );
}

