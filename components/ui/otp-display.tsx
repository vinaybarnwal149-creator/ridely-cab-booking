import React from "react";
import { ShieldCheck } from "lucide-react";

export function OtpDisplay({ otp }: { otp: string }) {
  const digits = otp.split("");

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
      <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        Share OTP with Driver
      </div>
      <div className="flex gap-2.5">
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className="w-12 h-14 bg-white border-2 border-emerald-400 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-sm"
          >
            {digit}
          </div>
        ))}
      </div>
      <p className="text-xs text-emerald-700/80 mt-2 text-center">
        Only share when you are inside the cab
      </p>
    </div>
  );
}

