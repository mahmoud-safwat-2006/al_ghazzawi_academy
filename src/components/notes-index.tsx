"use client";

import Link from "next/link";
import { StickyNote, BookOpen } from "lucide-react";
import { useAllNotes } from "@/lib/use-db";
import { getBook, getChapterFromBook } from "@/lib/books";

export function NotesIndex() {
  const notes = useAllNotes();

  if (notes === undefined) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted">
        جارٍ التحميل…
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
        <StickyNote className="size-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-foreground font-bold mb-1">لا توجد ملاحظات بعد</p>
        <p className="text-sm text-muted mb-5">
          افتح أي فصل واضغط "ملاحظات" لتبدأ التدوين
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <BookOpen className="size-4" />
          استعرض الكتب
        </Link>
      </div>
    );
  }

  // Group by book+chapter
  const grouped = new Map<string, typeof notes>();
  for (const n of notes) {
    const key = `${n.bookSlug}:${n.chapterNum}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(n);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted px-1">
        {notes.length} ملاحظة عبر {grouped.size} فصلاً
      </p>
      {[...grouped.entries()].map(([key, group]) => {
        const [bookSlug, chapterNumStr] = key.split(":");
        const chapterNum = Number(chapterNumStr);
        const book = getBook(bookSlug);
        const ch = getChapterFromBook(bookSlug, chapterNum);
        return (
          <section
            key={key}
            className="rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
                  {book?.title_ar ?? bookSlug} · الفصل {chapterNum}
                </div>
                <h2 className="text-sm font-black text-foreground truncate">
                  {ch?.title_ar ?? `الفصل ${chapterNum}`}
                </h2>
              </div>
              <Link
                href={`/books/${bookSlug}/${chapterNum}/notes`}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-900 transition-colors whitespace-nowrap"
              >
                فتح المحرر ←
              </Link>
            </div>
            <div className="space-y-2">
              {group.map((n) => {
                const snippet = n.content
                  .replace(/[#*>`-]/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 160);
                return (
                  <Link
                    key={n.id}
                    href={`/books/${bookSlug}/${chapterNum}/notes`}
                    className="block rounded-lg border border-border/40 bg-background/30 px-3 py-2.5 hover:border-cyan-400/60 transition-colors"
                  >
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {snippet || "(فارغة)"}
                    </p>
                    <p className="text-[10px] text-muted mt-1">
                      {new Date(n.updatedAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
