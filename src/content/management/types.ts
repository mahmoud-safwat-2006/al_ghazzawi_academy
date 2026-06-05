export type SummaryLevel = "concise" | "standard" | "detailed";
export type Difficulty = "easy" | "medium" | "hard";

export interface Flashcard {
  term: string;
  term_en: string;
  definition: string;
}

export interface QuizItem {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty?: Difficulty;
}

export interface Chapter {
  num: number;
  slug: string;
  title_ar: string;
  title_en: string;
  start_page: number;
  end_page: number;
  page_count: number;
  summary: {
    concise?: string;
    standard?: string;
    detailed: string;
  };
  flashcards: Flashcard[];
  quiz: QuizItem[];
}

export interface Book {
  title_ar: string;
  title_en: string;
  program: string;
  total_pages: number;
  slug: string;
  chapters: Chapter[];
}
