import Link from "next/link";
import { ArrowLeft, BookOpen, Lock } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BOOKS } from "@/lib/site";

export const metadata = {
  title: "الكتب",
  description: "تصفّح الكتب الخمسة المتاحة في أكاديمية الغزاوي",
};

export default function BooksPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 mb-3">
            <BookOpen className="size-3.5" />
            المكتبة
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            خمسة كتب MBA،
            <br />
            <span className="text-muted">منهج متكامل بالعربية.</span>
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            كل كتاب يحتوي على ملخصات بثلاثة مستويات، بنك أسئلة كثيف، وفلاش كاردز للمصطلحات.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKS.map((book, idx) => (
            <Link
              key={book.slug}
              href={book.status === "ready" ? `/books/${book.slug}` : "#"}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all duration-500 ${
                book.status === "ready"
                  ? "hover:shadow-card hover:border-cyan-300/50"
                  : "opacity-75 cursor-not-allowed"
              }`}
              aria-disabled={book.status !== "ready"}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${book.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`}
              />

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`size-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center text-white font-black text-lg shadow-soft`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  {book.status === "ready" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-emerald-200">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      متاح الآن
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-amber-200">
                      <Lock className="size-2.5" />
                      قريباً
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {book.title_ar}
                </h2>
                <p className="mt-1 text-sm text-muted font-medium" dir="ltr">
                  {book.title_en}
                </p>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted">
                    {book.chapters > 0 ? `${book.chapters} فصلاً` : "محتوى قيد الإعداد"}
                  </span>
                  {book.status === "ready" && (
                    <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                      ادخل
                      <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
