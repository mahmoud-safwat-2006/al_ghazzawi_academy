"use client";

import { Lock, Sparkles } from "lucide-react";
import { useAccess, isTrialChapter, trialChapterFor } from "@/lib/access";

/**
 * Inline banner on the chapter page that tells a trial student whether this
 * chapter is their free interactive chapter or read-only. Hidden for full
 * accounts and while loading.
 */
export function ChapterAccessNotice({
  bookSlug,
  chapterNum,
}: {
  bookSlug: string;
  chapterNum: number;
}) {
  const { loading, tier } = useAccess();
  if (loading || tier === "full") return null;

  if (isTrialChapter(bookSlug, chapterNum)) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm">
        <Sparkles className="size-4 text-emerald-600 shrink-0" />
        <span className="text-emerald-800 font-medium">
          هذا فصلك التجريبي المجاني — تفاعل بحرية مع الكويز والبطاقات والملاحظات!
        </span>
      </div>
    );
  }

  const trial = trialChapterFor(bookSlug);
  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm">
      <Lock className="size-4 text-amber-600 shrink-0" />
      <span className="text-amber-800 font-medium">
        القراءة متاحة مجاناً. التفاعل (كويز/بطاقات/ملاحظات) يتطلب تفعيل الحساب —
        الفصل المجاني هو الفصل {trial}.
      </span>
    </div>
  );
}
