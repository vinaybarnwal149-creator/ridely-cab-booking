"use client";

import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.ok) setNotifications(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", { method: "POST" });
      if (res.ok) {
        toast.success("All notifications marked as read");
        fetchNotifs();
      }
    } catch {
      toast.error("Error marking read");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay informed with real-time updates</p>
        </div>
        <Button onClick={markAllRead} variant="outline" size="sm">
          <CheckCheck className="w-4 h-4 mr-1.5" />
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all ${
                n.readAt
                  ? "bg-white border-slate-200/80 text-slate-700"
                  : "bg-emerald-50/60 border-emerald-200 text-slate-900 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-emerald-800">{n.title}</span>
                <span className="text-slate-400 font-normal">{formatDateTime(n.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-400 mt-1">Updates regarding your rides and payments will appear here.</p>
        </div>
      )}
    </div>
  );
}

