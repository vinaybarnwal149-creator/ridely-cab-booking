"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSupportTicketPage() {
  const router = useRouter();

  const [category, setCategory] = useState("ride_issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, description }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Ticket submitted! An agent will respond shortly.");
        router.push(`/support/${data.data.id}`);
      } else {
        toast.error("Failed to submit ticket");
      }
    } catch {
      toast.error("Network error submitting ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <Link href="/support" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to tickets
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h1 className="text-xl font-black text-slate-900">Create Support Ticket</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tell us what went wrong so we can resolve it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ride_issue">Ride Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="lost_item">Lost Item in Cab</option>
              <option value="driver_behaviour">Driver Behaviour</option>
              <option value="app_bug">App Bug</option>
              <option value="other">Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-700">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Fare charged incorrectly"
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-700">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details of the issue..."
              className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full">
            Submit Support Request
          </Button>
        </form>
      </div>
    </div>
  );
}

