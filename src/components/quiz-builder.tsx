"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  ListChecks,
  Lock,
  Square,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  bookChapters,
  countAvailable,
  difficultyLabel,
  generateCustomQuiz,
  type DifficultyFilter,
  type GeneratedQuestion,
} from "@/lib/quiz-generator";
import { allBooks } from "@/lib/books";
import { useAccess, canInteract } from "@/lib/access";
import { CustomQuizRunner } from "./custom-quiz-runner";

const DIFFICULTIES: DifficultyFilter[] = ["mixed", "easy", "medium", "hard"];
const COUNTS = [5, 10, 15, 20, 30] as const;

export function QuizBuilder() {
  const books = allBooks();
  const [bookSlug, setBookSlug] = useState(books[0]?.slug ?? "hr");
  const chapters = useMemo(() => bookChapters(bookSlug), [bookSlug]);
  const [selectedChapters, setSelectedChapters] = useState<number[]>(() =>
    chapters.map((c) => c.num),
  );
  const [count, setCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("mixed");
  const [quiz, setQuiz] = useState<GeneratedQuestion[] | null>(null);

  // Access gating: a trial student may only build quizzes from chapters they can
  // actually interact with (the free trial chapter). Computed during render (no
  // effect) so it stays correct as the tier loads — closing the loophole where
  // the custom builder bypassed per-chapter locks.
  const { tier, loading } = useAccess();
  const effectiveTier = loading ? "trial" : tier; // conservative while loading
  const isUnlocked = (num: number) => canInteract(bookSlug, num, effectiveTier);
  const unlockedChapters = chapters.filter((c) => isUnlocked(c.num));
  // Only unlocked chapters count toward generation, regardless of stale picks.
  const effectiveSelected = selectedChapters.filter(isUnlocked);

  const available = useMemo(
    () =>
      countAvailable(
        bookSlug,
        selectedChapters.filter((num) => canInteract(bookSlug, num, effectiveTier)),
        difficulty,
      ),
    [bookSlug, selectedChapters, difficulty, effectiveTier],
  );

  const effectiveCount = Math.min(count, available);

  function toggleChapter(num: number) {
    if (!isUnlocked(num)) return;
    setSelectedChapters((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num].sort((a, b) => a - b),
    );
  }

  const allUnlockedSelected =
    unlockedChapters.length > 0 &&
    unlockedChapters.every((c) => selectedChapters.includes(c.num));

  function toggleAll() {
    if (allUnlockedSelected) {
      setSelectedChapters((prev) => prev.filter((n) => !isUnlocked(n)));
    } else {
      setSelectedChapters((prev) =>
        Array.from(
          new Set([...prev, ...unlockedChapters.map((c) => c.num)]),
        ).sort((a, b) => a - b),
      );
    }
  }

  function start() {
    const generated = generateCustomQuiz({
      bookSlug,
      chapterNums: effectiveSelected,
      count,
      difficulty,
    });
    setQuiz(generated);
  }

  if (quiz) {
    return (
      <CustomQuizRunner
        questions={quiz}
        bookSlug={bookSlug}
        onRestartConfig={() => setQuiz(null)}
      />
    );
  }

  const canStart = effectiveSelected.length > 0 && available > 0;

  return (
    <div className="space-y-6">
      {/* Trial notice */}
      {effectiveTier === "trial" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm">
          <Lock className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-amber-800">
            <span className="font-bold">حساب تجريبي:</span> الكويز المخصص متاح
            للفصل المجاني فقط.{" "}
            <Link
              href="/welcome"
              className="font-bold underline hover:text-amber-900"
            >
              فعّل حسابك
            </Link>{" "}
            لفتح كل الفصول.
          </div>
        </div>
      )}

      {/* Book picker */}
      {books.length > 1 && (
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="size-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-foreground">الكتاب</h3>
          </div>
          <div className="grid gap-2">
            {books.map((b) => (
              <button
                key={b.slug}
                onClick={() => {
                  setBookSlug(b.slug);
                  setSelectedChapters(bookChapters(b.slug).map((c) => c.num));
                }}
                className={`text-start rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                  bookSlug === b.slug
                    ? "border-cyan-500 bg-cyan-50/50 text-foreground"
                    : "border-border bg-card text-muted hover:border-foreground/30"
                }`}
              >
                {b.title_ar}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Chapters */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-foreground">
              الفصول ({effectiveSelected.length} / {chapters.length})
            </h3>
          </div>
          <button
            onClick={toggleAll}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-900 transition-colors"
          >
            {allUnlockedSelected ? "إلغاء الكل" : "اختر الكل"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {chapters.map((c) => {
            const unlocked = isUnlocked(c.num);
            const checked = unlocked && selectedChapters.includes(c.num);
            return (
              <button
                key={c.num}
                onClick={() => toggleChapter(c.num)}
                disabled={!unlocked}
                title={unlocked ? undefined : "يتطلب تفعيل الحساب"}
                className={`text-start rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all flex items-start gap-2 ${
                  checked
                    ? "border-cyan-500 bg-cyan-50/50"
                    : unlocked
                      ? "border-border bg-card hover:border-foreground/30"
                      : "border-border bg-border/20 opacity-60 cursor-not-allowed"
                }`}
              >
                {!unlocked ? (
                  <Lock className="size-4 text-amber-500 mt-0.5 shrink-0" />
                ) : checked ? (
                  <CheckSquare className="size-4 text-cyan-600 mt-0.5 shrink-0" />
                ) : (
                  <Square className="size-4 text-muted mt-0.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-foreground text-[13px] font-bold">
                    الفصل {c.num}
                  </div>
                  <div className="text-[11px] text-muted line-clamp-1">
                    {c.title}
                  </div>
                </div>
                <span className="text-[10px] text-muted shrink-0 mt-0.5">
                  {unlocked ? `${c.quizCount} س` : "🔒"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Difficulty */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="size-4 text-cyan-600" />
          <h3 className="text-sm font-bold text-foreground">الصعوبة</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-all ${
                difficulty === d
                  ? "border-cyan-500 bg-cyan-50/50 text-foreground"
                  : "border-border bg-card text-muted hover:border-foreground/30"
              }`}
            >
              {difficultyLabel(d)}
            </button>
          ))}
        </div>
      </section>

      {/* Count */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-foreground">عدد الأسئلة</h3>
          </div>
          <span className="text-xs text-muted">متاح: {available}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              disabled={n > available && available > 0}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-black transition-all ${
                count === n
                  ? "border-cyan-500 bg-cyan-50/50 text-foreground"
                  : "border-border bg-card text-muted hover:border-foreground/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {count > available && available > 0 && (
          <p className="mt-3 text-xs text-amber-700">
            ⚠ سيتم توليد {effectiveCount} سؤال فقط (المتاح أقل من المطلوب)
          </p>
        )}
      </section>

      {/* Action */}
      <button
        onClick={start}
        disabled={!canStart}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-royal-600 to-cyan-600 text-white px-6 py-4 text-base font-black shadow-card hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles className="size-5" />
        ابدأ الكويز ({effectiveCount} سؤال)
      </button>

      {available === 0 && effectiveSelected.length > 0 && (
        <p className="text-center text-sm text-rose-700">
          لا توجد أسئلة مطابقة — جرّب صعوبة «مختلط» أو فصولاً أخرى
        </p>
      )}
    </div>
  );
}
