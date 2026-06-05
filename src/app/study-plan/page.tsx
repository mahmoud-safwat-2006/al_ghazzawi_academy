import type { Metadata } from "next";
import { StudyPlanClient } from "@/components/study-plan-client";

export const metadata: Metadata = {
  title: "خطة الدراسة | أكاديمية الغزاوي",
  description: "اختر خطتك 30 / 60 / 90 يوم وابدأ - أكاديمية الغزاوي",
};

export default function StudyPlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-royal-50 dark:bg-royal-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400 mb-3">
          خطة الدراسة
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          الخطة الذكية
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          اختر مدة مناسبة لك، وسنوزّع الفصول والأنشطة على أيامك تلقائياً.
        </p>
      </div>

      <StudyPlanClient />
    </main>
  );
}
