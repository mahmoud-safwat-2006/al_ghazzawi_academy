import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, Layers, Network, Sparkles, StickyNote } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ChapterProgress } from "@/components/chapter-progress";
import { ChapterAccessNotice } from "@/components/chapter-access-notice";
import { ActivityLockBadge } from "@/components/activity-lock-badge";
import { getBook, bookSlugs, getChapterFromBook } from "@/lib/books";

export function generateStaticParams() {
  return bookSlugs().flatMap((book) =>
    (getBook(book)?.chapters ?? []).map((c) => ({
      book,
      chapter: String(c.num),
    })),
  );
}

export async function generateMetadata({ params }: PageProps<"/books/[book]/[chapter]">) {
  const { book, chapter } = await params;
  const ch = getChapterFromBook(book, Number(chapter));
  if (!ch) return { title: "فصل غير موجود" };
  return {
    title: `الفصل ${ch.num}: ${ch.title_ar}`,
    description: `${ch.title_ar} - ${ch.flashcards.length} بطاقة، ${ch.quiz.length} سؤال`,
  };
}

export default async function ChapterPage({ params }: PageProps<"/books/[book]/[chapter]">) {
  const { book, chapter } = await params;
  const b = getBook(book);
  const ch = getChapterFromBook(book, Number(chapter));
  if (!b || !ch) notFound();

  const prev = ch.num > 1 ? ch.num - 1 : null;
  const next = ch.num < b.chapters.length ? ch.num + 1 : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <nav className="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            الرئيسية
          </Link>
          <ArrowLeft className="size-3" />
          <Link href="/books" className="hover:text-foreground transition-colors">
            الكتب
          </Link>
          <ArrowLeft className="size-3" />
          <Link href={`/books/${book}`} className="hover:text-foreground transition-colors">
            {b.title_ar}
          </Link>
          <ArrowLeft className="size-3" />
          <span className="text-foreground font-medium">الفصل {ch.num}</span>
        </nav>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-royal-700 via-royal-600 to-cyan-600 p-8 sm:p-10 text-white shadow-card">
          <div className="absolute top-0 end-0 size-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3" />
              الفصل {ch.num} من {b.chapters.length}
            </div>
            <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight leading-[1.15]">
              {ch.title_ar}
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white/80" dir="ltr">
              {ch.title_en}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/75 font-medium">
              <span>صفحات {ch.start_page}–{ch.end_page}</span>
              <span className="size-1 rounded-full bg-white/40" />
              <span>{ch.page_count} صفحة</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-soft">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">تقدم هذا الفصل</span>
              <span className="text-[10px] text-muted">ملخص · كويز · فلاش كاردز</span>
            </div>
            <ChapterProgress bookSlug={book} chapterNum={ch.num} />
          </div>
        </div>

        <ChapterAccessNotice bookSlug={book} chapterNum={ch.num} />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href={`/books/${book}/${ch.num}/summary`}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-card hover:border-royal-300/60 transition-all"
          >
            <div className="size-11 rounded-xl bg-gradient-to-br from-royal-600 to-royal-700 text-white flex items-center justify-center shadow-soft">
              <FileText className="size-5" />
            </div>
            <h2 className="mt-4 font-bold text-foreground">الملخص</h2>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              ملخص شامل للفصل مع المفاهيم الأساسية
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal-700">
              ابدأ القراءة
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/books/${book}/${ch.num}/quiz`}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-card hover:border-cyan-300/60 transition-all"
          >
            <ActivityLockBadge bookSlug={book} chapterNum={ch.num} />
            <div className="size-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center shadow-soft">
              <Layers className="size-5" />
            </div>
            <h2 className="mt-4 font-bold text-foreground">الكويز</h2>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              {ch.quiz.length} سؤال اختيار من متعدد مع الشرح
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
              ابدأ الاختبار
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/books/${book}/${ch.num}/flashcards`}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-card hover:border-amber-300/60 transition-all"
          >
            <ActivityLockBadge bookSlug={book} chapterNum={ch.num} />
            <div className="size-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-soft">
              <BookOpen className="size-5" />
            </div>
            <h2 className="mt-4 font-bold text-foreground">الفلاش كاردز</h2>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              {ch.flashcards.length} بطاقة لحفظ المصطلحات الأساسية
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
              ابدأ المراجعة
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/books/${book}/${ch.num}/notes`}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-violet-300/60 transition-colors"
          >
            <div className="size-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <StickyNote className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground">الملاحظات</div>
              <div className="text-[11px] text-muted">دوّن ملاحظاتك الشخصية</div>
            </div>
            <ArrowLeft className="size-4 text-muted group-hover:-translate-x-1 group-hover:text-foreground transition-all" />
          </Link>

          <Link
            href={`/books/${book}/${ch.num}/mindmap`}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-emerald-300/60 transition-colors"
          >
            <div className="size-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Network className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground">خريطة ذهنية</div>
              <div className="text-[11px] text-muted">عرض هيكلي لمحتوى الفصل</div>
            </div>
            <ArrowLeft className="size-4 text-muted group-hover:-translate-x-1 group-hover:text-foreground transition-all" />
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {prev ? (
            <Link
              href={`/books/${book}/${prev}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-cyan-600 transition-colors"
            >
              <ArrowLeft className="size-4 rotate-180" />
              الفصل السابق
            </Link>
          ) : (
            <Link
              href={`/books/${book}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4 rotate-180" />
              فهرس الفصول
            </Link>
          )}
          {next && (
            <Link
              href={`/books/${book}/${next}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-cyan-600 transition-colors"
            >
              الفصل التالي
              <ArrowLeft className="size-4" />
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
