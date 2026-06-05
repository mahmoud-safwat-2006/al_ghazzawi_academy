import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getBook, bookSlugs, getChapterFromBook } from "@/lib/books";
import { FlashcardsDeck } from "@/components/flashcards-deck";
import { InteractionGate } from "@/components/interaction-gate";

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
}: PageProps<"/books/[book]/[chapter]/flashcards">) {
  const { book, chapter } = await params;
  const ch = getChapterFromBook(book, Number(chapter));
  if (!ch) return { title: "بطاقات غير موجودة" };
  return {
    title: `فلاش كاردز: ${ch.title_ar}`,
    description: `${ch.flashcards.length} بطاقة للمصطلحات الأساسية في الفصل ${ch.num}`,
  };
}

export default async function FlashcardsPage({
  params,
}: PageProps<"/books/[book]/[chapter]/flashcards">) {
  const { book, chapter } = await params;
  const b = getBook(book);
  const ch = getChapterFromBook(book, Number(chapter));
  if (!b || !ch) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
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
          <span className="text-foreground font-medium">فلاش كاردز</span>
        </nav>

        <div className="mb-6 flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-soft shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              الفصل {ch.num} · فلاش كاردز
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-black text-foreground leading-tight">
              {ch.title_ar}
            </h1>
          </div>
        </div>

        <InteractionGate bookSlug={book} chapterNum={ch.num}>
          <FlashcardsDeck
            cards={ch.flashcards}
            chapterNum={ch.num}
            hasNext={ch.num < b.chapters.length}
            bookSlug={book}
          />
        </InteractionGate>
      </main>
      <Footer />
    </>
  );
}
