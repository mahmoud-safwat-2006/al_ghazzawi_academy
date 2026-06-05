/**
 * SM-2 Spaced Repetition algorithm (SuperMemo 2)
 *
 * Maps a self-assessment quality (0..5) to:
 *   - new easeFactor (EF, default 2.5, min 1.3)
 *   - new intervalDays
 *   - new repetitions count
 *   - next review timestamp
 *
 * Quality scale (q):
 *   5 = perfect recall          ("easy")
 *   4 = correct, some hesitation ("good")
 *   3 = correct, hard            ("hard")
 *   0..2 = forgot                ("again")  ← resets repetitions
 *
 * The Academy uses two UI buttons (K / R) by default, mapped to "good" / "again".
 * The /review page exposes the full 4-button Anki-style set.
 */
import type { FlashcardStatus } from "./db";

export type ReviewQuality = "again" | "hard" | "good" | "easy";

export interface Sm2Input {
  easeFactor?: number;
  intervalDays?: number;
  reviewCount?: number;
}

export interface Sm2Output {
  easeFactor: number;
  intervalDays: number;
  /** ms epoch of next review */
  nextReview: number;
  status: FlashcardStatus;
}

const Q: Record<ReviewQuality, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

const DAY_MS = 86_400_000;

export function reviewQualityFromBinary(
  status: "known" | "needsReview",
): ReviewQuality {
  return status === "known" ? "good" : "again";
}

/**
 * Apply SM-2 update.
 * Returns the new card-state fields and a stable `status` projection
 * (`known` for q>=4, `learning` for q==3, `needsReview` for q<3).
 */
export function sm2(quality: ReviewQuality, prev: Sm2Input = {}): Sm2Output {
  const q = Q[quality];
  const prevEF = prev.easeFactor ?? 2.5;
  const prevInterval = prev.intervalDays ?? 0;
  const prevReps = prev.reviewCount ?? 0;

  // 1. Update EF using the classic SM-2 formula, clamped to >= 1.3.
  let easeFactor = prevEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // 2. Compute new interval.
  let intervalDays: number;
  if (q < 3) {
    // Failure: restart learning.
    intervalDays = 0;
  } else if (prevReps === 0) {
    intervalDays = 1;
  } else if (prevReps === 1) {
    intervalDays = 6;
  } else {
    // Use the *previous* interval, not the EF-modified one — classic SM-2.
    intervalDays = Math.round(Math.max(prevInterval, 1) * easeFactor);
  }

  // 3. "easy" gets a bonus.
  if (quality === "easy" && intervalDays > 0) {
    intervalDays = Math.round(intervalDays * 1.3);
  }

  // 4. Map quality to FlashcardStatus for legacy UI surfaces.
  const status: FlashcardStatus =
    q >= 4 ? "known" : q === 3 ? "learning" : "needsReview";

  // 5. Next review = now + intervalDays (or 10 min for fresh failures).
  const now = Date.now();
  const nextReview =
    intervalDays === 0 ? now + 10 * 60 * 1000 : now + intervalDays * DAY_MS;

  return {
    easeFactor: Math.round(easeFactor * 1000) / 1000,
    intervalDays,
    nextReview,
    status,
  };
}

/** Human label for a card given its next-review timestamp. */
export function dueLabel(nextReview: number | undefined, now = Date.now()): {
  text: string;
  isDue: boolean;
} {
  if (!nextReview) return { text: "جديدة", isDue: true };
  const diff = nextReview - now;
  if (diff <= 0) return { text: "مستحقة الآن", isDue: true };
  const days = Math.round(diff / DAY_MS);
  if (days === 0) return { text: "اليوم", isDue: true };
  if (days === 1) return { text: "غداً", isDue: false };
  if (days < 30) return { text: `بعد ${days} يوم`, isDue: false };
  const months = Math.round(days / 30);
  return { text: `بعد ${months} شهر`, isDue: false };
}
