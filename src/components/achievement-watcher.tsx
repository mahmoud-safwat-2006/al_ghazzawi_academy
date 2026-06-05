"use client";

import { useEffect, useRef, useState } from "react";
import { Award, X } from "lucide-react";
import {
  useAllStudySessions,
  useAllQuizAttempts,
  useAllFlashcardStates,
  useAllReadingProgress,
  useAllNotes,
} from "@/lib/use-db";
import {
  aggregate,
  evaluateAchievements,
  tierColor,
  tierLabel,
  type AchievementDef,
} from "@/lib/achievements";

/**
 * Sits in the root layout. Watches every DB change that could unlock a badge,
 * runs the achievement engine, and shows a toast for any newly-unlocked one.
 * Single instance — no UI of its own beyond toasts.
 */
export function AchievementWatcher() {
  const sessions = useAllStudySessions();
  const attempts = useAllQuizAttempts();
  const flashcards = useAllFlashcardStates();
  const progress = useAllReadingProgress();
  const notes = useAllNotes();

  const [toasts, setToasts] = useState<AchievementDef[]>([]);
  const evalLock = useRef(false);

  useEffect(() => {
    if (!sessions || !attempts || !flashcards || !progress || !notes) return;
    if (evalLock.current) return;
    evalLock.current = true;
    const stats = aggregate(sessions, attempts, flashcards, progress, notes);
    void evaluateAchievements(stats)
      .then((newly) => {
        if (newly.length > 0) {
          setToasts((prev) => [...prev, ...newly]);
        }
      })
      .finally(() => {
        evalLock.current = false;
      });
  }, [sessions, attempts, flashcards, progress, notes]);

  // Auto-dismiss after 6s.
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 end-4 z-[100] flex flex-col gap-2 max-w-sm"
      role="status"
      aria-live="polite"
    >
      {toasts.map((a, i) => (
        <div
          key={`${a.id}-${i}`}
          className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-card shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div
            className={`flex-shrink-0 size-12 rounded-xl bg-gradient-to-br ${tierColor(a.tier)} flex items-center justify-center text-2xl shadow-md`}
          >
            {a.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Award className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                شارة جديدة — {tierLabel(a.tier)}
              </span>
            </div>
            <div className="text-sm font-black text-foreground truncate">
              {a.name}
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {a.description}
            </div>
          </div>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((_, idx) => idx !== i))
            }
            className="flex-shrink-0 rounded-full p-1 hover:bg-border/40 transition-colors"
            aria-label="إغلاق"
          >
            <X className="size-3.5 text-muted" />
          </button>
        </div>
      ))}
    </div>
  );
}
