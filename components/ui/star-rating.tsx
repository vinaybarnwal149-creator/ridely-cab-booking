"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  maxRating = 5,
  size = 28,
  readOnly = false,
  onChange,
}: {
  rating: number;
  maxRating?: number;
  size?: number;
  readOnly?: boolean;
  onChange?: (val: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={idx}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
            className={cn(
              "transition-transform",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 focus:outline-none"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                  : "text-slate-200 fill-slate-100"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

