import Link from "next/link";
import { ArrowRight, Smartphone, CreditCard } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 bg-[#ffffff] text-[#000000]">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#000000] tracking-tight mb-3">
          How Ridely Works
        </h1>
        <p className="text-base text-[#5e5e5e] max-w-2xl">
          Everything you need to know about riding and driving with clear pricing and verified safety.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* For Riders */}
        <div className="bg-[#f6f6f6] rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="w-5 h-5 text-[#000000]" />
              <h2 className="text-xl font-medium text-[#000000]">For Riders</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Requesting a Ride</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Enter pickup, destination, and up to 3 intermediate stops. Transparent fares are calculated upfront before booking.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Matching & Live Tracking</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Nearby verified drivers receive your offer. View vehicle model, license plate, and live driver ETA on the map.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Strict Ride OTP</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">For your security, your driver must enter your unique 4-digit OTP shown on your screen before the ride can begin.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">4</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Payment & Tax Invoices</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Pay with card or cash. Receive a complete tax breakdown and invoice PDF sent immediately to your email.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
            <Link href="/book">
              <button className="bg-[#000000] text-[#ffffff] px-6 py-2.5 rounded-[8px] text-xs font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2">
                Book a Ride <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* For Drivers */}
        <div className="bg-[#f6f6f6] rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-[#000000]" />
              <h2 className="text-xl font-medium text-[#000000]">For Drivers</h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Sign Up & Upload Documents</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Submit vehicle details, commercial badge, and driving license. Verified promptly by admin compliance desk.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Toggle Online Anytime</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Work on your own terms. Incoming trip requests display pickup distance and net payout with a 30s timer.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#000000] text-[#ffffff] font-normal text-xs flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-[#000000] text-sm">Transparent 20% Commission</h3>
                  <p className="text-xs text-[#5e5e5e] mt-1 leading-relaxed">Keep 80% of every fare. Payouts processed directly to your linked bank account with full trip-by-trip telemetry.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
            <Link href="/driver/onboarding">
              <button className="bg-[#000000] text-[#ffffff] px-6 py-2.5 rounded-[8px] text-xs font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2">
                Register as Driver <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
