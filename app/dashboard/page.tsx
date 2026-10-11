"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  ArrowRight,
  Clock,
  MapPin,
  Tag,
  ChevronRight,
} from "lucide-react";
import { formatPaise, formatDateTime } from "@/lib/utils";
import { Ride, Profile } from "@/lib/types";

export default function RiderDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setProfile(res.data.profile);
        }
      });

    fetch("/api/rides/active")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setActiveRide(res.data);
        }
      });

    fetch("/api/rides?pageSize=3")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setRecentRides(res.data.slice(0, 3));
        }
      });
  }, []);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8 bg-[#ffffff] text-[#000000]">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f6f6f6] p-6 rounded-[8px]">
        <div>
          <h1 className="text-2xl font-normal text-[#000000]">
            Welcome back, {profile?.fullName ? profile.fullName.split(" ")[0] : "Rider"}
          </h1>
          <p className="text-sm text-[#5e5e5e] mt-1">
            Where would you like to travel today?
          </p>
        </div>
        <Link href="/book">
          <button className="bg-[#000000] text-[#ffffff] px-6 py-2.5 rounded-[8px] text-sm font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2">
            Book a Ride Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Active Ride Alert Banner */}
      {activeRide && (
        <div className="bg-[#000000] text-[#ffffff] rounded-[8px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#333333] flex items-center justify-center shrink-0 text-[#ffffff]">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-medium bg-[#333333] px-2.5 py-0.5 rounded-full text-[#ffffff]">
                  Trip In Progress · {activeRide.status.toUpperCase()}
                </span>
              </div>
              <div className="text-base font-normal mt-1">
                Heading to {activeRide.dropoffAddress.split(",")[0]}
              </div>
              <div className="text-xs text-[#afafaf] mt-0.5">
                Total fare: {formatPaise(activeRide.totalFarePaise)}
              </div>
            </div>
          </div>
          <Link href={`/rides/${activeRide.id}`}>
            <button className="bg-[#ffffff] text-[#000000] px-5 py-2 rounded-[8px] text-xs font-normal hover:bg-[#f6f6f6] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
              Open Live Tracking
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* Quick Where-to Search */}
      <div className="bg-[#ffffff] rounded-[8px] p-6 border border-[#e5e5e5]">
        <h2 className="text-lg font-normal text-[#000000] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#000000]" />
          Quick Book
        </h2>
        <Link href="/book" className="block">
          <div className="flex items-center gap-3 p-4 bg-[#f6f6f6] hover:bg-[#eeeeee] rounded-[8px] transition-colors cursor-pointer group">
            <div className="w-3 h-3 rounded-full bg-[#000000]" />
            <span className="text-sm text-[#5e5e5e] group-hover:text-[#000000]">
              Search pickup or destination address...
            </span>
            <ArrowRight className="ml-auto w-4 h-4 text-[#767676] group-hover:text-[#000000]" />
          </div>
        </Link>
      </div>

      {/* Promo Banner */}
      <div className="bg-[#f6f6f6] rounded-[8px] p-6 border border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[8px] bg-[#000000] text-[#ffffff] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-medium text-[#000000]">Save 50% on your first ride!</div>
            <div className="text-xs text-[#5e5e5e] mt-0.5">
              Use promo code <span className="font-mono bg-[#ffffff] px-1.5 py-0.5 rounded border border-[#e5e5e5] text-[#000000]">WELCOME50</span> at checkout.
            </div>
          </div>
        </div>
        <Link href="/book">
          <button className="bg-[#000000] text-[#ffffff] px-4 py-2 rounded-[8px] text-xs font-normal hover:bg-[#333333] transition-colors cursor-pointer shrink-0">
            Apply Code
          </button>
        </Link>
      </div>

      {/* Recent Rides */}
      <div className="bg-[#ffffff] rounded-[8px] p-6 border border-[#e5e5e5]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-normal text-[#000000] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#000000]" />
            Recent Trips
          </h2>
          <Link href="/history" className="text-xs font-medium text-[#000000] hover:underline">
            View All History
          </Link>
        </div>

        {recentRides.length > 0 ? (
          <div className="space-y-3">
            {recentRides.map((ride) => (
              <Link
                key={ride.id}
                href={`/history/${ride.id}`}
                className="flex items-center justify-between p-4 rounded-[8px] border border-[#e5e5e5] hover:border-[#000000] transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-[#000000]">
                    {ride.dropoffAddress.split(",")[0]}
                  </div>
                  <div className="text-xs text-[#767676] mt-0.5">
                    {formatDateTime(ride.createdAt)} · {ride.rideTypeCode.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#000000]">
                    {formatPaise(ride.totalFarePaise)}
                  </div>
                  <span className="inline-block mt-1 text-[10px] uppercase font-medium bg-[#f6f6f6] px-2 py-0.5 rounded-full border border-[#e5e5e5] text-[#000000]">
                    {ride.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#767676]">
            No rides booked yet. Try booking your first trip above!
          </div>
        )}
      </div>
    </div>
  );
}
