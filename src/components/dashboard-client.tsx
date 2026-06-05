"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import {
  Award,
  BookOpen,
  Brain,
  Clock,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import {
  useAllStudySessions,
  useAllQuizAttempts,
  useAllFlashcardStates,
  useAllReadingProgress,
  useStreak,
} from "@/lib/use-db";
import {
  activityByDay,
  activityByType,
  dashboardSummary,
  flashcardDistribution,
  heatmap,
  quizAccuracyTrend,
} from "@/lib/stats";
import { totalChapters, totalFlashcards } from "@/lib/books";

// Recharts touches window/ResizeObserver at module init — skip SSR.
const ActivityBarChart = dynamic(
  () => import("./charts/activity-bar-chart").then((m) => m.ActivityBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const QuizAccuracyChart = dynamic(
  () => import("./charts/quiz-accuracy-chart").then((m) => m.QuizAccuracyChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const FlashcardPie = dynamic(
  () => import("./charts/flashcard-pie").then((m) => m.FlashcardPie),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const ActivityTypePie = dynamic(
  () => import("./charts/activity-type-pie").then((m) => m.ActivityTypePie),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div className="h-64 rounded-xl bg-border/30 animate-pulse flex items-center justify-center text-xs text-muted">
      جاري التحميل…
    </div>
  );
}

export function DashboardClient() {
  const sessions = useAllStudySessions();
  const attempts = useAllQuizAttempts();
  const flashcards = useAllFlashcardStates();
  const progress = useAllReadingProgress();
  const streak = useStreak();

  const loading =
    !sessions || !attempts || !flashcards || !progress || !streak;

  const summary = useMemo(() => {
    if (loading) return null;
    return dashboardSummary(sessions, attempts, flashcards, progress);
  }, [loading, sessions, attempts, flashcards, progress]);

  const activity30 = useMemo(
    () => (loading ? [] : activityByDay(sessions, 30)),
    [loading, sessions],
  );
  const quizTrend = useMemo(
    () => (loading ? [] : quizAccuracyTrend(attempts, 20)),
    [loading, attempts],
  );
  const flashDist = useMemo(
    () => (loading ? [] : flashcardDistribution(flashcards)),
    [loading, flashcards],
  );
  const typeBreakdown = useMemo(
    () => (loading ? [] : activityByType(sessions)),
    [loading, sessions],
  );
  const heat = useMemo(
    () => (loading ? [] : heatmap(sessions, 16)),
    [loading, sessions],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <div className="inline-block size-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted">جاري تحميل بياناتك…</p>
      </div>
    );
  }

  // First-time empty state
  const hasNoData =
    summary!.totalSessions === 0 &&
    summary!.quizCount === 0 &&
    summary!.flashcardsTouched === 0;

  if (hasNoData) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
          <TrendingUp className="size-7" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">
          لم تبدأ بعد
        </h2>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto leading-relaxed">
          ابدأ بفصل واحد — اقرأ الملخص، حلّ الكويز، راجع البطاقات. ستظهر هنا
          إحصاءاتك مباشرة.
        </p>
        <Link
          href="/books/hr"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          ابدأ من كتاب HR
        </Link>
      </div>
    );
  }

  const totalCh = totalChapters();
  const totalFc = totalFlashcards();

  return (
    <div className="space-y-6">
      {/* Top stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Flame className="size-5" />}
          label="السلسلة الحالية"
          value={`${streak!.current} يوم`}
          sub={`أطول: ${streak!.longest}`}
          color="orange"
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="وقت الدراسة"
          value={formatMinutes(summary!.totalMinutes)}
          sub={`${summary!.uniqueDays} يوم نشط`}
          color="cyan"
        />
        <StatCard
          icon={<Target className="size-5" />}
          label="متوسط الكويز"
          value={`${summary!.quizAvg}%`}
          sub={`${summary!.quizCount} محاولة`}
          color="emerald"
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="فصول مكتملة"
          value={`${summary!.chaptersCompleted} / ${totalCh}`}
          sub={`بدأت ${summary!.chaptersStarted}`}
          color="royal"
        />
      </div>

      {/* Activity heatmap */}
      <ChartCard
        title="نشاطك الأخير"
        subtitle={`${summary!.totalSessions} نشاط على ${summary!.uniqueDays} يوم`}
        icon={<Flame className="size-4" />}
      >
        <Heatmap cells={heat} />
      </ChartCard>

      {/* Activity by day - bar chart */}
      <ChartCard
        title="آخر 30 يوماً"
        subtitle="عدد الأنشطة لكل يوم"
        icon={<TrendingUp className="size-4" />}
      >
        <ActivityBarChart data={activity30} />
      </ChartCard>

      {/* Two-column charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {quizTrend.length > 0 && (
          <ChartCard
            title="دقة الكويز"
            subtitle={`آخر ${quizTrend.length} محاولة`}
            icon={<Target className="size-4" />}
          >
            <QuizAccuracyChart data={quizTrend} />
          </ChartCard>
        )}

        {flashDist.length > 0 && (
          <ChartCard
            title="حالة البطاقات"
            subtitle={`${summary!.flashcardsTouched} / ${totalFc} بطاقة`}
            icon={<Brain className="size-4" />}
          >
            <FlashcardPie data={flashDist} />
          </ChartCard>
        )}
      </div>

      {typeBreakdown.length > 0 && (
        <ChartCard
          title="توزيع الأنشطة"
          subtitle="ما الذي قضيت معظم وقتك معه؟"
          icon={<BookOpen className="size-4" />}
        >
          <ActivityTypePie data={typeBreakdown} />
        </ChartCard>
      )}

      {/* Footer links */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2">
        <Link
          href="/review"
          className="rounded-xl border border-border/60 bg-card p-4 hover:border-amber-300 transition-colors group"
        >
          <Brain className="size-5 text-amber-600 mb-2" />
          <div className="text-sm font-bold text-foreground">المراجعة الذكية</div>
          <div className="text-xs text-muted">SM-2 spaced repetition</div>
        </Link>
        <Link
          href="/achievements"
          className="rounded-xl border border-border/60 bg-card p-4 hover:border-amber-300 transition-colors"
        >
          <Award className="size-5 text-amber-600 mb-2" />
          <div className="text-sm font-bold text-foreground">الشارات</div>
          <div className="text-xs text-muted">إنجازاتك المفتوحة</div>
        </Link>
        <Link
          href="/study-plan"
          className="rounded-xl border border-border/60 bg-card p-4 hover:border-amber-300 transition-colors"
        >
          <Target className="size-5 text-amber-600 mb-2" />
          <div className="text-sm font-bold text-foreground">خطة الدراسة</div>
          <div className="text-xs text-muted">30 / 60 / 90 يوم</div>
        </Link>
      </div>
    </div>
  );
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} س`;
  return `${h}س ${rem}د`;
}

type StatColor = "orange" | "cyan" | "emerald" | "royal";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: StatColor;
}) {
  const styles: Record<StatColor, string> = {
    orange:
      "from-orange-500/10 to-amber-500/10 border-orange-200/60 text-orange-600 dark:border-orange-900/60 dark:text-orange-400",
    cyan: "from-cyan-500/10 to-sky-500/10 border-cyan-200/60 text-cyan-600 dark:border-cyan-900/60 dark:text-cyan-400",
    emerald:
      "from-emerald-500/10 to-green-500/10 border-emerald-200/60 text-emerald-600 dark:border-emerald-900/60 dark:text-emerald-400",
    royal:
      "from-royal-500/10 to-navy-500/10 border-royal-200/60 text-royal-700 dark:border-royal-900/60 dark:text-royal-400",
  };
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br ${styles[color]} p-4 bg-card`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
          {label}
        </span>
      </div>
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <span className="text-cyan-600 dark:text-cyan-400">{icon}</span>
        )}
        <h3 className="text-base font-bold text-foreground">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-muted mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

function Heatmap({ cells }: { cells: ReturnType<typeof heatmap> }) {
  const levels = {
    0: "bg-border/40",
    1: "bg-cyan-200 dark:bg-cyan-950",
    2: "bg-cyan-400 dark:bg-cyan-800",
    3: "bg-cyan-500 dark:bg-cyan-600",
    4: "bg-cyan-600 dark:bg-cyan-400",
  } as const;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1 min-w-full" dir="ltr">
        {cells.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.dayKey}
                className={`size-3 rounded-sm ${levels[cell.level]}`}
                title={`${cell.dayKey} — ${cell.count} نشاط`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted">
        <span>أقل</span>
        <div className="size-2.5 rounded-sm bg-border/40" />
        <div className="size-2.5 rounded-sm bg-cyan-200 dark:bg-cyan-950" />
        <div className="size-2.5 rounded-sm bg-cyan-400 dark:bg-cyan-800" />
        <div className="size-2.5 rounded-sm bg-cyan-500 dark:bg-cyan-600" />
        <div className="size-2.5 rounded-sm bg-cyan-600 dark:bg-cyan-400" />
        <span>أكثر</span>
      </div>
    </div>
  );
}
