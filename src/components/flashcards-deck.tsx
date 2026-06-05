"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCheck,
  Download,
  RotateCw,
  Shuffle,
  Sparkles,
} from "lucide-react";
import type { Flashcard } from "@/content/hr/types";
import { logStudySession, upsertChapterProgress } from "@/lib/db";
import {
  setFlashcardStatus,
  useChapterFlashcardStates,
} from "@/lib/use-db";
import { downloadAnkiTsv } from "@/lib/anki-export";

interface FlashcardsDeckProps {
  cards: Flashcard[];
  chapterNum: number;
  hasNext: boolean;
  /** book slug, defaults to "hr" */
  bookSlug?: string;
}

function shuffleIndices(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashcardsDeck({
  cards,
  chapterNum,
  hasNext,
  bookSlug = "hr",
}: FlashcardsDeckProps) {
  // We track *original* indices in a shuffled order so persisted state stays consistent.
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: cards.length }, (_, i) => i),
  );
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = order.length;
  const currentIndex = order[pos];
  const current = cards[currentIndex];

  const states = useChapterFlashcardStates(bookSlug, chapterNum);
  const statusMap = useMemo(() => {
    const map = new Map<number, "new" | "learning" | "known" | "needsReview">();
    states?.forEach((s) => map.set(s.cardIndex, s.status));
    return map;
  }, [states]);
  const currentStatus = statusMap.get(currentIndex) ?? "new";

  const counts = useMemo(() => {
    let known = 0;
    let review = 0;
    statusMap.forEach((s) => {
      if (s === "known") known += 1;
      else if (s === "needsReview") review += 1;
    });
    return { known, review, remaining: cards.length - known - review };
  }, [statusMap, cards.length]);

  // Mark "flashcards reviewed" once the user reaches the last card.
  useEffect(() => {
    if (pos === total - 1) {
      void upsertChapterProgress(bookSlug, chapterNum, {
        flashcardsReviewed: true,
      });
      void logStudySession("flashcards", bookSlug, chapterNum);
    }
  }, [pos, total, bookSlug, chapterNum]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") {
        goNext();
      } else if (e.key === "ArrowRight") {
        goPrev();
      } else if (e.key === "k" || e.key === "K") {
        void mark("known");
      } else if (e.key === "r" || e.key === "R") {
        void mark("needsReview");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, total, currentIndex]);

  function goNext() {
    if (pos < total - 1) {
      setPos(pos + 1);
      setFlipped(false);
    }
  }

  function goPrev() {
    if (pos > 0) {
      setPos(pos - 1);
      setFlipped(false);
    }
  }

  function reshuffle() {
    setOrder(shuffleIndices(cards.length));
    setPos(0);
    setFlipped(false);
  }

  async function mark(status: "known" | "needsReview") {
    await setFlashcardStatus(bookSlug, chapterNum, currentIndex, status);
    // Auto-advance after marking
    if (pos < total - 1) {
      setPos(pos + 1);
      setFlipped(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          البطاقة {pos + 1} من {total}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full px-2 py-0.5">
            <CheckCheck className="size-3" />
            {counts.known}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-full px-2 py-0.5">
            <BrainCircuit className="size-3" />
            {counts.review}
          </span>
          <button
            onClick={reshuffle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold hover:border-amber-300 transition-colors"
          >
            <Shuffle className="size-3.5" />
            خلط
          </button>
          <button
            onClick={() =>
              downloadAnkiTsv({
                fileBase: `${bookSlug}-chapter-${chapterNum}`,
                tag: `${bookSlug.toUpperCase()}::Chapter${chapterNum}`,
                cards,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold hover:border-cyan-300 transition-colors"
            aria-label="تصدير لـ Anki"
          >
            <Download className="size-3.5" />
            Anki
          </button>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all"
          style={{ width: `${((pos + 1) / total) * 100}%` }}
        />
      </div>

      <div className="[perspective:1500px] mb-5">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full aspect-[3/2] sm:aspect-[16/9] [transform-style:preserve-3d] transition-transform duration-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 rounded-3xl"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          aria-label="اقلب البطاقة"
        >
          {/* Front: term */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-royal-700 text-white p-6 sm:p-10 shadow-card flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute top-0 end-0 size-48 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 start-0 size-40 bg-amber-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            {currentStatus !== "new" && (
              <div
                className={`absolute top-4 start-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  currentStatus === "known"
                    ? "bg-emerald-500/30 text-emerald-100"
                    : "bg-rose-500/30 text-rose-100"
                }`}
              >
                {currentStatus === "known" ? "أعرفها" : "مراجعة"}
              </div>
            )}
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="size-3" />
                مصطلح
              </div>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                {current.term}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/70 font-medium" dir="ltr">
                {current.term_en}
              </p>
              <div className="mt-8 text-xs text-white/60 font-medium inline-flex items-center gap-1.5">
                <RotateCw className="size-3" />
                اضغط للقلب
              </div>
            </div>
          </div>

          {/* Back: definition */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-card border-2 border-amber-300/60 p-6 sm:p-10 shadow-card flex flex-col justify-center text-center overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
              التعريف
            </div>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              {current.definition}
            </p>
            <div className="mt-6 text-xs text-muted font-medium inline-flex items-center justify-center gap-1.5">
              <RotateCw className="size-3" />
              اضغط للعودة
            </div>
          </div>
        </button>
      </div>

      {/* Self-assessment buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => mark("needsReview")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 px-4 py-3 text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
        >
          <BrainCircuit className="size-4" />
          أحتاج مراجعتها
          <kbd className="hidden sm:inline ms-1 rounded bg-rose-200/60 dark:bg-rose-900/60 px-1 text-[10px] font-mono">R</kbd>
        </button>
        <button
          onClick={() => mark("known")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 px-4 py-3 text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors"
        >
          <CheckCheck className="size-4" />
          أعرفها
          <kbd className="hidden sm:inline ms-1 rounded bg-emerald-200/60 dark:bg-emerald-900/60 px-1 text-[10px] font-mono">K</kbd>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={pos === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground/40 transition-colors"
        >
          <ArrowRight className="size-4" />
          السابقة
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-amber-700 transition-colors"
        >
          <RotateCw className="size-4" />
          اقلب
        </button>
        <button
          onClick={goNext}
          disabled={pos === total - 1}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground/40 transition-colors"
        >
          التالية
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {pos === total - 1 && (
        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <h3 className="font-bold text-foreground">أنهيت بطاقات الفصل</h3>
          <p className="mt-1 text-sm text-muted">
            راجع البطاقات مرة أخرى أو انتقل للفصل التالي
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={reshuffle}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold hover:border-amber-300 transition-colors"
            >
              <Shuffle className="size-3.5" />
              ابدأ من جديد
            </button>
            {hasNext && (
              <Link
                href={`/books/${bookSlug}/${chapterNum + 1}/flashcards`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-amber-700 transition-colors"
              >
                بطاقات الفصل التالي
                <ArrowLeft className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
