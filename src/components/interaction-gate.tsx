"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { useAccess, canInteract, trialChapterFor } from "@/lib/access";
import { UnlockForm } from "./unlock-form";

/**
 * Wraps interactive chapter content (quiz / flashcards / notes). Shows the
 * children only when the student may interact with this chapter; otherwise
 * renders a lock screen with the unlock form. Reading pages never use this.
 */
export function InteractionGate({
  bookSlug,
  chapterNum,
  children,
}: {
  bookSlug: string;
  chapterNum: number;
  children: ReactNode;
}) {
  const { loading, registered, studentName, tier } = useAccess();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted">
        جارٍ التحميل…
      </div>
    );
  }

  if (canInteract(bookSlug, chapterNum, tier)) {
    return <>{children}</>;
  }

  const trial = trialChapterFor(bookSlug);

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-card p-6 sm:p-8 shadow-soft">
      <div className="flex flex-col items-center text-center">
        <div className="size-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-soft">
          <Lock className="size-7" />
        </div>
        <h2 className="mt-4 text-xl font-black text-foreground">
          هذا الفصل مقفل للتفاعل
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
          يمكنك <strong className="text-foreground">قراءة</strong> كل الفصول
          بحرية. أما <strong className="text-foreground">التفاعل</strong> (الكويز
          والبطاقات والملاحظات وتتبّع التقدّم) فمتاح مجاناً في الفصل {trial} فقط.
          لفتح بقية الفصول، فعّل حسابك بكود التفعيل.
        </p>
      </div>

      <div className="mt-6 mx-auto max-w-sm">
        <UnlockForm needName={!registered} defaultName={studentName} />
        <p className="mt-3 text-center text-xs text-muted">
          لا تملك كوداً؟ تواصل مع إدارة المنصة للحصول عليه.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <Link
          href={`/books/${bookSlug}/${trial}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-bold hover:border-foreground/40 transition-colors"
        >
          <BookOpen className="size-4" />
          جرّب الفصل المجاني (الفصل {trial})
        </Link>
      </div>
    </div>
  );
}
