"use client";

import Link from "next/link";
import { BadgeCheck, LogIn, Sparkles } from "lucide-react";
import { useAccess } from "@/lib/access";

/**
 * Compact access indicator for the Nav.
 * - not registered → "تسجيل الدخول" link to /welcome
 * - trial → "تجريبي" chip (links to /welcome to enter a code)
 * - full → "كامل" chip
 * Hidden while loading to avoid hydration flicker.
 */
export function AccessBadge() {
  const { loading, registered, tier } = useAccess();
  if (loading) return null;

  if (!registered) {
    return (
      <Link
        href="/welcome"
        className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 px-2.5 py-1 text-xs font-bold hover:bg-cyan-100 dark:hover:bg-cyan-950/60 transition-colors"
      >
        <LogIn className="size-3.5" />
        تسجيل الدخول
      </Link>
    );
  }

  if (tier === "full") {
    return (
      <span
        className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-bold"
        title="حساب مفعّل بالكامل"
      >
        <BadgeCheck className="size-3.5" />
        كامل
      </span>
    );
  }

  return (
    <Link
      href="/welcome"
      title="حساب تجريبي — فعّل بالكود لفتح كل الفصول"
      className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
    >
      <Sparkles className="size-3.5" />
      تجريبي
    </Link>
  );
}
