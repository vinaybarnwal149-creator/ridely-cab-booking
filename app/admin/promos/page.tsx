"use client";

import React, { useEffect, useState } from "react";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoCode } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState(20);
  const [maxDiscountPaise, setMaxDiscountPaise] = useState(5000);
  const [minFarePaise, setMinFarePaise] = useState(10000);
  const [firstRideOnly, setFirstRideOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/admin/promos");
      const data = await res.json();
      if (data.ok) setPromos(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          type,
          value,
          maxDiscountPaise,
          minFarePaise,
          firstRideOnly,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Promo ${code.toUpperCase()} created!`);
        setCode("");
        setDescription("");
        fetchPromos();
      } else {
        toast.error(data.error?.message || "Failed to create promo");
      }
    } catch {
      toast.error("Error creating promo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Tag className="w-6 h-6 text-emerald-600" />
          Promotions & Discount Codes
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage customer discounts and first-ride incentives</p>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {p.code}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                {p.type === "percent" ? `${p.value}% OFF` : `₹${p.value / 100} OFF`}
              </span>
            </div>
            <p className="text-xs text-slate-600">{p.description}</p>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              Min Fare: ₹{p.minFarePaise / 100} {p.firstRideOnly && "· First ride only"}
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Create New Promo Code</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Promo Code</label>
            <input
              type="text"
              required
              placeholder="e.g. MONSOON20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Discount Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "flat")}
              className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="percent">Percentage Discount</option>
              <option value="flat">Flat Amount (Paise)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
          <input
            type="text"
            required
            placeholder="e.g. 20% off up to ₹50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Value ({type === "percent" ? "%" : "Paise"})</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Max Discount (Paise)</label>
            <input
              type="number"
              value={maxDiscountPaise}
              onChange={(e) => setMaxDiscountPaise(Number(e.target.value))}
              className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Min Fare (Paise)</label>
            <input
              type="number"
              value={minFarePaise}
              onChange={(e) => setMinFarePaise(Number(e.target.value))}
              className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Promo Code
        </Button>
      </form>
    </div>
  );
}

