/**
 * Build a unified search index across all book content:
 * chapters, summaries (3 levels), flashcards, quiz questions.
 *
 * Notes from IndexedDB are indexed separately at search-time because they
 * change frequently — see `useNotesSearchItems` in search-client.
 */
import { allBooks } from "./books";
import type { ChapterNote } from "./db";

export type SearchItemKind =
  | "chapter"
  | "summary"
  | "flashcard"
  | "quiz"
  | "note";

export interface SearchItem {
  id: string;
  kind: SearchItemKind;
  bookSlug: string;
  bookTitle: string;
  chapterNum: number;
  chapterTitle: string;
  /** primary text shown in result */
  title: string;
  /** secondary text shown below title (snippet) */
  body: string;
  /** direct route to open the matching item */
  href: string;
}

/** Strip HTML tags from a summary string to make plain text searchable. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to N chars, keeping the cut on a word boundary if possible. */
function truncate(text: string, max = 220): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 100 ? slice.slice(0, lastSpace) : slice) + "…";
}

/** Build the static search index from book content (called once on mount). */
export function buildStaticIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const book of allBooks()) {
    for (const ch of book.chapters) {
      // Chapter overview
      items.push({
        id: `chapter:${book.slug}:${ch.num}`,
        kind: "chapter",
        bookSlug: book.slug,
        bookTitle: book.title_ar,
        chapterNum: ch.num,
        chapterTitle: ch.title_ar,
        title: `الفصل ${ch.num}: ${ch.title_ar}`,
        body: ch.title_en,
        href: `/books/${book.slug}/${ch.num}`,
      });

      // Summaries (3 levels) — each as a single document, plain text
      for (const level of ["concise", "standard", "detailed"] as const) {
        const html = ch.summary[level];
        if (!html) continue;
        const plain = stripHtml(html);
        items.push({
          id: `summary:${book.slug}:${ch.num}:${level}`,
          kind: "summary",
          bookSlug: book.slug,
          bookTitle: book.title_ar,
          chapterNum: ch.num,
          chapterTitle: ch.title_ar,
          title: `ملخص ${level === "concise" ? "مكثف" : level === "standard" ? "عادي" : "مفصّل"} — ${ch.title_ar}`,
          body: truncate(plain, 240),
          href: `/books/${book.slug}/${ch.num}/summary`,
        });
      }

      // Flashcards
      ch.flashcards.forEach((card, i) => {
        items.push({
          id: `flashcard:${book.slug}:${ch.num}:${i}`,
          kind: "flashcard",
          bookSlug: book.slug,
          bookTitle: book.title_ar,
          chapterNum: ch.num,
          chapterTitle: ch.title_ar,
          title: card.term,
          body: card.definition,
          href: `/books/${book.slug}/${ch.num}/flashcards`,
        });
      });

      // Quiz questions
      ch.quiz.forEach((q, i) => {
        items.push({
          id: `quiz:${book.slug}:${ch.num}:${i}`,
          kind: "quiz",
          bookSlug: book.slug,
          bookTitle: book.title_ar,
          chapterNum: ch.num,
          chapterTitle: ch.title_ar,
          title: q.question,
          body: `الإجابة: ${q.choices[q.answer]} — ${q.explanation}`,
          href: `/books/${book.slug}/${ch.num}/quiz`,
        });
      });
    }
  }

  return items;
}

/** Convert a DB note into a SearchItem. */
export function noteToSearchItem(note: ChapterNote, bookTitle: string, chapterTitle: string): SearchItem {
  return {
    id: `note:${note.id}`,
    kind: "note",
    bookSlug: note.bookSlug,
    bookTitle,
    chapterNum: note.chapterNum,
    chapterTitle,
    title: `ملاحظة — ${chapterTitle}`,
    body: truncate(note.content, 240),
    href: `/books/${note.bookSlug}/${note.chapterNum}/notes`,
  };
}

export function kindLabel(kind: SearchItemKind): string {
  switch (kind) {
    case "chapter":
      return "فصل";
    case "summary":
      return "ملخص";
    case "flashcard":
      return "بطاقة";
    case "quiz":
      return "سؤال";
    case "note":
      return "ملاحظة";
  }
}

export function kindColor(kind: SearchItemKind): string {
  switch (kind) {
    case "chapter":
      return "bg-royal-100 text-royal-800 border-royal-200";
    case "summary":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "flashcard":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "quiz":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "note":
      return "bg-violet-100 text-violet-800 border-violet-200";
  }
}
