import type { Book, Chapter } from "./types";
import chapter01 from "./chapters/chapter-01";
import chapter02 from "./chapters/chapter-02";
import chapter03 from "./chapters/chapter-03";
import chapter04 from "./chapters/chapter-04";
import chapter05 from "./chapters/chapter-05";
import chapter06 from "./chapters/chapter-06";
import chapter07 from "./chapters/chapter-07";
import chapter08 from "./chapters/chapter-08";
import chapter09 from "./chapters/chapter-09";
import chapter10 from "./chapters/chapter-10";
import chapter11 from "./chapters/chapter-11";
import chapter12 from "./chapters/chapter-12";

export const managementBook: Book = {
  title_ar: "مبادئ الإدارة",
  title_en: "Management Principles",
  program: "MBA - ماجستير إدارة الأعمال",
  total_pages: 388,
  slug: "management",
  chapters: [
    chapter01,
    chapter02,
    chapter03,
    chapter04,
    chapter05,
    chapter06,
    chapter07,
    chapter08,
    chapter09,
    chapter10,
    chapter11,
    chapter12,
  ],
};

export function getChapter(slug: string): Chapter | undefined {
  return managementBook.chapters.find((c) => c.slug === slug);
}

export function getChapterByNum(num: number): Chapter | undefined {
  return managementBook.chapters.find((c) => c.num === num);
}

export type { Book, Chapter, Flashcard, QuizItem, SummaryLevel } from "./types";
