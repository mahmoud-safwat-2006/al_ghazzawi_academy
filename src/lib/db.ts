/**
 * Al-Ghazzawi Academy - Local Database (Dexie / IndexedDB)
 *
 * Stores all student progress, quiz attempts, flashcard states, bookmarks,
 * notes, and preferences locally in the browser. No server required.
 *
 * Schema version 1.
 */
import Dexie, { type Table } from "dexie";

// =====================
// Type definitions
// =====================

export type FlashcardStatus = "new" | "learning" | "known" | "needsReview";

export interface ReadingProgress {
  /** composite key: `${bookSlug}:${chapterNum}` */
  id: string;
  bookSlug: string;
  chapterNum: number;
  /** percentage 0–100 */
  percent: number;
  /** which artifacts the student finished */
  summaryRead: boolean;
  quizCompleted: boolean;
  flashcardsReviewed: boolean;
  /** last time this chapter was visited (ms epoch) */
  lastVisited: number;
}

export interface QuizAttempt {
  id?: number;
  bookSlug: string;
  chapterNum: number;
  /** ms epoch */
  date: number;
  score: number;
  total: number;
  percent: number;
  /** the student's selected index per question (null = skipped) */
  answers: (number | null)[];
  /** seconds spent (optional) */
  durationSec?: number;
}

export interface FlashcardState {
  /** composite key: `${bookSlug}:${chapterNum}:${cardIndex}` */
  id: string;
  bookSlug: string;
  chapterNum: number;
  cardIndex: number;
  status: FlashcardStatus;
  /** how many times student marked this card */
  reviewCount: number;
  /** last review time (ms epoch) */
  lastReviewed: number;
  /** next review time (ms epoch) — for SM-2 in Session 3ب */
  nextReview?: number;
  /** SM-2 ease factor — default 2.5 */
  easeFactor?: number;
  /** SM-2 interval in days */
  intervalDays?: number;
}

export interface PdfBookmark {
  id?: number;
  bookSlug: string;
  page: number;
  label?: string;
  createdAt: number;
}

/** Singleton record for the last reading position per book */
export interface PdfReadingPosition {
  /** primary key: bookSlug */
  bookSlug: string;
  page: number;
  /** Zoom level (1 = 100%) */
  scale?: number;
  updatedAt: number;
}

export interface ChapterNote {
  id?: number;
  bookSlug: string;
  chapterNum: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudySession {
  id?: number;
  /** ms epoch */
  date: number;
  /** YYYY-MM-DD (local) — used for streak counting */
  dayKey: string;
  /** type of activity */
  activity: "summary" | "quiz" | "flashcards" | "reading";
  bookSlug: string;
  chapterNum?: number;
  /** seconds spent (optional) */
  durationSec?: number;
}

export interface Achievement {
  /** unique key e.g. "first-quiz", "10-day-streak" */
  id: string;
  unlockedAt: number;
  metadata?: Record<string, unknown>;
}

export interface StudyPlanDay {
  dayIndex: number;
  dayKey: string;
  chapterNum: number;
  activities: ("summary" | "quiz" | "flashcards")[];
}

export interface StudyPlan {
  durationDays: 30 | 60 | 90;
  startDate: number;
  bookSlug: string;
  schedule: StudyPlanDay[];
}

export interface Preferences {
  /** primary key — singleton: always "user" */
  id: "user";
  theme?: "light" | "dark" | "system";
  fontSize?: "sm" | "base" | "lg";
  /** last summary level chosen per chapter */
  summaryLevel?: "concise" | "standard" | "detailed";
  /** last seen onboarding step */
  onboardingCompleted?: boolean;
  /** active study plan (single plan supported in v1) */
  studyPlan?: StudyPlan;
  /** name printed on certificates */
  studentName?: string;
  /** access tier — "trial" (default) unlocks only the trial chapter; "full" unlocks everything */
  accessTier?: "trial" | "full";
  /** ms epoch when an activation code unlocked full access */
  unlockedAt?: number;
  /** the activation code that was redeemed (kept for reference / re-validation) */
  activationCode?: string;
}

// =====================
// Database
// =====================

class AcademyDB extends Dexie {
  readingProgress!: Table<ReadingProgress, string>;
  quizAttempts!: Table<QuizAttempt, number>;
  flashcardStates!: Table<FlashcardState, string>;
  pdfBookmarks!: Table<PdfBookmark, number>;
  pdfPositions!: Table<PdfReadingPosition, string>;
  notes!: Table<ChapterNote, number>;
  studySessions!: Table<StudySession, number>;
  achievements!: Table<Achievement, string>;
  preferences!: Table<Preferences, "user">;

