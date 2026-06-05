/**
 * Custom quiz generator — builds a randomized question set from one or more
 * chapters across a book, filtered by difficulty.
 *
 * Used by the /quiz page (Session 3ج).
 */
import { allBooks, getChapterFromBook } from "./books";
import type { QuizItem, Difficulty } from "@/content/hr/types";

export type DifficultyFilter = Difficulty | "mixed";

export interface GeneratedQuestion extends QuizItem {
  /** which chapter this question came from */
  chapterNum: number;
  chapterTitle: string;
  /** original index inside the chapter's quiz array */
  originalIndex: number;
}

export interface QuizConfig {
  bookSlug: string;
  /** chapter numbers to draw questions from */
  chapterNums: number[];
  /** how many questions to generate */
  count: number;
  difficulty: DifficultyFilter;
}

/** Fisher-Yates shuffle (in place, returns same array for chaining). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a quiz from a config. Returns at most `count` questions; may return
 * fewer if the filter is too tight.
 */
export function generateCustomQuiz(config: QuizConfig): GeneratedQuestion[] {
  const pool: GeneratedQuestion[] = [];

  for (const chapterNum of config.chapterNums) {
    const ch = getChapterFromBook(config.bookSlug, chapterNum);
    if (!ch) continue;
    ch.quiz.forEach((q, originalIndex) => {
      if (
        config.difficulty !== "mixed" &&
        q.difficulty &&
        q.difficulty !== config.difficulty
      ) {
        return;
      }
      pool.push({
        ...q,
        chapterNum: ch.num,
        chapterTitle: ch.title_ar,
        originalIndex,
      });
    });
  }

  shuffle(pool);
  return pool.slice(0, config.count);
}

/** Count available questions matching a config (used to show the user). */
export function countAvailable(
  bookSlug: string,
  chapterNums: number[],
  difficulty: DifficultyFilter,
): number {
  let total = 0;
  for (const chapterNum of chapterNums) {
    const ch = getChapterFromBook(bookSlug, chapterNum);
    if (!ch) continue;
    for (const q of ch.quiz) {
      if (
        difficulty !== "mixed" &&
        q.difficulty &&
        q.difficulty !== difficulty
      ) {
        continue;
      }
      total += 1;
    }
  }
  return total;
}

/** All chapters from a given book — convenience for the builder UI. */
export function bookChapters(bookSlug: string) {
  const book = allBooks().find((b) => b.slug === bookSlug);
  if (!book) return [];
  return book.chapters.map((c) => ({
    num: c.num,
    title: c.title_ar,
    quizCount: c.quiz.length,
  }));
}

export function difficultyLabel(d: DifficultyFilter): string {
  switch (d) {
    case "easy":
      return "سهل";
    case "medium":
      return "متوسط";
    case "hard":
      return "صعب";
    case "mixed":
      return "مختلط";
  }
}
