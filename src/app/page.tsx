import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  FileText,
  LayoutGrid,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { TodayBanner } from "@/components/today-banner";
import { BOOKS, SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <TodayBanner />
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-60" />
          <div className="absolute inset-0 gradient-radial-hero" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
            {/* Eyebrow badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted shadow-soft">
                <Sparkles className="size-3.5 text-cyan-brand" />
                <span>منصة MBA عربية احترافية · إصدار تجريبي</span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="mx-auto max-w-4xl text-center text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
              ادرس{" "}
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-br from-royal-600 via-royal-500 to-cyan-brand bg-clip-text text-transparent">
                  MBA
                </span>
              </span>
              {" "}بطريقة
              <br />
              تُناسب عقلك العربي.
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg sm:text-xl text-muted leading-relaxed">
              خمسة كتب أصلية، ثلاثة مستويات من الملخصات، آلاف الأسئلة،
              وفلاش كاردز ذكية — كلها في منصة واحدة تعمل حتى بدون إنترنت.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/books"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background h-12 px-7 text-sm font-semibold shadow-card hover:shadow-glow transition-all duration-300"
              >
                <span>ابدأ التعلم الآن</span>
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card h-12 px-7 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors"
              >
                <span>اكتشف الميزات</span>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: "كتاب MBA", value: "5" },
                { label: "فصل دراسي", value: "+60" },
                { label: "سؤال تدريبي", value: "+1500" },
                { label: "فلاش كارد", value: "+1500" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-muted font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border/60 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 mb-3">
                <Zap className="size-3.5" />
                لماذا أكاديمية الغزاوي؟
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                كل ما تحتاجه لإتقان MBA،
                <br />
                <span className="text-muted">في مكان واحد.</span>
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "كتب أصلية كاملة",
                  desc: "اقرأ الكتب الخمسة الكاملة بصيغة PDF داخل المنصة، بدون تحميل أو خروج.",
                },
                {
                  icon: FileText,
                  title: "ملخصات بـ 3 مستويات",
                  desc: "مكثف للمراجعة السريعة، عادي للفهم، ومفصّل للإتقان العميق.",
                },
                {
                  icon: Target,
                  title: "أسئلة متدرّجة",
                  desc: "أكثر من 30 سؤالاً لكل فصل، مقسّمة على ثلاث مستويات صعوبة.",
                },
                {
                  icon: Brain,
                  title: "فلاش كاردز ذكية",
                  desc: "مصطلحات عربية وإنجليزية مع التعريفات، بنظام تكرار متباعد.",
                },
                {
                  icon: LayoutGrid,
                  title: "تتبع تقدمك",
                  desc: "لوحة معلومات تعرض ما أنجزته وما تبقى، بإحصائيات تفصيلية.",
                },
                {
                  icon: Zap,
                  title: "تعمل بدون إنترنت",
                  desc: "PWA كاملة — ثبّت المنصة كتطبيق، وادرس في أي وقت ومكان.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-card hover:border-cyan-300/50 transition-all duration-300"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-royal-50 to-cyan-50 ring-1 ring-cyan-100 group-hover:scale-110 transition-transform">
                    <Icon className="size-5 text-royal-700" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOOKS */}
        <section className="border-t border-border/60 py-20 sm:py-28 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 mb-3">
                  <BookOpen className="size-3.5" />
                  المكتبة
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                  خمسة كتب،<br />
                  <span className="text-muted">منهج متكامل.</span>
                </h2>
              </div>
              <Link
                href="/books"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-cyan-600 transition-colors"
              >
                <span>عرض الكل</span>
                <ArrowLeft className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BOOKS.map((book, idx) => (
                <Link
                  key={book.slug}
                  href={book.status === "ready" ? `/books/${book.slug}` : "/books"}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft hover:shadow-card transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`size-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center text-white font-black text-lg shadow-soft`}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      {book.status === "ready" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          متاح الآن
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-amber-200">
                          قريباً
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground leading-tight">
                      {book.title_ar}
                    </h3>
                    <p className="mt-1 text-sm text-muted font-medium" dir="ltr">
                      {book.title_en}
                    </p>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted">
                        {book.chapters > 0 ? `${book.chapters} فصلاً` : "محتوى قيد الإعداد"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-foreground font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                        ادخل
                        <ArrowLeft className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              جاهز لتبدأ رحلتك في MBA؟
            </h2>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              المنصة مجانية بالكامل في هذه المرحلة. ابدأ بكتاب الموارد البشرية المتاح الآن.
            </p>
            <div className="mt-10">
              <Link
                href="/books/hr"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background h-12 px-7 text-sm font-semibold shadow-card hover:shadow-glow transition-all duration-300"
              >
                <span>ابدأ بإدارة الموارد البشرية</span>
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
