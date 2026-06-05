"use client";

import { CheckCircle2 } from "lucide-react";
import { useBookProgress } from "@/lib/use-db";

interface ChapterProgressProps {
  bookSlug: string;
  chapterNum: number;
  /** compact: just a thin bar; default: bar + percentage */
  variant?: "compact" | "default";
}

/**
 * Live progress indicator for a single chapter.
 * Reads from Dexie via useLiveQuery — updates instantly when any
 * other component marks progress (summary / quiz / flashcards).
 */
export function ChapterProgress({
  bookSlug,
  chapterNum,
  variant = "default",
}: ChapterProgressProps) {
  const all = useBookProgress(bookSlug);
  const entry = all?.find((p) => p.chapterNum === chapterNum);
  const percent = entry?.percent ?? 0;
  const completed = percent === 100;

  if (variant === "compact") {
    return (
      <div className="h-1 rounded-full bg-border/60 overflow-hidden mt-2.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-royal-600 to-cyan-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-royal-600 to-cyan-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold tabular-nums ${
          completed
            ? "text-emerald-600 dark:text-emerald-400"
            : percent > 0
              ? "text-cyan-700 dark:text-cyan-400"
              : "text-muted"
        }`}
      >
        {completed ? (
          <span className="inline-flex items-center gap-0.5">
            <CheckCircle2 className="size-3" />
            تم
          </span>
        ) : (
          `${percent}%`
        )}
      </span>
    </div>
  );
}

interface BookProgressSummaryProps {
  bookSlug: string;
  totalChapters: number;
}

/**
 * Aggregate progress across an entire book.
 * Shows "X من Y فصل مكتمل" + an overall percentage bar.
 */
export function BookProgressSummary({
  bookSlug,
  totalChapters,
}: BookProgressSummaryProps) {
  const all = useBookProgress(bookSlug);
  const completed = all?.filter((p) => p.percent === 100).length ?? 0;
  const sum = all?.reduce((s, p) => s + p.percent, 0) ?? 0;
  const overall = totalChapters > 0 ? Math.round(sum / totalChapters) : 0;

  if (!all || all.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 px-3 py-2 text-xs text-muted text-center">
        ابدأ أي فصل وسيظهر تقدمك هنا تلقائياً
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">تقدمك العام</span>
        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
          {completed} / {totalChapters} فصل
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-royal-600 via-cyan-500 to-emerald-500 transition-all"
          style={{ width: `${overall}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-muted text-end font-medium tabular-nums">
        {overall}%
      </div>
    </div>
  );
}
