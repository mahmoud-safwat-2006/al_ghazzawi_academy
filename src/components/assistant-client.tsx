"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen, Bot, ChevronLeft, Sparkles, User } from "lucide-react";
import { answer, type AssistantAnswer } from "@/lib/assistant";
import { kindColor, kindLabel } from "@/lib/search-index";

const STARTERS = [
  "ما الفرق بين الاستقطاب والاختيار؟",
  "كيف تُحسب الأجور؟",
  "ما هي مراحل تقييم الأداء؟",
  "ما تعريف رأس المال الفكري؟",
];

interface Turn {
  id: number;
  reply: AssistantAnswer;
}

/** Render markdown-ish answer text (bold + line breaks). */
function renderAnswer(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-2">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} className="text-foreground font-bold">
              {p.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

export function AssistantClient() {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const reply = answer(trimmed);
    if (!reply) return;
    setTurns((prev) => [...prev, { id: Date.now(), reply }]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      {turns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <Bot className="size-12 text-cyan-600 mx-auto mb-3" />
          <p className="text-foreground font-bold mb-1">اسألني عن أي مفهوم</p>
          <p className="text-xs text-muted mb-5">
            أركّب الجواب من محتوى الكتب مع روابط للفصول المرجعية
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-start">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-xs font-semibold text-muted hover:text-foreground hover:border-cyan-300/60 transition-colors"
              >
                <Sparkles className="inline size-3 mb-0.5 me-1 text-cyan-500" />
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {turns.map((t) => (
            <div key={t.id} className="space-y-3">
              {/* user turn */}
              <div className="flex items-start gap-2 justify-end">
                <div className="rounded-2xl bg-foreground text-background px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm font-semibold leading-relaxed">
                    {t.reply.question}
                  </p>
                </div>
                <div className="size-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                  <User className="size-3.5 text-foreground" />
                </div>
              </div>

              {/* assistant turn */}
              <div className="flex items-start gap-2">
                <div className="size-7 rounded-full bg-gradient-to-br from-cyan-500 to-royal-600 flex items-center justify-center shrink-0 shadow-soft">
                  <Bot className="size-3.5 text-white" />
                </div>
                <div className="flex-1 rounded-2xl border border-border/60 bg-card p-4 max-w-[90%]">
                  {renderAnswer(t.reply.summary)}

                  {t.reply.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                        المصادر ({t.reply.sources.length})
                      </div>
                      <div className="space-y-1.5">
                        {t.reply.sources.map((src, i) => (
                          <Link
                            key={i}
                            href={src.href}
                            className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5 hover:border-cyan-400/60 transition-colors group"
                          >
                            <span
                              className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold shrink-0 mt-0.5 ${kindColor(src.kind)}`}
                            >
                              {kindLabel(src.kind)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-foreground truncate">
                                {src.title}
                              </div>
                              <div className="text-[10px] text-muted mt-0.5 truncate">
                                الفصل {src.chapterNum} · {src.chapterTitle}
                              </div>
                            </div>
                            <ChevronLeft className="size-3.5 text-muted shrink-0 mt-0.5 group-hover:-translate-x-0.5 group-hover:text-foreground transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {t.reply.followUps.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-cyan-700">
                        تعمّق أكثر:
                      </span>
                      {t.reply.followUps.map((f, i) => (
                        <Link
                          key={i}
                          href={f.href}
                          className="text-[11px] font-semibold rounded-full bg-cyan-50 text-cyan-800 px-2.5 py-1 hover:bg-cyan-100 transition-colors inline-flex items-center gap-1"
                        >
                          <BookOpen className="size-2.5" />
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      )}

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
        className="sticky bottom-4 flex items-center gap-2 rounded-2xl border-2 border-border bg-card p-1.5 shadow-card"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اسألني أي شيء عن الموارد البشرية…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex items-center justify-center size-9 rounded-xl bg-cyan-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors shrink-0"
          aria-label="إرسال"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}
