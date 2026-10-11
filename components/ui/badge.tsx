import * as React from "react";
import { cn } from "@/lib/utils";
import { RideStatus } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | RideStatus;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-800",
    outline: "border border-slate-200 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    // Ride status tokens from UI/UX design spec §2.4
    requested: "bg-amber-100 text-amber-800 border border-amber-200",
    accepted: "bg-blue-100 text-blue-800 border border-blue-200",
    arrived: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    in_progress: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    completed: "bg-green-100 text-green-800 border border-green-200",
    cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
    expired: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  const badgeStyle = styles[variant] || styles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
        badgeStyle,
        className
      )}
      {...props}
    />
  );
}

