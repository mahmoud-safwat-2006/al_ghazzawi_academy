"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCheck,
  RotateCw,
  Sparkles,
  Zap,
  ChevronsRight,
  PartyPopper,
} from "lucide-react";
import { useDueFlashcards, reviewFlashcard } from "@/lib/use-db";
import { getFlashcard, getChapterFromBook } from "@/lib/books";
import { dueLabel, type ReviewQuality } from "@/lib/sm2";
import { logStudySession } from "@/lib/db";

interface DueCardItem {
  bookSlug: string;
  chapterNum: number;
  cardIndex: number;
  term: string;
  term_en: string;
  definition: string;
  chapterTitle: string;
  nextReview?: number;
}

export function ReviewRunner() {
  const dueStates = useDueFlashcards();
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionStartCount, setSessionStartCount] = useState<number | null>(
    null,
  );
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Build the queue of due cards joined with their content.
  // Once a card has been reviewed in this session it stays in the queue (frozen list)
  // until the user reloads, so completion state is visible.
  const queue = useMemo<DueCardItem[]>(() => {
    if (!dueStates) return [];
    // Include both due states AND any in-content card that was never reviewed yet?
    // For simplicity in v1: only show cards that have been seen at least once and are due.
    const out: DueCardItem[] = [];
    for (const s of dueStates) {
      const card = getFlashcard(s.bookSlug, s.chapterNum, s.cardIndex);
      if (!card) continue;
      const chapter = getChapterFromBook(s.bookSlug, s.chapterNum);
      out.push({
        bookSlug: s.bookSlug,
        chapterNum: s.chapterNum,
        cardIndex: s.cardIndex,
        term: card.term,
        term_en: card.term_en,
        definition: card.definition,
        chapterTitle: chapter?.title_ar ?? `الفصل ${s.chapterNum}`,
        nextReview: s.nextReview,
      });
    }
    return out;
    // We intentionally exclude `reviewedIds` from deps — we want the queue order stable
    // while the user works through it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueStates?.length]);

  // Capture the starting size of the queue once the data first loads.
  useEffect(() => {
    if (dueStates && sessionStartCount === null) {
      setSessionStartCount(queue.length);
    }
  }, [dueStates, queue.length, sessionStartCount]);

  const total = queue.length;
  const current = queue[pos];

  const remaining = Math.max(0, total - pos);
  const startedFrom = sessionStartCount ?? total;
  const progressPct =
    startedFrom === 0
      ? 100
      : Math.min(100, Math.round(((sessionCount) / startedFrom) * 100));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "1") {
        void grade("again");
      } else if (e.key === "2") {
        void grade("hard");
      } else if (e.key === "3") {
        void grade("good");
      } else if (e.key === "4") {
        void grade("easy");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, current?.bookSlug, current?.chapterNum, current?.cardIndex]);

  async function grade(quality: ReviewQuality) {
    if (!current) return;
    await reviewFlashcard(
      current.bookSlug,
      current.chapterNum,
      current.cardIndex,
      quality,
    );
    void logStudySession("flashcards", current.bookSlug, current.chapterNum);
    setReviewedIds((prev) =>
      new Set(prev).add(
        `${current.bookSlug}:${current.chapterNum}:${current.cardIndex}`,
      ),
    );
    setSessionCount((c) => c + 1);
    setPos((p) => p + 1);
    setFlipped(false);
  }

  // Loading state
  if (!dueStates) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <div className="inline-block size-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted">جاري تحميل البطاقات…</p>
      </div>
    );
  }

  // Empty state — no due cards at all
  if (total === 0 && sessionCount === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Sparkles className="size-7" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">
          لا توجد بطاقات مستحقة الآن
        </h2>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto leading-relaxed">
          ابدأ بمراجعة بطاقات أي فصل لتفعيل خوارزمية المراجعة الذكية. ستعود
          إليك البطاقات تلقائياً في وقتها المثالي.
        </p>
        <Link
          href="/books/hr"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          تصفّح الكتاب
          <ArrowLeft className="size-4" />
        </Link>
      </div>
    );
  }

  // Done state — finished all queued cards
  if (pos >= total) {
    return (
      <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/40 dark:to-emerald-900/10 p-10 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <PartyPopper className="size-7" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-1">
          أنهيت جلسة المراجعة!
        </h2>
        <p className="text-sm text-muted mb-1">
          راجعت <span className="font-bold text-foreground">{sessionCount}</span>{" "}
          بطاقة. خوارزمية SM-2 ستذكرك بكل بطاقة في وقتها.
        </p>
        <p className="text-xs text-muted mb-5">
          عُد غداً أو بعد بضعة أيام للجولة التالية.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            لوحة التقدم
            <ArrowLeft className="size-4" />
          </Link>
          <Link
            href="/books/hr"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/40 transition-colors"
          >
            عودة للكتاب
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const due = dueLabel(current.nextReview);

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          البطاقة {pos + 1} من {startedFrom}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full px-2 py-0.5">
            <CheckCheck className="size-3" />
            {sessionCount} راجعت
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-full px-2 py-0.5">
            <Zap className="size-3" />
            {remaining} متبقية
          </span>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Card */}
      <div className="[perspective:1500px] mb-5">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full aspect-[3/2] sm:aspect-[16/9] [transform-style:preserve-3d] transition-transform duration-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 rounded-3xl"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          aria-label="اقلب البطاقة"
        >
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-royal-700 text-white p-6 sm:p-10 shadow-card flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute top-0 end-0 size-48 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 start-0 size-40 bg-amber-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-4 start-4 text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
              {current.chapterTitle}
            </div>
            <div className="absolute top-4 end-4 text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
              {due.text}
            </div>
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

      {/* SM-2 4-button grading */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GradeButton
          quality="again"
          onClick={() => grade("again")}
          color="rose"
          label="مجدداً"
          hint="نسيت"
          kbd="1"
        />
        <GradeButton
          quality="hard"
          onClick={() => grade("hard")}
          color="orange"
          label="صعبة"
          hint="بصعوبة"
          kbd="2"
        />
        <GradeButton
          quality="good"
          onClick={() => grade("good")}
          color="emerald"
          label="جيدة"
          hint="تذكرت"
          kbd="3"
        />
        <GradeButton
          quality="easy"
          onClick={() => grade("easy")}
          color="cyan"
          label="سهلة"
          hint="فوراً"
          kbd="4"
        />
      </div>

      {!flipped && (
        <p className="mt-4 text-center text-xs text-muted">
          اضغط البطاقة (أو Space) لرؤية التعريف قبل التقييم
        </p>
      )}

      <div className="mt-6 flex items-center justify-center">
        <button
          onClick={() => {
            setPos((p) => p + 1);
            setFlipped(false);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ChevronsRight className="size-3.5" />
          تخطي بدون تقييم
        </button>
      </div>
    </div>
  );
}

type GradeColor = "rose" | "orange" | "emerald" | "cyan";

function GradeButton({
  onClick,
  color,
  label,
  hint,
  kbd,
}: {
  quality: ReviewQuality;
  onClick: () => void;
  color: GradeColor;
  label: string;
  hint: string;
  kbd: string;
}) {
  const styles: Record<GradeColor, string> = {
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/60",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-950/60",
  };

  const kbdStyles: Record<GradeColor, string> = {
    rose: "bg-rose-200/60 dark:bg-rose-900/60",
    orange: "bg-orange-200/60 dark:bg-orange-900/60",
    emerald: "bg-emerald-200/60 dark:bg-emerald-900/60",
    cyan: "bg-cyan-200/60 dark:bg-cyan-900/60",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${styles[color]}`}
    >
      <BrainCircuit className="size-4 mb-1" />
      {label}
      <span className="text-[10px] font-medium opacity-70 mt-0.5">{hint}</span>
      <kbd
        className={`hidden sm:inline mt-1 rounded ${kbdStyles[color]} px-1.5 text-[10px] font-mono`}
      >
        {kbd}
      </kbd>
    </button>
  );
}
