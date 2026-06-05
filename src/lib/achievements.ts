/**
 * Achievement catalog + evaluation engine.
 *
 * Each achievement has:
 *   - a unique id
 *   - an Arabic name + description
 *   - an emoji icon (rendered everywhere)
 *   - a `check(stats) -> boolean` predicate
 *
 * The engine reads aggregated stats from the DB, evaluates every achievement,
 * and unlocks those whose predicate returns true and aren't already unlocked.
 */
import { getDB } from "./db";
import type {
  StudySession,
  QuizAttempt,
  FlashcardState,
  ReadingProgress,
  ChapterNote,
} from "./db";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  check: (s: AggregatedStats) => boolean;
}

export interface AggregatedStats {
  sessions: StudySession[];
  attempts: QuizAttempt[];
  flashcards: FlashcardState[];
  progress: ReadingProgress[];
  notes: ChapterNote[];
  // derived
  uniqueDays: number;
  currentStreak: number;
  longestStreak: number;
  knownFlashcards: number;
  bestQuizPercent: number;
  perfectQuizzes: number;
  completedChapters: number;
  noteCount: number;
  customQuizzes: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // — Onboarding —
  {
    id: "first-step",
    name: "أول خطوة",
    description: "أكملت أول نشاط دراسي",
    icon: "🚀",
    tier: "bronze",
    check: (s) => s.sessions.length >= 1,
  },
  {
    id: "first-summary",
    name: "أول ملخص",
    description: "قرأت ملخص فصل بالكامل",
    icon: "📘",
    tier: "bronze",
    check: (s) => s.sessions.some((x) => x.activity === "summary"),
  },
  {
    id: "first-quiz",
    name: "أول كويز",
    description: "أنجزت أول كويز",
    icon: "📝",
    tier: "bronze",
    check: (s) => s.attempts.length >= 1,
  },
  {
    id: "first-flashcards",
    name: "أول بطاقات",
    description: "راجعت أول مجموعة بطاقات",
    icon: "🎴",
    tier: "bronze",
    check: (s) => s.sessions.some((x) => x.activity === "flashcards"),
  },

