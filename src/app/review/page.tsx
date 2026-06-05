import type { Metadata } from "next";
import { ReviewRunner } from "@/components/review-runner";

export const metadata: Metadata = {
  title: "المراجعة الذكية | أكاديمية الغزاوي",
  description:
    "راجع البطاقات المستحقة عبر خوارزمية SM-2 - أكاديمية الغزاوي",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
          المراجعة الذكية
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          البطاقات المستحقة
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          النظام يستخدم خوارزمية{" "}
          <span className="font-bold text-foreground">SM-2</span> ليعيد لك
          البطاقات في اللحظة المثلى قبل أن تنساها.
        </p>
      </div>

      <ReviewRunner />
    </main>
  );
}
