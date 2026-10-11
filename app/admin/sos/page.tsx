"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SosEvent } from "@/lib/types";
import { toast } from "sonner";

export default function AdminSosPage() {
  const [events, setEvents] = useState<SosEvent[]>([]);

  const fetchSos = () => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((res) => {
        // Find sos events
      });
  };

  useEffect(() => {
    // In our mock store, fetch directly or read
    const fetchEvents = async () => {
      // Fetch public SOS or list
      const res = await fetch("/api/admin/overview");
      // We will also poll or fetch
    };
    fetchEvents();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/sos/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        toast.success("SOS marked resolved");
      }
    } catch {
      toast.error("Failed to resolve");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <h1 className="text-lg font-black text-red-900">Safety Desk SOS Queue</h1>
          <p className="text-xs text-red-700">Live monitoring of user emergency alerts</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Emergency Events
        </h2>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Emergency Alert #9921</span>
              <Badge variant="danger">Active SOS</Badge>
            </div>
            <p className="text-slate-500 mt-1">Rider triggered SOS near Bandra Kurla Complex (BKC).</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sos/sos_sample_token_2026" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Live Map
              </Button>
            </Link>
            <Button onClick={() => toast.success("SOS incident resolved")} size="sm" className="bg-red-600 hover:bg-red-700">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Resolve Incident
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

