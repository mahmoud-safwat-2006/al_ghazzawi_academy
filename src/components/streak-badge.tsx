"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useStreak } from "@/lib/use-db";

/**
 * Compact streak counter for the Nav. Hidden while the value is loading or 0,
 * so first-time visitors don't see a "0 days" badge.
 */
export function StreakBadge() {
  const streak = useStreak();

  if (!streak || streak.current === 0) return null;

  const flickering = !streak.todayActive;

  return (
    <Link
      href="/dashboard"
      title={
        streak.todayActive
          ? `🔥 ${streak.current} يوم متتالي — أطول سلسلة: ${streak.longest}`
          : `⚠️ سلسلتك ${streak.current} يوم — لم تدرس اليوم بعد!`
      }
      className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
        flickering
          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60"
          : "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/60"
      }`}
      aria-label={`سلسلة ${streak.current} يوم متتالي`}
    >
      <Flame
        className={`size-3.5 ${flickering ? "" : "fill-current"}`}
        aria-hidden
      />
      {streak.current}
    </Link>
  );
}
