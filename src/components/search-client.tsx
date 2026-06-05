"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import {
  buildStaticIndex,
  kindColor,
  kindLabel,
  noteToSearchItem,
  type SearchItem,
  type SearchItemKind,
} from "@/lib/search-index";
import { useAllNotes } from "@/lib/use-db";
import { getBook, getChapterFromBook } from "@/lib/books";

const ALL_KINDS: SearchItemKind[] = [
  "chapter",
  "summary",
  "flashcard",
  "quiz",
  "note",
];

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 0.6 },
    { name: "body", weight: 0.4 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
};

/** Highlight occurrences of any term from `query` inside `text`. */
function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return text;
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="bg-amber-200/70 text-foreground rounded px-0.5">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [activeKinds, setActiveKinds] = useState<Set<SearchItemKind>>(
    () => new Set(ALL_KINDS),
  );

  const staticIndex = useMemo(() => buildStaticIndex(), []);
  const allNotes = useAllNotes();

  const noteItems = useMemo<SearchItem[]>(() => {
    if (!allNotes) return [];
    return allNotes.map((note) => {
      const book = getBook(note.bookSlug);
      const ch = getChapterFromBook(note.bookSlug, note.chapterNum);
      return noteToSearchItem(
        note,
        book?.title_ar ?? note.bookSlug,
        ch?.title_ar ?? `الفصل ${note.chapterNum}`,
      );
    });
  }, [allNotes]);

  const fullIndex = useMemo(
    () => [...staticIndex, ...noteItems],
    [staticIndex, noteItems],
  );

  const fuse = useMemo(
    () => new Fuse(fullIndex, FUSE_OPTIONS),
    [fullIndex],
  );

  const results = useMemo<SearchItem[]>(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query.trim())
      .map((r) => r.item)
      .filter((item) => activeKinds.has(item.kind))
      .slice(0, 100);
  }, [fuse, query, activeKinds]);

  // Sync query to URL (debounced)
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = params.get("q") ?? "";
      if (query !== current) {
        const next = new URLSearchParams(params.toString());
        if (query) next.set("q", query);
        else next.delete("q");
        router.replace(`/search${next.toString() ? `?${next}` : ""}`, {
          scroll: false,
        });
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [query, params, router]);

  function toggleKind(k: SearchItemKind) {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      // never leave empty — re-select all
      if (next.size === 0) return new Set(ALL_KINDS);
      return next;
    });
  }

  const countsByKind = useMemo(() => {
    if (!query.trim()) return null;
    const all = fuse.search(query.trim()).map((r) => r.item);
    const counts: Record<SearchItemKind, number> = {
      chapter: 0,
      summary: 0,
      flashcard: 0,
      quiz: 0,
      note: 0,
    };
    for (const it of all) counts[it.kind] += 1;
    return counts;
  }, [fuse, query]);

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-4 size-5 text-muted pointer-events-none" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الملخصات، البطاقات، الأسئلة، الملاحظات…"
          className="w-full rounded-2xl border-2 border-border bg-card pr-12 pl-12 py-4 text-base font-medium text-foreground placeholder:text-muted focus:border-cyan-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute top-1/2 -translate-y-1/2 left-3 size-8 rounded-full bg-border/40 hover:bg-border text-muted hover:text-foreground flex items-center justify-center transition-colors"
            aria-label="مسح البحث"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {query.trim() && countsByKind && (
        <div className="flex flex-wrap gap-2">
          {ALL_KINDS.map((k) => {
            const active = activeKinds.has(k);
            const count = countsByKind[k];
            return (
              <button
                key={k}
                onClick={() => toggleKind(k)}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? kindColor(k)
                    : "bg-card text-muted border-border hover:border-foreground/30"
                }`}
              >
                {kindLabel(k)}
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1 text-[10px] font-black ${
                    active ? "bg-foreground/10" : "bg-border/40"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {query.trim() ? (
        results.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
            <p className="text-muted text-sm">لا توجد نتائج لـ "{query}"</p>
            <p className="text-muted text-xs mt-1">جرّب كلمات مختلفة أو غيّر الفلاتر</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted font-medium px-1">
              {results.length} نتيجة
            </p>
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-xl border border-border/60 bg-card p-4 hover:border-cyan-400/60 hover:shadow-soft transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${kindColor(item.kind)}`}
                  >
                    {kindLabel(item.kind)}
                  </span>
                  <span className="text-[11px] text-muted truncate">
                    الفصل {item.chapterNum} · {item.chapterTitle}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {highlight(item.title, query)}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                  {highlight(item.body, query)}
                </p>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <Search className="size-10 text-muted mx-auto mb-3" />
          <p className="text-muted font-semibold">ابدأ الكتابة للبحث</p>
          <p className="text-xs text-muted mt-1">
            يبحث في {staticIndex.length + noteItems.length} عنصراً عبر كل المحتوى
          </p>
        </div>
      )}
    </div>
  );
}
