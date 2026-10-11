"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SupportTicket, TicketMessage } from "@/lib/types";
import { toast } from "sonner";

export default function SupportThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`);
      const data = await res.json();
      if (data.ok) setTicket(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const data = await res.json();
      if (data.ok) {
        setReplyBody("");
        fetchTicket();
        toast.success("Reply sent");
      }
    } catch {
      toast.error("Error sending reply");
    } finally {
      setIsSending(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">Loading support thread...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link href="/support" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to tickets
      </Link>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900">{ticket.subject}</h1>
            <Badge variant={ticket.status === "open" ? "warning" : "success"}>
              {ticket.status}
            </Badge>
          </div>
          <span className="text-xs text-slate-400 uppercase font-bold">
            {ticket.category.replace("_", " ")}
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 pt-4 border-t border-slate-100 min-h-[200px]">
          {ticket.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl ${
                msg.isAdmin
                  ? "bg-purple-50 border border-purple-100 text-purple-950 ml-6"
                  : "bg-slate-50 border border-slate-200/70 text-slate-800 mr-6"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  {msg.isAdmin ? (
                    <>
                      <Shield className="w-3 h-3 text-purple-600" />
                      Ridely Support Agent
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-slate-500" />
                      You
                    </>
                  )}
                </span>
                <span className="text-slate-400 font-normal">
                  {formatDateTime(msg.createdAt)}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{msg.body}</p>
            </div>
          ))}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            required
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Type your reply here..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Button type="submit" isLoading={isSending} size="sm" className="px-4">
            <Send className="w-4 h-4 mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

