// One-shot: convert legacy content.js to TypeScript modules under src/content/hr/chapters
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const legacyPath = "D:/MMM/study-app/data/content.js";
const outDir = resolve(projectRoot, "src/content/hr/chapters");

const require = createRequire(import.meta.url);
const CONTENT = require(legacyPath);

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

function padNum(n) {
  return String(n).padStart(2, "0");
}

function escapeBackticks(s) {
  // template literal-safe: escape backticks and ${ to avoid interpolation
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function tsString(s) {
  // double-quoted JSON string (handles unicode + special chars)
  return JSON.stringify(s);
}

const chapterFiles = [];

for (const ch of CONTENT.chapters) {
  const slug = `chapter-${padNum(ch.num)}`;
  const detailedTrimmed = ch.summary.trim();

  const flashcards = ch.flashcards
    .map(
      (fc) =>
        `  { term: ${tsString(fc.term)}, term_en: ${tsString(
          fc.term_en
        )}, definition: ${tsString(fc.definition)} }`
    )
    .join(",\n");

  const quiz = ch.quiz
    .map(
      (q) =>
        `  {\n    question: ${tsString(q.question)},\n    choices: [${q.choices
          .map(tsString)
          .join(", ")}],\n    answer: ${q.answer},\n    explanation: ${tsString(
          q.explanation
        )}\n  }`
    )
    .join(",\n");

  const file = `import type { Chapter } from "../types";

const chapter: Chapter = {
  num: ${ch.num},
  slug: ${tsString(slug)},
  title_ar: ${tsString(ch.title_ar)},
  title_en: ${tsString(ch.title_en)},
  start_page: ${ch.start_page},
  end_page: ${ch.end_page},
  page_count: ${ch.page_count},
  summary: {
    detailed: \`${escapeBackticks(detailedTrimmed)}\`,
  },
  flashcards: [
${flashcards}
  ],
  quiz: [
${quiz}
  ],
};

export default chapter;
`;

  const outPath = resolve(outDir, `${slug}.ts`);
  writeFileSync(outPath, file, "utf8");
  chapterFiles.push({ num: ch.num, slug, path: outPath });
  console.log(`✓ ${slug} (${ch.flashcards.length} cards, ${ch.quiz.length} questions)`);
}

// Generate index.ts
const importLines = chapterFiles
  .map((c) => `import chapter${padNum(c.num)} from "./chapters/${c.slug}";`)
  .join("\n");

const arrayLines = chapterFiles.map((c) => `  chapter${padNum(c.num)}`).join(",\n");

const indexFile = `import type { Book, Chapter } from "./types";
${importLines}

export const hrBook: Book = {
  title_ar: ${tsString(CONTENT.book.title_ar)},
  title_en: ${tsString(CONTENT.book.title_en)},
  program: ${tsString(CONTENT.book.program)},
  total_pages: ${CONTENT.book.total_pages},
  slug: "hr",
  chapters: [
${arrayLines}
  ],
};

export function getChapter(slug: string): Chapter | undefined {
  return hrBook.chapters.find((c) => c.slug === slug);
}

export function getChapterByNum(num: number): Chapter | undefined {
  return hrBook.chapters.find((c) => c.num === num);
}

export type { Book, Chapter } from "./types";
export type { Flashcard, QuizItem, SummaryLevel } from "./types";
`;

writeFileSync(resolve(projectRoot, "src/content/hr/index.ts"), indexFile, "utf8");
console.log(`\n✓ index.ts written`);
console.log(`\nTotal: ${chapterFiles.length} chapters converted.`);
