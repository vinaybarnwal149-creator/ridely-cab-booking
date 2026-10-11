"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Car, User } from "lucide-react";

export function DevUserSwitcher() {
  const [currentUser, setCurrentUser] = useState<string>("user_rider_1");

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const userCookie = cookies.find((c) => c.trim().startsWith("ridely_user_id="));
    if (userCookie) {
      setCurrentUser(userCookie.split("=")[1].trim());
    }
  }, []);

  const switchUser = (userId: string) => {
    document.cookie = `ridely_user_id=${userId}; path=/; max-age=864000`;
    setCurrentUser(userId);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mr-1">
        <UserCheck className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Role Switcher:</span>
      </div>

      <button
        onClick={() => switchUser("user_rider_1")}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
          currentUser === "user_rider_1"
            ? "bg-emerald-500 text-white font-bold"
            : "hover:bg-slate-800 text-slate-300"
        }`}
      >
        <User className="w-3 h-3" />
        Rider
      </button>

      <button
        onClick={() => switchUser("driver_1")}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
          currentUser === "driver_1"
            ? "bg-emerald-500 text-white font-bold"
            : "hover:bg-slate-800 text-slate-300"
        }`}
      >
        <Car className="w-3 h-3" />
        Driver
      </button>

      <button
        onClick={() => switchUser("user_admin")}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
          currentUser === "user_admin"
            ? "bg-purple-600 text-white font-bold"
            : "hover:bg-slate-800 text-slate-300"
        }`}
      >
        <Shield className="w-3 h-3" />
        Admin
      </button>
    </div>
  );
}

