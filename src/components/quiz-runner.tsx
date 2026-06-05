"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  History,
  RotateCcw,
  XCircle,
  Trophy,
} from "lucide-react";
import type { QuizItem } from "@/content/hr/types";
import { getDB, logStudySession, upsertChapterProgress } from "@/lib/db";
import { useChapterQuizAttempts } from "@/lib/use-db";

interface QuizRunnerProps {
  questions: QuizItem[];
  chapterNum: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** book slug, defaults to "hr" */
  bookSlug?: string;
}

export function QuizRunner({
  questions,
  chapterNum,
  hasNext,
  bookSlug = "hr",
}: QuizRunnerProps) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(total).fill(null)
  );
  const [finished, setFinished] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const savedAttemptRef = useRef(false);

  const previousAttempts = useChapterQuizAttempts(bookSlug, chapterNum);

  const current = questions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current.answer;

  const score = useMemo(
    () =>
      answers.reduce<number>(
        (s, a, i) => s + (a === questions[i].answer ? 1 : 0),
        0
      ),
    [answers, questions]
  );

  function choose(i: number) {
    if (isAnswered) return;
    setSelected(i);
    const next = [...answers];
    next[index] = i;
    setAnswers(next);
  }

  function goNext() {
    if (index < total - 1) {
      setIndex(index + 1);
      setSelected(answers[index + 1]);
    } else {
      setFinished(true);
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex(index - 1);
      setSelected(answers[index - 1]);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswers(Array(total).fill(null));
    setFinished(false);
    startedAtRef.current = Date.now();
    savedAttemptRef.current = false;
  }

  // Persist the attempt to Dexie when the quiz finishes (once per run).
  useEffect(() => {
    if (!finished || savedAttemptRef.current) return;
    savedAttemptRef.current = true;
    const percent = Math.round((score / total) * 100);
    const durationSec = Math.round(
      (Date.now() - startedAtRef.current) / 1000,
    );
    void (async () => {
      try {
        await getDB().quizAttempts.add({
          bookSlug,
          chapterNum,
          date: Date.now(),
          score,
          total,
          percent,
          answers,
          durationSec,
        });
        await upsertChapterProgress(bookSlug, chapterNum, {
          quizCompleted: true,
        });
        await logStudySession("quiz", bookSlug, chapterNum, durationSec);
      } catch (err) {
        console.warn("[quiz] failed to save attempt", err);
      }
    })();
  }, [finished, answers, score, total, bookSlug, chapterNum]);

  if (finished) {
    const percent = Math.round((score / total) * 100);
    const tier =
      percent >= 90
        ? { label: "ممتاز", color: "emerald", emoji: "🏆" }
        : percent >= 75
        ? { label: "جيد جداً", color: "cyan", emoji: "✨" }
        : percent >= 60
        ? { label: "جيد", color: "amber", emoji: "👍" }
        : { label: "يحتاج مراجعة", color: "rose", emoji: "📚" };

    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft text-center">
        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-royal-600 text-white shadow-card mb-5">
          <Trophy className="size-10" />
        </div>
        <div className="text-5xl mb-2">{tier.emoji}</div>
        <h2 className="text-2xl font-black text-foreground">{tier.label}</h2>
        <p className="mt-2 text-muted">
          أجبت بشكل صحيح على {score} من {total} أسئلة
        </p>

        <div className="mt-6 mx-auto max-w-xs">
          <div className="h-3 rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-royal-600 to-cyan-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">{percent}%</div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="size-4" />
            أعد المحاولة
          </button>
          <Link
            href={`/books/${bookSlug}/${chapterNum}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-2.5 text-sm font-bold hover:border-foreground/40 transition-colors"
          >
            رجوع للفصل
          </Link>
          {hasNext && (
            <Link
              href={`/books/${bookSlug}/${chapterNum + 1}/quiz`}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-cyan-700 transition-colors"
            >
              كويز الفصل التالي
              <ArrowLeft className="size-4" />
            </Link>
          )}
        </div>

        {previousAttempts && previousAttempts.length > 1 && (
          <div className="mt-8 text-start">
            <div className="flex items-center gap-2 text-sm font-bold text-muted mb-3">
              <History className="size-4" />
              محاولاتك السابقة ({previousAttempts.length})
            </div>
            <div className="grid gap-2">
              {previousAttempts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted">
                    {new Date(a.date).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-bold text-foreground">
                    {a.score}/{a.total}{" "}
                    <span className="text-xs text-muted">({a.percent}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <details className="mt-8 text-start">
          <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-foreground transition-colors text-center">
            عرض كل الإجابات
          </summary>
          <div className="mt-4 space-y-3">
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === q.answer;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${
                    correct
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-rose-200 bg-rose-50/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="size-4 text-rose-600 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {i + 1}. {q.question}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        الإجابة الصحيحة:{" "}
                        <span className="font-semibold text-emerald-700">
                          {q.choices[q.answer]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
          السؤال {index + 1} من {total}
        </div>
        <div className="text-xs text-muted font-medium">
          الفصل {chapterNum}
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-royal-600 to-cyan-500 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
        {current.question}
      </h2>

      <div className="mt-6 space-y-2.5">
        {current.choices.map((choice, i) => {
          const isThis = selected === i;
          const isRight = current.answer === i;
          let cls =
            "w-full text-start rounded-xl border-2 px-4 py-3.5 text-sm sm:text-[15px] font-medium transition-all flex items-start gap-3";

          if (!isAnswered) {
            cls +=
              " border-border bg-card hover:border-royal-400/60 hover:bg-royal-50/50 cursor-pointer";
          } else if (isRight) {
            cls += " border-emerald-400 bg-emerald-50 text-emerald-900";
          } else if (isThis && !isRight) {
            cls += " border-rose-400 bg-rose-50 text-rose-900";
          } else {
            cls += " border-border bg-card opacity-60";
          }

          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={isAnswered}
              className={cls}
            >
              <span
                className={`size-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  isAnswered && isRight
                    ? "bg-emerald-500 text-white"
                    : isAnswered && isThis && !isRight
                    ? "bg-rose-500 text-white"
                    : "bg-border/80 text-muted"
                }`}
              >
                {String.fromCharCode(1571 + i)}
              </span>
              <span className="flex-1">{choice}</span>
              {isAnswered && isRight && (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              )}
              {isAnswered && isThis && !isRight && (
                <XCircle className="size-5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`mt-5 rounded-xl border-2 p-4 ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-rose-200 bg-rose-50/60"
          }`}
        >
          <div
            className={`text-xs font-bold uppercase tracking-wider mb-1 ${
              isCorrect ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isCorrect ? "✓ إجابة صحيحة" : "✗ إجابة خاطئة"}
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {current.explanation}
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground/40 transition-colors"
        >
          <ArrowRight className="size-4" />
          السابق
        </button>
        <div className="text-xs text-muted font-medium">
          {answers.filter((a) => a !== null).length} / {total} مُجاب
        </div>
        <button
          onClick={goNext}
          disabled={!isAnswered}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {index === total - 1 ? "إنهاء" : "التالي"}
          <ArrowLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}
