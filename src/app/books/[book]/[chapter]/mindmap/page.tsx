import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Network } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MindMapView } from "@/components/mindmap-view";
import { buildMindMap } from "@/lib/mindmap";
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
}: PageProps<"/books/[book]/[chapter]/mindmap">) {
  const { book, chapter } = await params;
  const ch = getChapterFromBook(book, Number(chapter));
  if (!ch) return { title: "خريطة ذهنية غير موجودة" };
  return {
    title: `خريطة ذهنية: ${ch.title_ar}`,
    description: `عرض هيكلي تفاعلي لمحتوى الفصل ${ch.num}`,
  };
}

export default async function ChapterMindMapPage({
  params,
}: PageProps<"/books/[book]/[chapter]/mindmap">) {
  const { book, chapter } = await params;
  const b = getBook(book);
  const ch = getChapterFromBook(book, Number(chapter));
  if (!b || !ch) notFound();

  const root = buildMindMap(ch.title_ar, ch.summary.detailed);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
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
          <span className="text-foreground font-medium">الخريطة الذهنية</span>
        </nav>

        <div className="mb-8 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-card shrink-0">
            <Network className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              الفصل {ch.num} · خريطة ذهنية
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-black text-foreground leading-tight">
              {ch.title_ar}
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              نظرة هيكلية على الفصل — اضغط على أي فرع لطيّه أو فتحه.
            </p>
          </div>
        </div>

        <MindMapView root={root} />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link
            href={`/books/${book}/${ch.num}/summary`}
            className="rounded-xl border border-border/60 bg-card p-4 hover:border-royal-300/60 transition-colors text-center"
          >
            <div className="text-xs text-muted">للتعمّق</div>
            <div className="text-sm font-bold text-foreground mt-1">اقرأ الملخص</div>
          </Link>
          <Link
            href={`/books/${book}/${ch.num}/flashcards`}
            className="rounded-xl border border-border/60 bg-card p-4 hover:border-amber-300/60 transition-colors text-center"
          >
            <div className="text-xs text-muted">لحفظ المصطلحات</div>
            <div className="text-sm font-bold text-foreground mt-1">البطاقات</div>
          </Link>
          <Link
            href={`/books/${book}/${ch.num}/quiz`}
            className="rounded-xl border border-border/60 bg-card p-4 hover:border-cyan-300/60 transition-colors text-center"
          >
            <div className="text-xs text-muted">للتقييم</div>
            <div className="text-sm font-bold text-foreground mt-1">الكويز</div>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
