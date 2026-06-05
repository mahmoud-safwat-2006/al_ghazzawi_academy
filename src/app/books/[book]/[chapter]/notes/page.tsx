import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, StickyNote } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getBook, bookSlugs, getChapterFromBook } from "@/lib/books";
import { NotesEditor } from "@/components/notes-editor";
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
}: PageProps<"/books/[book]/[chapter]/notes">) {
  const { book, chapter } = await params;
  const ch = getChapterFromBook(book, Number(chapter));
  if (!ch) return { title: "ملاحظات غير موجودة" };
  return {
    title: `ملاحظات: ${ch.title_ar}`,
    description: `ملاحظاتك الشخصية للفصل ${ch.num}`,
  };
}

export default async function ChapterNotesPage({
  params,
}: PageProps<"/books/[book]/[chapter]/notes">) {
  const { book, chapter } = await params;
  const b = getBook(book);
  const ch = getChapterFromBook(book, Number(chapter));
  if (!b || !ch) notFound();

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
          <span className="text-foreground font-medium">الملاحظات</span>
        </nav>

        <div className="mb-6 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-card shrink-0">
            <StickyNote className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-violet-700 uppercase tracking-wider">
              الفصل {ch.num} · ملاحظات
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-black text-foreground leading-tight">
              {ch.title_ar}
            </h1>
          </div>
        </div>

        <InteractionGate bookSlug={book} chapterNum={ch.num}>
          <NotesEditor
            bookSlug={book}
            chapterNum={ch.num}
            chapterTitle={ch.title_ar}
          />
        </InteractionGate>
      </main>
      <Footer />
    </>
  );
}
