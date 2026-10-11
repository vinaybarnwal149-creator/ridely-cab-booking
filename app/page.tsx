import Link from "next/link";
import {
  Car,
  Calendar,
  Utensils,
  Package,
  Clock,
  ArrowRight,
  Shield,
  CreditCard,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { SEED_RIDE_TYPES } from "@/lib/db/mock-db";
import { formatPaise } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#000000]">
      {/* Hero Section — Strict Uber Transit Kiosk split view */}
      <section className="w-full bg-[#ffffff] pt-8 pb-16 border-b border-[#f6f6f6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left 7 cols: Booking Kiosk Form */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              
              {/* Mode Selector Pill */}
              <div className="inline-flex items-center bg-[#f6f6f6] rounded-full p-1 gap-1">
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#000000] text-[#ffffff] text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Pickup now
                </span>
                <span className="px-4 py-2 rounded-full text-[#000000] text-sm font-medium hover:bg-[#eaeaea] cursor-pointer transition-colors">
                  Schedule ahead
                </span>
              </div>

              {/* Headline — UberMove display style */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-normal tracking-tight text-[#000000] leading-[1.18]">
                Go anywhere with Ridely
              </h1>

              <p className="text-[#5e5e5e] text-base max-w-lg leading-relaxed">
                Request a ride, hop in, and go. Upfront integer pricing, verified 4-digit ride OTPs, and instant 24/7 SOS tracking across India.
              </p>

              {/* Transit Kiosk Input Stack */}
              <div className="w-full max-w-lg bg-[#ffffff] border border-[#767676] rounded-[8px] p-4 relative">
                {/* Vertical timeline connector */}
                <div className="absolute left-7 top-[34px] bottom-[34px] w-[2px] bg-[#000000]"></div>

                <div className="space-y-3">
                  {/* Pickup */}
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#000000] z-10 shrink-0"></div>
                    <div className="flex-1 bg-[#f6f6f6] rounded-[8px] px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-[#000000] text-sm font-normal">Chhatrapati Shivaji Maharaj Terminus</span>
                      <MapPin className="w-4 h-4 text-[#767676]" />
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#000000] z-10 shrink-0"></div>
                    <div className="flex-1 bg-[#f6f6f6] rounded-[8px] px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-[#767676] text-sm">Bandra Kurla Complex (BKC)</span>
                      <ArrowRight className="w-4 h-4 text-[#767676]" />
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="mt-4 pt-3 border-t border-[#f6f6f6] flex items-center justify-between">
                  <div className="text-xs text-[#767676]">
                    Estimated from <strong className="text-[#000000]">₹180</strong>
                  </div>
                  <Link href="/book" className="w-auto">
                    <button className="bg-[#000000] text-[#ffffff] px-6 py-2.5 rounded-[8px] text-sm font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2">
                      See prices
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

            </div>

            {/* Right 5 cols: Monochrome Transit Illustration Panel */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full aspect-[4/3] max-w-[420px] bg-[#f6f6f6] rounded-[8px] border border-[#e5e5e5] p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#767676] font-semibold">Live Fleet Kiosk</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#000000] font-medium bg-[#ffffff] px-2.5 py-1 rounded-full border border-[#e5e5e5]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available in Mumbai
                  </span>
                </div>

                {/* Flat Graphic Representation */}
                <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#000000] flex items-center justify-center text-[#ffffff] mb-3">
                    <Car className="w-10 h-10" />
                  </div>
                  <p className="text-[#000000] text-lg font-medium">Anywhere, anytime</p>
                  <p className="text-xs text-[#767676] mt-1">Direct point-to-point transit on demand</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5] text-xs text-[#767676]">
                  <span>4 Ride Classes</span>
                  <Link href="/book" className="text-[#000000] font-medium hover:underline flex items-center gap-1">
                    Book online <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Suggestions Section — 4 Category Tiles with #f6f6f6 background & 8px radius */}
      <section className="w-full py-16 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-normal text-[#000000] mb-8 leading-tight">
            Suggestions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tile 1: Ride */}
            <Link href="/book" className="group">
              <div className="bg-[#f6f6f6] rounded-[8px] p-6 h-full flex flex-col justify-between hover:bg-[#eeeeee] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[#000000]">Ride</h3>
                    <p className="text-sm text-[#5e5e5e] mt-1">Go anywhere with Ridely. Request a ride, hop in.</p>
                  </div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#ffffff] flex items-center justify-center text-[#000000] shrink-0 ml-3">
                    <Car className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 text-sm font-medium text-[#000000] underline group-hover:no-underline">
                  Details
                </div>
              </div>
            </Link>

            {/* Tile 2: Reserve */}
            <Link href="/book" className="group">
              <div className="bg-[#f6f6f6] rounded-[8px] p-6 h-full flex flex-col justify-between hover:bg-[#eeeeee] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[#000000]">Reserve</h3>
                    <p className="text-sm text-[#5e5e5e] mt-1">Reserve your ride in advance so you can relax.</p>
                  </div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#ffffff] flex items-center justify-center text-[#000000] shrink-0 ml-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 text-sm font-medium text-[#000000] underline group-hover:no-underline">
                  Details
                </div>
              </div>
            </Link>

            {/* Tile 3: Driver */}
            <Link href="/driver/onboarding" className="group">
              <div className="bg-[#f6f6f6] rounded-[8px] p-6 h-full flex flex-col justify-between hover:bg-[#eeeeee] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[#000000]">Drive</h3>
                    <p className="text-sm text-[#5e5e5e] mt-1">Earn on your own terms. Low 20% platform commission.</p>
                  </div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#ffffff] flex items-center justify-center text-[#000000] shrink-0 ml-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 text-sm font-medium text-[#000000] underline group-hover:no-underline">
                  Details
                </div>
              </div>
            </Link>

            {/* Tile 4: Safety */}
            <Link href="/help" className="group">
              <div className="bg-[#f6f6f6] rounded-[8px] p-6 h-full flex flex-col justify-between hover:bg-[#eeeeee] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[#000000]">Safety</h3>
                    <p className="text-sm text-[#5e5e5e] mt-1">Strict ride OTPs, verified drivers, live SOS links.</p>
                  </div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#ffffff] flex items-center justify-center text-[#000000] shrink-0 ml-3">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 text-sm font-medium text-[#000000] underline group-hover:no-underline">
                  Details
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Ride Classes Section */}
      <section className="w-full py-16 bg-[#ffffff] border-t border-[#f6f6f6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-normal text-[#000000] leading-tight">
                Ride with Ridely
              </h2>
              <p className="text-[#5e5e5e] text-sm mt-1">Choose the ride option that fits your journey and budget.</p>
            </div>
            <Link href="/book" className="text-sm font-medium text-[#000000] hover:underline flex items-center gap-1">
              Explore all fares <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEED_RIDE_TYPES.map((rt) => (
              <div
                key={rt.code}
                className="bg-[#ffffff] rounded-[8px] p-6 border border-[#e5e5e5] flex flex-col items-start hover:border-[#000000] transition-colors"
              >
                <div className="w-12 h-12 rounded-[8px] bg-[#f6f6f6] flex items-center justify-center mb-4 text-[#000000]">
                  <Car className="w-6 h-6" />
                </div>
                <div className="text-lg font-medium text-[#000000]">{rt.name}</div>
                <div className="text-xs text-[#767676] mb-3">{rt.capacity} passenger capacity</div>
                <div className="text-sm text-[#5e5e5e] mb-4">
                  From <strong className="text-[#000000]">{formatPaise(rt.minFarePaise)}</strong> min fare
                </div>
                <div className="mt-auto text-xs font-normal text-[#767676] flex items-center">
                  Base {formatPaise(rt.baseFarePaise)} · {formatPaise(rt.perKmPaise)}/km
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="w-full py-16 bg-[#000000] text-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight mb-4 leading-tight">
                Your safety is built into every ride
              </h2>
              <p className="text-[#afafaf] text-base mb-6 leading-relaxed">
                Every journey comes with real-time GPS monitoring, strict 4-digit driver OTP verification, and an instant Emergency SOS button that immediately sends live tracking links to your family.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/profile">
                  <button className="bg-[#ffffff] text-[#000000] px-6 py-2.5 rounded-[8px] text-sm font-normal hover:bg-[#f6f6f6] transition-colors cursor-pointer">
                    Set Emergency Contacts
                  </button>
                </Link>
                <Link href="/help">
                  <button className="border border-[#767676] text-[#ffffff] px-6 py-2.5 rounded-[8px] text-sm font-normal hover:bg-[#333333] transition-colors cursor-pointer">
                    Learn About Safety
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-[8px] bg-[#1a1a1a] border border-[#333333] flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#000000] text-[#ffffff] border border-[#333333] flex items-center justify-center font-bold text-xs">
                  OTP
                </div>
                <div>
                  <h3 className="font-medium text-[#ffffff] text-sm">4-Digit Ride OTP</h3>
                  <p className="text-xs text-[#afafaf] mt-0.5">Driver cannot start trip without the 4 digits only you see.</p>
                </div>
              </div>

              <div className="p-5 rounded-[8px] bg-[#1a1a1a] border border-[#333333] flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#000000] text-[#ffffff] border border-[#333333] flex items-center justify-center font-bold text-xs">
                  SOS
                </div>
                <div>
                  <h3 className="font-medium text-[#ffffff] text-sm">Emergency Public Tracking</h3>
                  <p className="text-xs text-[#afafaf] mt-0.5">Instant public tracking link shared to police and contacts.</p>
                </div>
              </div>

              <div className="p-5 rounded-[8px] bg-[#1a1a1a] border border-[#333333] flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#000000] text-[#ffffff] border border-[#333333] flex items-center justify-center font-bold text-xs">
                  ID
                </div>
                <div>
                  <h3 className="font-medium text-[#ffffff] text-sm">Verified Vehicle & Driver</h3>
                  <p className="text-xs text-[#afafaf] mt-0.5">Every plate number, license, and driver profile is verified.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver CTA Section */}
      <section className="w-full py-16 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-normal text-[#000000] leading-tight">
              Earn on your own terms. Drive with Ridely.
            </h2>
            <p className="text-[#5e5e5e] text-base mt-2">
              Enjoy 20% platform commission, fast payouts, instant online toggle, and 24/7 dedicated support.
            </p>
          </div>
          <Link href="/driver/onboarding" className="shrink-0">
            <button className="bg-[#000000] text-[#ffffff] px-8 py-3.5 rounded-[8px] text-base font-normal hover:bg-[#333333] transition-colors cursor-pointer">
              Start Driving Today
            </button>
          </Link>
        </div>
      </section>

      {/* Sticky Bottom Bar — Uber transit kiosk sticky conversion anchor */}
      <div className="sticky bottom-0 z-30 w-full bg-[#000000] text-[#ffffff] h-14 flex items-center justify-center cursor-pointer border-t border-[#333333]">
        <Link href="/book" className="w-full h-full flex items-center justify-center hover:bg-[#222222] transition-colors text-base font-normal text-[#ffffff]">
          See prices
        </Link>
      </div>

    </div>
  );
}
