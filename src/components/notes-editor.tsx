"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Eye,
  Pencil,
  Plus,
  Save,
  Trash2,
  StickyNote,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import {
  deleteChapterNote,
  upsertChapterNote,
  useChapterNotes,
} from "@/lib/use-db";
import { logStudySession } from "@/lib/db";

interface Props {
  bookSlug: string;
  chapterNum: number;
  chapterTitle: string;
}

const AUTOSAVE_MS = 800;

export function NotesEditor({ bookSlug, chapterNum, chapterTitle }: Props) {
  const notes = useChapterNotes(bookSlug, chapterNum);
  const [activeId, setActiveId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const sessionLoggedRef = useRef(false);

  // Select first note on first load when nothing is active
  useEffect(() => {
    if (activeId === null && notes && notes.length > 0) {
      setActiveId(notes[0].id!);
      setDraft(notes[0].content);
    }
  }, [notes, activeId]);

  // When switching active note, load its content
  useEffect(() => {
    if (activeId === "new") {
      setDraft("");
      setSavedAt(null);
      return;
    }
    if (typeof activeId === "number") {
      const note = notes?.find((n) => n.id === activeId);
      if (note) {
        setDraft(note.content);
        setSavedAt(note.updatedAt);
      }
    }
  }, [activeId, notes]);

  // Debounced auto-save
  useEffect(() => {
    if (activeId === null) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(async () => {
      const content = draft.trim();
      if (!content) return;
      const idToSave = typeof activeId === "number" ? activeId : undefined;
      const newId = await upsertChapterNote(
        bookSlug,
        chapterNum,
        content,
        idToSave,
      );
      setSavedAt(Date.now());
      if (activeId === "new") setActiveId(newId);
      if (!sessionLoggedRef.current) {
        sessionLoggedRef.current = true;
        void logStudySession("reading", bookSlug, chapterNum);
      }
    }, AUTOSAVE_MS);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [draft, activeId, bookSlug, chapterNum]);

  async function handleDelete() {
    if (typeof activeId !== "number") return;
    if (!confirm("حذف هذه الملاحظة؟ لا يمكن التراجع.")) return;
    await deleteChapterNote(activeId);
    setActiveId(null);
    setDraft("");
  }

  function startNew() {
    setActiveId("new");
    setDraft("");
    setView("edit");
  }

  const rendered = useMemo(() => renderMarkdown(draft), [draft]);

  const activeNote =
    typeof activeId === "number" ? notes?.find((n) => n.id === activeId) : null;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar — notes list */}
      <aside className="rounded-2xl border border-border/60 bg-card p-4 lg:max-h-[600px] lg:overflow-y-auto">
        <button
          onClick={startNew}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity mb-3"
        >
          <Plus className="size-4" />
          ملاحظة جديدة
        </button>

        {notes === undefined ? (
          <div className="text-xs text-muted text-center py-4">جارٍ التحميل…</div>
        ) : notes.length === 0 && activeId !== "new" ? (
          <div className="text-xs text-muted text-center py-6">
            <StickyNote className="size-6 mx-auto mb-2 opacity-40" />
            لا توجد ملاحظات بعد
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeId === "new" && (
              <div className="rounded-lg border-2 border-cyan-500 bg-cyan-50/50 px-3 py-2 text-xs">
                <div className="font-bold text-cyan-800">ملاحظة جديدة</div>
                <div className="text-muted text-[10px] mt-0.5">يُحفظ تلقائياً عند الكتابة</div>
              </div>
            )}
            {notes?.map((n) => {
              const active = activeId === n.id;
              const snippet = n.content.replace(/[#*>`-]/g, " ").trim().slice(0, 50);
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveId(n.id!)}
                  className={`w-full text-start rounded-lg border-2 px-3 py-2 transition-all ${
                    active
                      ? "border-cyan-500 bg-cyan-50/50"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="text-xs text-foreground font-semibold line-clamp-1">
                    {snippet || "(فارغة)"}
                  </div>
                  <div className="text-[10px] text-muted mt-1">
                    {new Date(n.updatedAt).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Editor */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        {activeId === null ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center">
            <StickyNote className="size-10 text-muted opacity-50 mb-3" />
            <p className="text-muted font-semibold">اختر ملاحظة أو ابدأ واحدة جديدة</p>
            <p className="text-xs text-muted mt-1">
              يدعم Markdown: # ## **بولد** *مائل* - قائمة
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="text-xs text-muted">
                <span className="text-foreground font-bold">{chapterTitle}</span>
                {savedAt && (
                  <span className="ms-2 inline-flex items-center gap-1 text-emerald-700">
                    <Check className="size-3" />
                    حُفظ {new Date(savedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="inline-flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setView("edit")}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${
                      view === "edit"
                        ? "bg-foreground text-background"
                        : "bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    <Pencil className="size-3" />
                    تحرير
                  </button>
                  <button
                    onClick={() => setView("preview")}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors ${
                      view === "preview"
                        ? "bg-foreground text-background"
                        : "bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    <Eye className="size-3" />
                    معاينة
                  </button>
                </div>
                {activeNote && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center size-8 rounded-lg border border-border text-muted hover:text-rose-700 hover:border-rose-300 transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {view === "edit" ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب ملاحظتك… (يدعم Markdown)&#10;&#10;# عنوان&#10;## عنوان فرعي&#10;**نص بارز**&#10;- نقطة"
                className="w-full min-h-[400px] rounded-xl border-2 border-border bg-background/40 p-4 text-sm text-foreground placeholder:text-muted resize-y focus:border-cyan-500 focus:outline-none transition-colors font-mono leading-relaxed"
                dir="rtl"
              />
            ) : (
              <div
                className="min-h-[400px] rounded-xl border-2 border-border bg-background/40 p-4 text-sm text-foreground prose-headings:text-foreground"
                dangerouslySetInnerHTML={{ __html: rendered || '<p class="text-muted text-center mt-12">المعاينة فارغة</p>' }}
              />
            )}

            <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
              <span>{draft.length} حرف</span>
              <span className="inline-flex items-center gap-1">
                <Save className="size-3" />
                حفظ تلقائي
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