  // — Streak —
  {
    id: "streak-3",
    name: "3 أيام متواصلة",
    description: "ثلاثة أيام متتالية من الدراسة",
    icon: "🔥",
    tier: "bronze",
    check: (s) => s.currentStreak >= 3 || s.longestStreak >= 3,
  },
  {
    id: "streak-7",
    name: "أسبوع كامل",
    description: "سبعة أيام متتالية - عادة بدأت تتشكل",
    icon: "🔥",
    tier: "silver",
    check: (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    id: "streak-30",
    name: "شهر بلا انقطاع",
    description: "30 يوماً متتالياً - إنجاز نخبوي",
    icon: "🔥",
    tier: "gold",
    check: (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
  },

  // — Quiz mastery —
  {
    id: "quiz-perfect",
    name: "علامة كاملة",
    description: "حصلت على 100% في كويز",
    icon: "💯",
    tier: "silver",
    check: (s) => s.perfectQuizzes >= 1,
  },
  {
    id: "quiz-perfect-5",
    name: "خمس علامات كاملة",
    description: "5 كويزات بنتيجة 100%",
    icon: "🏆",
    tier: "gold",
    check: (s) => s.perfectQuizzes >= 5,
  },
  {
    id: "quiz-10",
    name: "عشرة كويزات",
    description: "أنجزت 10 كويزات",
    icon: "🎯",
    tier: "silver",
    check: (s) => s.attempts.length >= 10,
  },

  // — Flashcards —
  {
    id: "flash-25",
    name: "متعلم نشط",
    description: "أتقنت 25 بطاقة",
    icon: "🧠",
    tier: "bronze",
    check: (s) => s.knownFlashcards >= 25,
  },
  {
    id: "flash-100",
    name: "موسوعة",
    description: "أتقنت 100 بطاقة",
    icon: "📚",
    tier: "gold",
    check: (s) => s.knownFlashcards >= 100,
  },
  {
    id: "flash-300",
    name: "ذاكرة فولاذية",
    description: "أتقنت 300 بطاقة",
    icon: "💎",
    tier: "platinum",
    check: (s) => s.knownFlashcards >= 300,
  },

  // — Book progress —
  {
    id: "half-book",
    name: "نصف الطريق",
    description: "أنهيت 7 فصول كاملة",
    icon: "📖",
    tier: "silver",
    check: (s) => s.completedChapters >= 7,
  },
  {
    id: "book-complete",
    name: "خاتم الكتاب",
    description: "أنهيت 14 فصلاً من كتاب كامل",
    icon: "🎓",
    tier: "platinum",
    check: (s) => s.completedChapters >= 14,
  },

  // — Time / behavior —
  {
    id: "night-owl",
    name: "بومة الليل",
    description: "درست بعد منتصف الليل",
    icon: "🌙",
    tier: "bronze",
    check: (s) =>
      s.sessions.some((x) => {
        const h = new Date(x.date).getHours();
        return h >= 0 && h < 5;
      }),
  },
  {
    id: "early-bird",
    name: "طائر الصباح",
    description: "درست قبل السادسة صباحاً",
    icon: "☀️",
    tier: "bronze",
    check: (s) =>
      s.sessions.some((x) => {
        const h = new Date(x.date).getHours();
        return h >= 5 && h < 7;
      }),
  },
  {
    id: "marathoner",
    name: "ماراثوني",
    description: "10 أنشطة في يوم واحد",
    icon: "⚡",
    tier: "silver",
    check: (s) => {
      const byDay = new Map<string, number>();
      for (const x of s.sessions) {
        byDay.set(x.dayKey, (byDay.get(x.dayKey) ?? 0) + 1);
      }
      return [...byDay.values()].some((n) => n >= 10);
    },
  },

  // — Notes (Session 3ج) —
  {
    id: "first-note",
    name: "أول ملاحظة",
    description: "دوّنت ملاحظتك الأولى",
    icon: "✍️",
    tier: "bronze",
    check: (s) => s.noteCount >= 1,
  },
  {
    id: "note-keeper",
    name: "مدوّن نشط",
    description: "5 ملاحظات مكتوبة",
    icon: "📓",
    tier: "silver",
    check: (s) => s.noteCount >= 5,
  },
  {
    id: "prolific-writer",
    name: "كاتب غزير",
    description: "20 ملاحظة - فكرك على الورق",
    icon: "📚",
    tier: "gold",
    check: (s) => s.noteCount >= 20,
  },

  // — Custom Quiz (Session 3ج) —
  {
    id: "first-custom-quiz",
    name: "مُجرّب",
    description: "ولّدت أول كويز مخصص",
    icon: "🎲",
    tier: "bronze",
    check: (s) => s.customQuizzes >= 1,
  },
];

export function tierColor(tier: AchievementDef["tier"]) {
  switch (tier) {
    case "bronze":
      return "from-amber-700 to-amber-900";
    case "silver":
      return "from-slate-400 to-slate-600";
    case "gold":
      return "from-amber-400 to-amber-600";
    case "platinum":
      return "from-cyan-400 to-cyan-600";
  }
}

export function tierLabel(tier: AchievementDef["tier"]) {
  switch (tier) {
    case "bronze":
      return "برونزي";
    case "silver":
      return "فضي";
    case "gold":
      return "ذهبي";
    case "platinum":
      return "بلاتيني";
  }
}

function uniqueDayCount(sessions: StudySession[]) {
  return new Set(sessions.map((s) => s.dayKey)).size;
}

function streakStats(sessions: StudySession[]) {
  if (sessions.length === 0) return { current: 0, longest: 0 };
  const days = new Set(sessions.map((s) => s.dayKey));
  const sorted = [...days].sort();
  // longest
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of sorted) {
    const cur = new Date(k);
    if (prev) {
      const diff = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = cur;
  }
  // current
  let current = 0;
  const cursor = new Date();
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  while (
    days.has(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
    )
  ) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, longest };
}

export function aggregate(
  sessions: StudySession[],
  attempts: QuizAttempt[],
  flashcards: FlashcardState[],
  progress: ReadingProgress[],
  notes: ChapterNote[] = [],
): AggregatedStats {
  const { current, longest } = streakStats(sessions);
  return {
    sessions,
    attempts,
    flashcards,
    progress,
    notes,
    uniqueDays: uniqueDayCount(sessions),
    currentStreak: current,
    longestStreak: longest,
    knownFlashcards: flashcards.filter((s) => s.status === "known").length,
    bestQuizPercent:
      attempts.length === 0
        ? 0
        : Math.max(...attempts.map((a) => a.percent)),
    perfectQuizzes: attempts.filter((a) => a.percent === 100).length,
    completedChapters: progress.filter((p) => p.percent === 100).length,
    noteCount: notes.length,
    customQuizzes: attempts.filter((a) => a.chapterNum === 0).length,
  };
}

/**
 * Evaluate every achievement against the current stats and unlock any newly-earned ones.
 * Returns the list of newly-unlocked achievement defs so the UI can show a toast.
 */
export async function evaluateAchievements(
  stats: AggregatedStats,
): Promise<AchievementDef[]> {
  try {
    const db = getDB();
    const already = new Set(
      (await db.achievements.toArray()).map((a) => a.id),
    );
    const newlyUnlocked: AchievementDef[] = [];
    const now = Date.now();
    for (const def of ACHIEVEMENTS) {
      if (already.has(def.id)) continue;
      if (def.check(stats)) {
        await db.achievements.put({
          id: def.id,
          unlockedAt: now,
        });
        newlyUnlocked.push(def);
      }
    }
    return newlyUnlocked;
  } catch (err) {
    console.warn("[achievements] evaluate failed", err);
    return [];
  }
}

export function findAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
