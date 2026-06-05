"use client";

import { useEffect, useState } from "react";
import { Construction, Zap, Layers, BookOpen, Printer } from "lucide-react";
import { SpeechController } from "./speech-controller";
import type { SummaryLevel } from "@/content/hr/types";
import { logStudySession, upsertChapterProgress } from "@/lib/db";
import { setPreference, usePreferences } from "@/lib/use-db";

interface SummaryViewerProps {
  summary: {
    concise?: string;
    standard?: string;
    detailed: string;
  };
  /** chapter number — used to mark progress */
  chapterNum?: number;
  /** book slug — defaults to "hr" */
  bookSlug?: string;
}

const LEVELS: Array<{
  key: SummaryLevel;
  label: string;
  sub: string;
  icon: typeof Zap;
}> = [
  { key: "concise", label: "مكثف", sub: "نظرة سريعة", icon: Zap },
  { key: "standard", label: "عادي", sub: "مستوى متوسط", icon: Layers },
  { key: "detailed", label: "مفصّل", sub: "شرح كامل", icon: BookOpen },
];

export function SummaryViewer({
  summary,
  chapterNum,
  bookSlug = "hr",
}: SummaryViewerProps) {
  const prefs = usePreferences();
  const [level, setLevel] = useState<SummaryLevel>("detailed");

  // Restore preferred level once.
  useEffect(() => {
    if (prefs?.summaryLevel && summary[prefs.summaryLevel]) {
      setLevel(prefs.summaryLevel);
    }
  }, [prefs?.summaryLevel, summary]);

  // Mark summary as read + log study session (once per mount per chapter).
  useEffect(() => {
    if (chapterNum == null) return;
    void upsertChapterProgress(bookSlug, chapterNum, { summaryRead: true });
    void logStudySession("summary", bookSlug, chapterNum);
  }, [bookSlug, chapterNum]);

  function changeLevel(next: SummaryLevel) {
    setLevel(next);
    void setPreference("summaryLevel", next);
  }

  const content = summary[level];
  const isAvailable = !!content;

  return (
    <>
      {/* Action toolbar — hidden in print */}
      <div className="flex items-center justify-end gap-2 mb-3 print:hidden">
        <SpeechController html={content ?? ""} />
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold hover:border-foreground/40 transition-colors"
          aria-label="طباعة"
        >
          <Printer className="size-3.5" />
          طباعة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-navy-50/60 p-1.5 mb-6 print:hidden">
        {LEVELS.map(({ key, label, sub, icon: Icon }) => {
          const isActive = level === key;
          const hasContent = !!summary[key];
          return (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              className={`relative rounded-xl px-3 py-2.5 text-center transition-all ${
                isActive
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                <Icon className="size-3.5" />
                {label}
              </div>
              <div className="mt-0.5 text-[10px] font-medium opacity-70">
                {sub}
              </div>
              {!hasContent && (
                <span
                  className="absolute top-1.5 end-1.5 size-1.5 rounded-full bg-amber-400"
                  title="قيد التطوير"
                />
              )}
            </button>
          );
        })}
      </div>

      {isAvailable ? (
        <article
          className="summary-prose"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 text-center">
          <div className="inline-flex size-12 rounded-xl bg-amber-100 items-center justify-center mb-3">
            <Construction className="size-6 text-amber-700" />
          </div>
          <h3 className="font-bold text-amber-900">
            مستوى "{LEVELS.find((l) => l.key === level)?.label}" قيد التطوير
          </h3>
          <p className="mt-1.5 text-sm text-amber-800/90 leading-relaxed max-w-sm mx-auto">
            هذا المستوى من الملخص سيكون متاحاً قريباً. يمكنك حالياً قراءة الملخص
            المفصّل.
          </p>
          <button
            onClick={() => changeLevel("detailed")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-bold hover:bg-amber-700 transition-colors"
          >
            <BookOpen className="size-4" />
            افتح الملخص المفصّل
          </button>
        </div>
      )}
    </>
  );
}
