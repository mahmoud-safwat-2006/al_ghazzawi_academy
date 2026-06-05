"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { usePreferences, setPreference } from "@/lib/use-db";
import {
  activityHref,
  activityLabel,
  generateStudyPlan,
  planProgress,
  todayInPlan,
  type PlanDuration,
} from "@/lib/study-plan";
import { getBook } from "@/lib/books";
import { dayKey } from "@/lib/db";

const DURATIONS: { value: PlanDuration; label: string; intensity: string }[] = [
  { value: 30, label: "30 يوم", intensity: "مكثفة" },
  { value: 60, label: "60 يوم", intensity: "متوازنة" },
  { value: 90, label: "90 يوم", intensity: "مريحة" },
];

export function StudyPlanClient() {
  const prefs = usePreferences();
  const [selected, setSelected] = useState<PlanDuration>(60);
  const [bookSlug] = useState("hr"); // single book for now

  // usePreferences() can be `undefined` either while loading OR when no prefs
  // record exists yet — both cases mean "no active plan", so we fall through
  // to the selection UI on first paint and swap to ActivePlanView when data
  // (with a plan) eventually arrives.
  const plan = prefs?.studyPlan;

  async function createPlan() {
    const book = getBook(bookSlug);
    if (!book) return;
    const newPlan = generateStudyPlan(bookSlug, book.chapters.length, selected);
    await setPreference("studyPlan", newPlan);
  }

  async function clearPlan() {
    await setPreference("studyPlan", undefined);
  }

  if (plan) {
    return <ActivePlanView plan={plan} onClear={clearPlan} />;
  }

  const book = getBook(bookSlug);
  const chapterCount = book?.chapters.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          الكتاب
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-royal-600 dark:text-royal-400" />
          <div>
            <div className="text-sm font-bold text-foreground">
              {book?.title_ar}
            </div>
            <div className="text-xs text-muted">{chapterCount} فصلاً</div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          المدة
        </div>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => {
            const isActive = selected === d.value;
            const perDay = Math.ceil((chapterCount * 3) / d.value);
            return (
              <button
                key={d.value}
                onClick={() => setSelected(d.value)}
                className={`rounded-2xl border-2 p-4 text-start transition-all ${
                  isActive
                    ? "border-royal-500 bg-royal-50 dark:bg-royal-950/40 shadow-sm"
                    : "border-border/60 bg-card hover:border-royal-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar
                    className={`size-5 ${
                      isActive
                        ? "text-royal-600 dark:text-royal-400"
                        : "text-muted"
                    }`}
                  />
                  {isActive && (
                    <CheckCircle2 className="size-4 text-royal-600 dark:text-royal-400" />
                  )}
                </div>
                <div className="text-lg font-black text-foreground">
                  {d.label}
                </div>
                <div className="text-[11px] text-muted">{d.intensity}</div>
                <div className="text-[11px] text-muted mt-1">
                  ~{perDay} نشاط/يوم
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={createPlan}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-royal-600 text-white px-5 py-3 text-sm font-bold hover:bg-royal-700 transition-colors"
      >
        <Sparkles className="size-4" />
        أنشئ خطتي
      </button>
    </div>
  );
}

function ActivePlanView({
  plan,
  onClear,
}: {
  plan: NonNullable<ReturnType<typeof usePreferences>>["studyPlan"];
}
& {
  onClear: () => Promise<void>;
}) {
  if (!plan) return null;
  const today = todayInPlan(plan);
  const prog = planProgress(plan);
  const startDate = new Date(plan.startDate).toLocaleDateString("ar");
  const todayStr = dayKey();

  return (
    <div className="space-y-6">
      {/* Plan summary */}
      <div className="rounded-2xl border border-royal-200/60 dark:border-royal-900/60 bg-gradient-to-br from-royal-50 to-cyan-50/30 dark:from-royal-950/40 dark:to-cyan-950/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              خطتك النشطة
            </div>
            <div className="text-2xl font-black text-foreground mt-1">
              {plan.durationDays} يوم
            </div>
            <div className="text-xs text-muted mt-0.5">
              بدأت {startDate}
            </div>
          </div>
          <div className="text-end">
            <div className="text-3xl font-black text-royal-700 dark:text-royal-400">
              {prog.percent}%
            </div>
            <div className="text-[11px] text-muted">
              {prog.elapsed} / {prog.totalDays} يوم
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-royal-100 dark:bg-royal-950/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-royal-500 to-cyan-500 transition-all"
            style={{ width: `${prog.percent}%` }}
          />
        </div>
      </div>

      {/* Today's tasks */}
      {today ? (
        <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              مهمة اليوم
            </div>
          </div>
          <div className="text-sm text-muted mb-3">
            الفصل {today.chapterNum} — {today.activities.length} نشاط
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            {today.activities.map((a) => (
              <Link
                key={a}
                href={activityHref(plan.bookSlug, today.chapterNum, a)}
                className="inline-flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 text-sm font-semibold hover:border-amber-300 transition-colors group"
              >
                <span>{activityLabel(a)}</span>
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
          <Clock className="mx-auto size-6 text-muted mb-2" />
          <div className="text-sm font-bold text-foreground">
            لا توجد مهام لليوم في هذه الخطة
          </div>
          <div className="text-xs text-muted mt-1">
            ربما اليوم خارج نطاق خطتك. تابع المراجعة الذكية.
          </div>
        </div>
      )}

      {/* Upcoming days preview */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          الجدول الكامل
        </div>
        <div className="max-h-80 overflow-y-auto space-y-1.5 -mx-2 px-2">
          {plan.schedule.map((d) => {
            const isPast = d.dayKey < todayStr;
            const isToday = d.dayKey === todayStr;
            return (
              <div
                key={d.dayIndex}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${
                  isToday
                    ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60"
                    : isPast
                      ? "opacity-50"
                      : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`flex-shrink-0 size-7 rounded-md flex items-center justify-center text-[11px] font-bold ${
                      isToday
                        ? "bg-amber-500 text-white"
                        : "bg-border/40 text-muted"
                    }`}
                  >
                    {d.dayIndex + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">
                      الفصل {d.chapterNum}
                    </div>
                    <div className="text-[10px] text-muted">
                      {new Date(d.dayKey).toLocaleDateString("ar", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {d.activities.map((a) => (
                    <span
                      key={a}
                      className="inline-block rounded-full bg-border/40 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {activityLabel(a)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onClear}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-400 px-4 py-2.5 text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
      >
        <Trash2 className="size-4" />
        إلغاء الخطة وإعادة الاختيار
      </button>
    </div>
  );
}
