"use client";

import { useMemo } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import {
  useAllStudySessions,
  useAllQuizAttempts,
  useAllFlashcardStates,
  useAllReadingProgress,
  useUnlockedAchievements,
  useAllNotes,
} from "@/lib/use-db";
import {
  ACHIEVEMENTS,
  aggregate,
  tierColor,
  tierLabel,
} from "@/lib/achievements";

export function AchievementsGallery() {
  const sessions = useAllStudySessions();
  const attempts = useAllQuizAttempts();
  const flashcards = useAllFlashcardStates();
  const progress = useAllReadingProgress();
  const unlocked = useUnlockedAchievements();
  const notes = useAllNotes();

  const loading =
    !sessions || !attempts || !flashcards || !progress || !unlocked || !notes;

  const unlockedMap = useMemo(() => {
    const m = new Map<string, number>();
    unlocked?.forEach((a) => m.set(a.id, a.unlockedAt));
    return m;
  }, [unlocked]);

  const stats = useMemo(() => {
    if (loading) return null;
    return aggregate(sessions, attempts, flashcards, progress, notes);
  }, [loading, sessions, attempts, flashcards, progress, notes]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <div className="inline-block size-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted">جاري التحميل…</p>
      </div>
    );
  }

  const unlockedCount = unlockedMap.size;
  const total = ACHIEVEMENTS.length;
  const percent = Math.round((unlockedCount / total) * 100);

  return (
    <div>
      {/* Overall progress */}
      <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/40 dark:to-orange-950/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              التقدّم العام
            </div>
            <div className="text-2xl font-black text-foreground mt-1">
              {unlockedCount} / {total} شارة
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 dark:text-amber-400">
            {percent}%
          </div>
        </div>
        <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-950/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedMap.has(a.id);
          const willUnlock = stats ? a.check(stats) : false;
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 transition-all ${
                isUnlocked
                  ? "border-amber-200/60 dark:border-amber-900/60 bg-card"
                  : "border-border/40 bg-card/50 opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 size-14 rounded-xl flex items-center justify-center text-3xl ${
                    isUnlocked
                      ? `bg-gradient-to-br ${tierColor(a.tier)} shadow-md`
                      : "bg-border/40 grayscale"
                  }`}
                >
                  {isUnlocked ? a.icon : <Lock className="size-5 text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isUnlocked
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-muted"
                      }`}
                    >
                      {tierLabel(a.tier)}
                    </span>
                    {isUnlocked && (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    )}
                  </div>
                  <div
                    className={`text-sm font-black mb-0.5 ${
                      isUnlocked ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {a.name}
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    {a.description}
                  </div>
                  {!isUnlocked && willUnlock && (
                    <div className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      جاهزة للفتح — افتح صفحة وستُفعّل
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="mt-2 text-[10px] text-muted">
                      {new Date(unlockedMap.get(a.id)!).toLocaleDateString(
                        "ar",
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
