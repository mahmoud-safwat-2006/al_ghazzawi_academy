import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, FileText, Layers } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SummaryViewer } from "@/components/summary-viewer";
import { getBook, bookSlugs, getChapterFromBook } from "@/lib/books";

export function generateStaticParams() {
  return bookSlugs().flatMap((book) =>
    (getBook(book)?.chapters ?? []).map((c) => ({
      book,
      chapter: String(c.num),
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/books/[book]/[chapter]/summary">) {
  const { book, chapter } = await params;
  const ch = getChapterFromBook(book, Number(chapter));
  if (!ch) return { title: "ملخص غير موجود" };
  return {
    title: `ملخص: ${ch.title_ar}`,
    description: `الملخص الكامل للفصل ${ch.num} - ${ch.title_ar}`,
  };
}

export default async function SummaryPage({
  params,
}: PageProps<"/books/[book]/[chapter]/summary">) {
  const { book, chapter } = await params;
  const b = getBook(book);
  const ch = getChapterFromBook(book, Number(chapter));
  if (!b || !ch) notFound();

  const prev = ch.num > 1 ? ch.num - 1 : null;
  const next = ch.num < b.chapters.length ? ch.num + 1 : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <nav className="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap">
          <Link href={`/books/${book}`} className="hover:text-foreground transition-colors">
            {b.title_ar}
          </Link>
          <ArrowLeft className="size-3" />
          <Link
            href={`/books/${book}/${ch.num}`}
            className="hover:text-foreground transition-colors"
          >
            الفصل {ch.num}
          </Link>
          <ArrowLeft className="size-3" />
          <span className="text-foreground font-medium">الملخص</span>
        </nav>

        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
          <div className="flex items-start gap-3 mb-6 pb-6 border-b border-border/60">
            <div className="size-10 rounded-xl bg-gradient-to-br from-royal-600 to-royal-700 text-white flex items-center justify-center shadow-soft shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-royal-700 uppercase tracking-wider">
                الفصل {ch.num} · ملخص
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground leading-tight">
                {ch.title_ar}
              </h1>
              <p className="mt-1 text-sm text-muted font-medium" dir="ltr">
                {ch.title_en}
              </p>
            </div>
          </div>

          <SummaryViewer summary={ch.summary} chapterNum={ch.num} bookSlug={book} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/books/${book}/${ch.num}/quiz`}
            className="group rounded-2xl border border-border/60 bg-card p-4 shadow-soft hover:shadow-card hover:border-cyan-300/60 transition-all flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center">
              <Layers className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-foreground">اختبر فهمك</div>
              <div className="text-xs text-muted">{ch.quiz.length} سؤال</div>
            </div>
            <ArrowLeft className="size-4 text-muted group-hover:-translate-x-1 transition-transform" />
          </Link>
          <Link
            href={`/books/${book}/${ch.num}/flashcards`}
            className="group rounded-2xl border border-border/60 bg-card p-4 shadow-soft hover:shadow-card hover:border-amber-300/60 transition-all flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-foreground">احفظ المصطلحات</div>
              <div className="text-xs text-muted">{ch.flashcards.length} بطاقة</div>
            </div>
            <ArrowLeft className="size-4 text-muted group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {prev ? (
            <Link
              href={`/books/${book}/${prev}/summary`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-royal-700 transition-colors"
            >
              <ArrowRight className="size-4" />
              الفصل السابق
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/books/${book}/${next}/summary`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-royal-700 transition-colors"
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
