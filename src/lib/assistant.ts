/**
 * "Smart" assistant — answers free-form questions by ranking content from the
 * books with fuse.js and composing a citation-backed reply. No external API.
 *
 * The reply is built deterministically: top hits become the answer body,
 * citations link to the source pages.
 */
import Fuse from "fuse.js";
import { buildStaticIndex, type SearchItem } from "./search-index";

export interface AssistantSource {
  kind: SearchItem["kind"];
  bookTitle: string;
  chapterNum: number;
  chapterTitle: string;
  title: string;
  body: string;
  href: string;
}

export interface AssistantAnswer {
  /** the original user question */
  question: string;
  /** short composed answer (1-3 paragraphs) */
  summary: string;
  /** ordered list of sources */
  sources: AssistantSource[];
  /** suggested follow-up topics from the same chapter */
  followUps: { label: string; href: string }[];
}

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "body", weight: 0.5 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
};

let cachedFuse: Fuse<SearchItem> | null = null;

function getFuse(): Fuse<SearchItem> {
  if (!cachedFuse) {
    cachedFuse = new Fuse(buildStaticIndex(), FUSE_OPTIONS);
  }
  return cachedFuse;
}

function rank(items: SearchItem[]): SearchItem[] {
  // Prefer flashcards/quiz first (they're concise + targeted), then summaries.
  const priority: Record<SearchItem["kind"], number> = {
    flashcard: 0,
    quiz: 1,
    summary: 2,
    chapter: 3,
    note: 4,
  };
  return [...items].sort(
    (a, b) => priority[a.kind] - priority[b.kind],
  );
}

/** Trim a body string for the answer summary. */
function snippet(text: string, max = 280): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const lastDot = slice.lastIndexOf(".");
  return (lastDot > 100 ? slice.slice(0, lastDot + 1) : slice) + "…";
}

export function answer(question: string): AssistantAnswer | null {
  const q = question.trim();
  if (!q) return null;

  const fuse = getFuse();
  const hits = fuse.search(q).slice(0, 8).map((r) => r.item);

  if (hits.length === 0) {
    return {
      question: q,
      summary:
        "لم أعثر على مادة مرتبطة بسؤالك في الكتب المتاحة. جرّب صياغة أخرى، أو استخدم البحث الشامل للاطلاع على المحتوى مباشرة.",
      sources: [],
      followUps: [],
    };
  }

  const ranked = rank(hits);
  const primary = ranked[0];
  const supports = ranked.slice(1, 4);

  // Compose the answer summary from the primary hit's body + a brief support.
  const lead = snippet(primary.body, 320);
  const supportingLines = supports
    .filter((s) => s.kind !== "chapter")
    .slice(0, 2)
    .map((s) => `• ${snippet(s.body, 160)}`)
    .join("\n");

  const summary = supportingLines
    ? `${lead}\n\n**نقاط داعمة:**\n${supportingLines}`
    : lead;

  const sources: AssistantSource[] = ranked.slice(0, 5).map((s) => ({
    kind: s.kind,
    bookTitle: s.bookTitle,
    chapterNum: s.chapterNum,
    chapterTitle: s.chapterTitle,
    title: s.title,
    body: snippet(s.body, 200),
    href: s.href,
  }));

  // Follow-ups: pull a few more items from the same chapter as the primary
  const primaryChapter = primary.chapterNum;
  const followUps = hits
    .filter(
      (it) =>
        it.chapterNum === primaryChapter &&
        it.id !== primary.id &&
        (it.kind === "flashcard" || it.kind === "quiz"),
    )
    .slice(0, 3)
    .map((it) => ({
      label: snippet(it.title, 60),
      href: it.href,
    }));

  return { question: q, summary, sources, followUps };
}
