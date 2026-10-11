"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LifeBuoy, Plus, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SupportTicket } from "@/lib/types";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/support/tickets")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setTickets(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-emerald-600" />
            Support Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View active support threads or file a new query
          </p>
        </div>

        <Link href="/support/new">
          <Button size="md">
            <Plus className="w-4 h-4 mr-1.5" />
            New Ticket
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading tickets...</div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/support/${t.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === "open" ? "warning" : "success"}>
                    {t.status}
                  </Badge>
                  <span className="text-xs text-slate-400 uppercase font-bold">
                    {t.category.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t.subject}
                </div>
                <div className="text-xs text-slate-400">
                  Last updated: {formatDateTime(t.updatedAt || t.createdAt)}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No support tickets</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Everything seems to be running smoothly! Have an issue or need assistance?
          </p>
          <Link href="/support/new" className="inline-block pt-2">
            <span className="text-xs font-bold text-emerald-700 hover:underline">
              Create a support ticket &rarr;
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

