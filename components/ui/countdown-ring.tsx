import React from "react";

export function CountdownRing({
  remainingSeconds,
  totalSeconds = 30,
  size = 54,
  strokeWidth = 4,
}: {
  remainingSeconds: number;
  totalSeconds?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, remainingSeconds / totalSeconds);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={remainingSeconds > 5 ? "#10B981" : "#DC2626"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums text-slate-800">
        {remainingSeconds}s
      </span>
    </div>
  );
}

