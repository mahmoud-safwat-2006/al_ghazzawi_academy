import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getBook, bookSlugs } from "@/lib/books";
import { ReaderWrapper } from "./reader-wrapper";

export function generateStaticParams() {
  return bookSlugs().map((book) => ({ book }));
}

export async function generateMetadata({
  params,
}: PageProps<"/books/[book]/read">): Promise<Metadata> {
  const { book } = await params;
  const b = getBook(book);
  if (!b) return { title: "كتاب غير موجود" };
  return {
    title: `قراءة كتاب ${b.title_ar} الأصلي`,
    description: `تصفح كتاب ${b.title_en} الكامل بـ PDF`,
  };
}

export default async function BookReadPage({
  params,
}: PageProps<"/books/[book]/read">) {
  const { book } = await params;
  const b = getBook(book);
  if (!b) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted mb-4 flex-wrap">
          <Link href="/books" className="hover:text-foreground transition-colors">
            الكتب
          </Link>
          <span>/</span>
          <Link
            href={`/books/${book}`}
            className="hover:text-foreground transition-colors"
          >
            {b.title_ar}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">القراءة الكاملة</span>
        </nav>

        <header className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-royal-600 to-cyan-500 text-white shadow-card">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {b.title_ar}
              </h1>
              <p className="text-xs sm:text-sm text-muted font-medium" dir="ltr">
                {b.title_en}
              </p>
            </div>
            <Link
              href={`/books/${book}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm font-semibold hover:border-foreground/40 transition-colors"
            >
              <ArrowRight className="size-4" />
              <span className="hidden sm:inline">رجوع للفصول</span>
            </Link>
          </div>
        </header>

        <ReaderWrapper
          file={`/books/${book}.pdf`}
          bookSlug={book}
          title={b.title_ar}
        />

        <div className="mt-4 text-center text-xs text-muted">
          نصيحة: استخدم أسهم لوحة المفاتيح للتنقل بين الصفحات • يُحفظ آخر موضع
          قراءتك تلقائياً
        </div>
      </main>
      <Footer />
    </>
  );
}