  constructor() {
    super("alghazzawi-academy");

    this.version(1).stores({
      readingProgress: "id, bookSlug, chapterNum, lastVisited",
      quizAttempts: "++id, bookSlug, chapterNum, date, [bookSlug+chapterNum]",
      flashcardStates:
        "id, bookSlug, chapterNum, status, lastReviewed, nextReview, [bookSlug+chapterNum]",
      pdfBookmarks: "++id, bookSlug, page, createdAt",
      pdfPositions: "bookSlug, updatedAt",
      notes: "++id, bookSlug, chapterNum, updatedAt, [bookSlug+chapterNum]",
      studySessions: "++id, date, dayKey, activity, bookSlug",
      achievements: "id, unlockedAt",
      preferences: "id",
    });
  }
}

// =====================
// Singleton accessor (browser-only)
// =====================
// Dexie touches IndexedDB at construction, so we lazy-init to avoid SSR issues.

let _db: AcademyDB | null = null;

export function getDB(): AcademyDB {
  if (typeof window === "undefined") {
    throw new Error("AcademyDB is only available in the browser");
  }
  if (!_db) {
    _db = new AcademyDB();
  }
  return _db;
}

// =====================
// Helper functions
// =====================

export function chapterProgressId(bookSlug: string, chapterNum: number) {
  return `${bookSlug}:${chapterNum}`;
}

export function flashcardStateId(
  bookSlug: string,
  chapterNum: number,
  cardIndex: number,
) {
  return `${bookSlug}:${chapterNum}:${cardIndex}`;
}

/** local date key like "2026-05-26" */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Log a study session — used by Streak counter and Dashboard.
 * Safe to call from any client component.
 */
export async function logStudySession(
  activity: StudySession["activity"],
  bookSlug: string,
  chapterNum?: number,
  durationSec?: number,
) {
  try {
    const now = Date.now();
    await getDB().studySessions.add({
      date: now,
      dayKey: dayKey(),
      activity,
      bookSlug,
      chapterNum,
      durationSec,
    });
  } catch (err) {
    console.warn("[db] logStudySession failed", err);
  }
}

/**
 * Update or create the reading-progress row for a chapter.
 * Sets `lastVisited` to now and merges any fields you pass in.
 */
export async function upsertChapterProgress(
  bookSlug: string,
  chapterNum: number,
  patch: Partial<Omit<ReadingProgress, "id" | "bookSlug" | "chapterNum">>,
) {
  try {
    const db = getDB();
    const id = chapterProgressId(bookSlug, chapterNum);
    const existing = await db.readingProgress.get(id);
    const defaults: ReadingProgress = {
      id,
      bookSlug,
      chapterNum,
      percent: 0,
      summaryRead: false,
      quizCompleted: false,
      flashcardsReviewed: false,
      lastVisited: Date.now(),
    };
    const merged: ReadingProgress = {
      ...defaults,
      ...existing,
      ...patch,
      lastVisited: Date.now(),
    };
    // Re-compute percent from the three boolean checkpoints.
    const checks = [
      merged.summaryRead,
      merged.quizCompleted,
      merged.flashcardsReviewed,
    ];
    merged.percent = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100,
    );
    await db.readingProgress.put(merged);
    return merged;
  } catch (err) {
    console.warn("[db] upsertChapterProgress failed", err);
    return null;
  }
}
