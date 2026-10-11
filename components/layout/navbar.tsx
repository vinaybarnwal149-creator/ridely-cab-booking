"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Bell, Power, User } from "lucide-react";
import { Profile, DriverProfile } from "@/lib/types";
import { env } from "@/lib/env";

function NavbarContent() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const appName = env.NEXT_PUBLIC_APP_NAME || "Ridely";

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setProfile(res.data.profile);
          setUnreadCount(res.data.unreadNotifications || 0);
          if (res.data.driverProfile) {
            setIsDriverOnline(res.data.driverProfile.isOnline);
          }
        }
      })
      .catch((err) => console.error("Error fetching session:", err));
  }, []);

  const toggleOnline = async () => {
    const nextState = !isDriverOnline;
    setIsDriverOnline(nextState);
    try {
      await fetch("/api/driver/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: nextState }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isDriver = profile?.role === "driver";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000] text-[#ffffff] h-14 flex items-center px-4 sm:px-8 border-b border-[#333333]">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#ffffff]">
            <span>{appName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-normal">
            {!isDriver && !isAdmin && (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:opacity-80 transition-opacity ${
                    pathname === "/dashboard" ? "font-semibold underline underline-offset-4" : "text-[#ffffff]"
                  }`}
                >
                  Ride
                </Link>
                <Link
                  href="/book"
                  className={`hover:opacity-80 transition-opacity ${
                    pathname === "/book" ? "font-semibold underline underline-offset-4" : "text-[#ffffff]"
                  }`}
                >
                  Book
                </Link>
                <Link
                  href="/history"
                  className={`hover:opacity-80 transition-opacity ${
                    pathname.startsWith("/history") ? "font-semibold underline underline-offset-4" : "text-[#ffffff]"
                  }`}
                >
                  Activity
                </Link>
                <Link
                  href="/support"
                  className={`hover:opacity-80 transition-opacity ${
                    pathname.startsWith("/support") ? "font-semibold underline underline-offset-4" : "text-[#ffffff]"
                  }`}
                >
                  Help
                </Link>
              </>
            )}

            {isDriver && (
              <>
                <Link href="/driver" className="hover:opacity-80 text-[#ffffff]">Driver Home</Link>
                <Link href="/driver/earnings" className="hover:opacity-80 text-[#ffffff]">Earnings</Link>
                <Link href="/driver/history" className="hover:opacity-80 text-[#ffffff]">Trips</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link href="/admin" className="hover:opacity-80 text-[#ffffff]">Overview</Link>
                <Link href="/admin/drivers" className="hover:opacity-80 text-[#ffffff]">Drivers</Link>
                <Link href="/admin/rides" className="hover:opacity-80 text-[#ffffff]">Rides</Link>
                <Link href="/admin/promos" className="hover:opacity-80 text-[#ffffff]">Promos</Link>
                <Link href="/admin/pricing" className="hover:opacity-80 text-[#ffffff]">Pricing</Link>
                <Link href="/admin/sos" className="hover:opacity-80 text-[#ffffff]">SOS Desk</Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isDriver && (
            <button
              onClick={toggleOnline}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isDriverOnline ? "bg-[#ffffff] text-[#000000]" : "bg-[#333333] text-[#ffffff]"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isDriverOnline ? "ONLINE" : "OFFLINE"}
            </button>
          )}

          <Link href="/notifications" className="p-2 text-[#ffffff] hover:bg-[#333333] rounded-full transition-colors relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9dcdd6]" />}
          </Link>

          <Link
            href={isDriver ? "/driver/profile" : "/profile"}
            className="bg-[#ffffff] text-[#000000] px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#f6f6f6] transition-colors"
          >
            {profile?.fullName ? profile.fullName.split(" ")[0] : "Log in"}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<header className="h-14 bg-[#000000]" />}>
      <NavbarContent />
    </Suspense>
  );
}
