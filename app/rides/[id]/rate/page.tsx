"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

const COMPLIMENT_TAGS = [
  "Polite & Friendly",
  "Clean Car",
  "Safe Driving",
  "Great Navigation",
  "Punctual Arrival",
];

export default function RateDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/rides/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setRide(res.data);
      });
  }, [id]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars,
          tags: selectedTags,
          comment,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Thank you for your feedback! ⭐");
        router.push(`/history/${id}`);
      } else {
        toast.error(data.error?.message || "Failed to submit review");
      }
    } catch {
      toast.error("Error submitting rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
        {/* Driver Avatar */}
        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
          {ride?.driver?.name ? ride.driver.name[0] : "D"}
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900">
            How was your ride with {ride?.driver?.name || "the driver"}?
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your feedback keeps our community safe and high-quality.
          </p>
        </div>

        {/* 5-Star Rating */}
        <div className="flex justify-center py-2">
          <StarRating rating={stars} onChange={setStars} size={36} />
        </div>

        {/* Compliments Chips */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Add compliments (optional)
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {COMPLIMENT_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment textarea */}
        <div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment about your journey..."
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            maxLength={500}
          />
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="lg"
            className="w-full h-12 text-sm font-bold shadow-md"
          >
            Submit Feedback
          </Button>

          <button
            type="button"
            onClick={() => router.push(`/history/${id}`)}
            className="text-xs text-slate-400 hover:text-slate-600 block mx-auto py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

