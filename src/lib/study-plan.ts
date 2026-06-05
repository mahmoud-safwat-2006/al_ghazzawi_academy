/**
 * Study-plan generator. Produces a deterministic per-day schedule for a book
 * given a chosen duration (30/60/90 days), distributing activities so that
 * each chapter gets summary → quiz → flashcards across consecutive days.
 */
import { dayKey } from "./db";
import type { StudyPlan, StudyPlanDay } from "./db";

export type PlanDuration = 30 | 60 | 90;
export type Activity = "summary" | "quiz" | "flashcards";

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Distribute `chapters * 3` activity-units across `durationDays`.
 * - Earlier days get more "summary" work (foundation first).
 * - Mid days mix quiz with flashcards.
 * - Later days are review-heavy (flashcards + quiz).
 *
 * Each day gets between 1 and 3 activities depending on density.
 */
export function generateStudyPlan(
  bookSlug: string,
  chapterCount: number,
  durationDays: PlanDuration,
  startDate = startOfDay(),
): StudyPlan {
  // Total activity units we want to place across the plan.
  const totalUnits = chapterCount * 3;
  // Roughly how many units per day (>=1, rounded up so we don't drop work).
  const unitsPerDay = Math.max(1, Math.ceil(totalUnits / durationDays));

  // Build the full list of (chapter, activity) units, ordered chapter-by-chapter
  // with the activities in pedagogical order: summary → flashcards → quiz.
  type Unit = { chapterNum: number; activity: Activity };
  const units: Unit[] = [];
  for (let c = 1; c <= chapterCount; c++) {
    units.push({ chapterNum: c, activity: "summary" });
    units.push({ chapterNum: c, activity: "flashcards" });
    units.push({ chapterNum: c, activity: "quiz" });
  }

  // Walk through days, packing `unitsPerDay` units into each. Days past the
  // total work are pure review (flashcards from earlier chapters).
  const schedule: StudyPlanDay[] = [];
  let cursor = 0;
  for (let i = 0; i < durationDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dKey = dayKey(d);

    if (cursor < units.length) {
      const slice = units.slice(cursor, cursor + unitsPerDay);
      // Group same-chapter activities on the same day, but if the day spans
      // multiple chapters we use the earliest chapter as the "primary".
      const primaryChapter = slice[0].chapterNum;
      schedule.push({
        dayIndex: i,
        dayKey: dKey,
        chapterNum: primaryChapter,
        activities: dedupe(slice.map((u) => u.activity)),
      });
      cursor += unitsPerDay;
    } else {
      // Review day — rotate through chapters.
      const reviewChapter = (i % chapterCount) + 1;
      schedule.push({
        dayIndex: i,
        dayKey: dKey,
        chapterNum: reviewChapter,
        activities: ["flashcards"],
      });
    }
  }

  return {
    durationDays,
    startDate: startDate.getTime(),
    bookSlug,
    schedule,
  };
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Get today's scheduled day (or `null` if plan is finished). */
export function todayInPlan(plan: StudyPlan): StudyPlanDay | null {
  const today = dayKey();
  return plan.schedule.find((d) => d.dayKey === today) ?? null;
}

/** Days finished, days remaining, percentage. */
export function planProgress(plan: StudyPlan) {
  const today = dayKey();
  const totalDays = plan.schedule.length;
  const elapsed = plan.schedule.filter((d) => d.dayKey < today).length;
  const isTodayInPlan = plan.schedule.some((d) => d.dayKey === today);
  const remaining = totalDays - elapsed - (isTodayInPlan ? 1 : 0);
  return {
    totalDays,
    elapsed,
    remaining: Math.max(0, remaining),
    percent: Math.round((elapsed / totalDays) * 100),
    isActive: isTodayInPlan,
  };
}

export function activityLabel(a: Activity): string {
  switch (a) {
    case "summary":
      return "ملخص";
    case "quiz":
      return "كويز";
    case "flashcards":
      return "بطاقات";
  }
}

export function activityHref(
  bookSlug: string,
  chapterNum: number,
  a: Activity,
): string {
  if (a === "summary") return `/books/${bookSlug}/${chapterNum}/summary`;
  if (a === "quiz") return `/books/${bookSlug}/${chapterNum}/quiz`;
  return `/books/${bookSlug}/${chapterNum}/flashcards`;
}
