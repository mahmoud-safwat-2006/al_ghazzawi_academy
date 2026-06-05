/**
 * Book registry — single source of truth for resolving (bookSlug, chapterNum, cardIndex)
 * back to the static content shipped with the app. Used by /review, /dashboard, etc.
 */
import { hrBook } from "@/content/hr";
import { marketingBook } from "@/content/marketing";
import { managementBook } from "@/content/management";
import type { Book, Chapter, Flashcard, QuizItem } from "@/content/hr/types";

const BOOKS: Record<string, Book> = {
  hr: hrBook,
  marketing: marketingBook,
  management: managementBook,
};

export function getBook(slug: string): Book | undefined {
  return BOOKS[slug];
}

export function allBooks(): Book[] {
  return Object.values(BOOKS);
}

/** Ready book slugs, in registry order — used by generateStaticParams. */
export function bookSlugs(): string[] {
  return Object.keys(BOOKS);
}

const ORDINALS_AR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

/** Arabic ordinal label for a book ("الكتاب الأول"), based on registry order. */
export function bookOrdinalLabel(slug: string): string {
  const i = bookSlugs().indexOf(slug);
  return i >= 0 && i < ORDINALS_AR.length ? `الكتاب ${ORDINALS_AR[i]}` : "كتاب";
}

export function getChapterFromBook(
  slug: string,
  num: number,
): Chapter | undefined {
  return getBook(slug)?.chapters.find((c) => c.num === num);
}

export function getFlashcard(
  bookSlug: string,
  chapterNum: number,
  cardIndex: number,
): Flashcard | undefined {
  return getChapterFromBook(bookSlug, chapterNum)?.flashcards[cardIndex];
}

export function getQuizItem(
  bookSlug: string,
  chapterNum: number,
  questionIndex: number,
): QuizItem | undefined {
  return getChapterFromBook(bookSlug, chapterNum)?.quiz[questionIndex];
}

/** Total flashcards across all books — used for stats. */
export function totalFlashcards(): number {
  return allBooks().reduce(
    (sum, b) => sum + b.chapters.reduce((s, c) => s + c.flashcards.length, 0),
    0,
  );
}

/** Total chapters across all books. */
export function totalChapters(): number {
  return allBooks().reduce((sum, b) => sum + b.chapters.length, 0);
}
