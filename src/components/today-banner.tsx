"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { usePreferences } from "@/lib/use-db";
import {
  activityHref,
  activityLabel,
  planProgress,
  todayInPlan,
} from "@/lib/study-plan";

/**
 * Top-of-home-page banner showing today's plan tasks.
 * Hidden when there's no active plan or no tasks for today.
 */
export function TodayBanner() {
  const prefs = usePreferences();
  const plan = prefs?.studyPlan;

  if (!plan) return null;
  const today = todayInPlan(plan);
  if (!today) return null;

  const prog = planProgress(plan);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
      <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/40 dark:to-orange-950/10 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                مهمة اليوم
              </div>
              <div className="text-sm font-bold text-foreground truncate">
                الفصل {today.chapterNum} — {today.activities.length} نشاط
              </div>
            </div>
          </div>
          <div className="text-[11px] text-muted">
            يوم {prog.elapsed + 1} من {prog.totalDays}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {today.activities.map((a) => (
            <Link
              key={a}
              href={activityHref(plan.bookSlug, today.chapterNum, a)}
              className="inline-flex items-center justify-between rounded-xl border border-amber-200/60 dark:border-amber-900/60 bg-white/60 dark:bg-card/60 backdrop-blur px-3 py-2.5 text-xs font-bold text-foreground hover:bg-white dark:hover:bg-card transition-colors group"
            >
              <span>{activityLabel(a)}</span>
              <ArrowLeft className="size-3.5 text-amber-600 dark:text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
