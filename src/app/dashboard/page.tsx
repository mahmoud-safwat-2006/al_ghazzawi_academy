import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "لوحة التقدم | أكاديمية الغزاوي",
  description: "كل بياناتك التعليمية في مكان واحد - أكاديمية الغزاوي",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-3">
          لوحة التقدم
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          رحلتك التعليمية
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          كل ما تعلمته، راجعته، وأنجزته — في مكان واحد.
        </p>
      </div>

      <DashboardClient />
    </main>
  );
}
