/**
 * Pure data-shaping helpers for the Dashboard. No DB / React inside —
 * just functions that take arrays from the DB and return chart-ready shapes.
 */
import { dayKey } from "./db";
import type {
  StudySession,
  QuizAttempt,
  FlashcardState,
  ReadingProgress,
} from "./db";

export interface DayBucket {
  /** YYYY-MM-DD */
  dayKey: string;
  /** total minutes spent (estimate) */
  minutes: number;
  /** number of activities done that day */
  count: number;
  /** day label, eg "26 May" */
  label: string;
}

/** Build a contiguous N-day window ending today, filling gaps with zeros. */
export function activityByDay(
  sessions: StudySession[],
  days = 30,
): DayBucket[] {
  const buckets = new Map<string, { minutes: number; count: number }>();
  for (const s of sessions) {
    const cur = buckets.get(s.dayKey) ?? { minutes: 0, count: 0 };
    // estimate: if no duration, count each activity as 2 minutes
    cur.minutes += Math.round((s.durationSec ?? 120) / 60);
    cur.count += 1;
    buckets.set(s.dayKey, cur);
  }

  const out: DayBucket[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const cur = buckets.get(key) ?? { minutes: 0, count: 0 };
    out.push({
      dayKey: key,
      minutes: cur.minutes,
      count: cur.count,
      label: d.toLocaleDateString("ar", { day: "2-digit", month: "short" }),
    });
  }
  return out;
}

/** Quiz accuracy across the last N attempts (chronological). */
export function quizAccuracyTrend(attempts: QuizAttempt[], take = 20) {
  return [...attempts]
    .sort((a, b) => a.date - b.date)
    .slice(-take)
    .map((a, i) => ({
      x: i + 1,
      percent: a.percent,
      date: new Date(a.date).toLocaleDateString("ar"),
      chapter: `ف${a.chapterNum}`,
    }));
}

/** Pie/donut slices for flashcard status distribution. */
export function flashcardDistribution(states: FlashcardState[]) {
  const counts = {
    known: 0,
    learning: 0,
    needsReview: 0,
    new: 0,
  };
  for (const s of states) counts[s.status] += 1;
  return [
    { name: "أعرفها", key: "known", value: counts.known, color: "#10B981" },
    {
      name: "أتعلّمها",
      key: "learning",
      value: counts.learning,
      color: "#F59E0B",
    },
    {
      name: "تحتاج مراجعة",
      key: "needsReview",
      value: counts.needsReview,
      color: "#F43F5E",
    },
    { name: "جديدة", key: "new", value: counts.new, color: "#6B7280" },
  ].filter((s) => s.value > 0);
}

export interface DashboardSummary {
  totalMinutes: number;
  totalSessions: number;
  uniqueDays: number;
  quizAvg: number;
  quizCount: number;
  flashcardsTouched: number;
  flashcardsKnown: number;
  chaptersStarted: number;
  chaptersCompleted: number;
}

export function dashboardSummary(
  sessions: StudySession[],
  attempts: QuizAttempt[],
  flashcards: FlashcardState[],
  progress: ReadingProgress[],
): DashboardSummary {
  const totalMinutes = sessions.reduce(
    (sum, s) => sum + Math.round((s.durationSec ?? 120) / 60),
    0,
  );
  const uniqueDays = new Set(sessions.map((s) => s.dayKey)).size;
  const quizAvg =
    attempts.length === 0
      ? 0
      : Math.round(
          attempts.reduce((s, a) => s + a.percent, 0) / attempts.length,
        );
  const flashcardsKnown = flashcards.filter((s) => s.status === "known").length;
  return {
    totalMinutes,
    totalSessions: sessions.length,
    uniqueDays,
    quizAvg,
    quizCount: attempts.length,
    flashcardsTouched: flashcards.length,
    flashcardsKnown,
    chaptersStarted: progress.length,
    chaptersCompleted: progress.filter((p) => p.percent === 100).length,
  };
}

export interface HeatmapCell {
  dayKey: string;
  count: number;
  /** 0–4 intensity bucket */
  level: 0 | 1 | 2 | 3 | 4;
  /** Date object for tooltip */
  date: Date;
}

/** Build a GitHub-style heatmap grid for the last N weeks. */
export function heatmap(sessions: StudySession[], weeks = 16): HeatmapCell[][] {
  const days = weeks * 7;
  const counts = new Map<string, number>();
  for (const s of sessions) {
    counts.set(s.dayKey, (counts.get(s.dayKey) ?? 0) + 1);
  }

  // Find the most recent Saturday (week start in Arabic locales).
  // We use Sunday-start to keep the math simple; both work since labels follow.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startCursor = new Date(today);
  startCursor.setDate(startCursor.getDate() - (days - 1));

  const max = Math.max(1, ...counts.values());

  const cells: HeatmapCell[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startCursor);
    d.setDate(startCursor.getDate() + i);
    const key = dayKey(d);
    const count = counts.get(key) ?? 0;
    let level: HeatmapCell["level"] = 0;
    if (count > 0) {
      const ratio = count / max;
      if (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5) level = 2;
      else if (ratio <= 0.75) level = 3;
      else level = 4;
    }
    cells.push({ dayKey: key, count, level, date: d });
  }

  // Group into weeks of 7 days (columns).
  const cols: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    cols.push(cells.slice(i, i + 7));
  }
  return cols;
}

/** Activity by type — for stacked bar / pie. */
export function activityByType(sessions: StudySession[]) {
  const counts = {
    summary: 0,
    quiz: 0,
    flashcards: 0,
    reading: 0,
  };
  for (const s of sessions) counts[s.activity] += 1;
  return [
    {
      name: "ملخصات",
      key: "summary",
      value: counts.summary,
      color: "#1E40AF",
    },
    { name: "كويزات", key: "quiz", value: counts.quiz, color: "#06B6D4" },
    {
      name: "بطاقات",
      key: "flashcards",
      value: counts.flashcards,
      color: "#F59E0B",
    },
    {
      name: "قراءة PDF",
      key: "reading",
      value: counts.reading,
      color: "#D97706",
    },
  ].filter((s) => s.value > 0);
}
