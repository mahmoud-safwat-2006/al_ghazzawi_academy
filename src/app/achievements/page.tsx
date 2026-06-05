import type { Metadata } from "next";
import { AchievementsGallery } from "@/components/achievements-gallery";

export const metadata: Metadata = {
  title: "الشارات | أكاديمية الغزاوي",
  description: "إنجازاتك في رحلة التعلم - أكاديمية الغزاوي",
};

export default function AchievementsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
          إنجازاتك
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          الشارات
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          كل شارة تمثل إنجازاً حقيقياً في رحلتك. كلما تعلّمت أكثر، فُتحت
          شارات أكثر.
        </p>
      </div>

      <AchievementsGallery />
    </main>
  );
}
