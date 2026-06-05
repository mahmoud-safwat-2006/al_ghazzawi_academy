"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Award, Download, Pencil, Printer, ArrowLeft } from "lucide-react";
import { setPreference, usePreferences } from "@/lib/use-db";
import {
  buildCertificateId,
  getBookForCertificate,
} from "@/lib/certificate";

const STORAGE_KEY = "alghazzawi:student-name";

export function CertificateView() {
  const params = useSearchParams();
  const bookSlug = params.get("book") ?? "hr";
  const prefs = usePreferences();

  const [name, setName] = useState<string>("");
  const [editing, setEditing] = useState(false);

  // Pull saved name on mount. Falls back to localStorage if prefs schema doesn't store it yet.
  useEffect(() => {
    if (prefs?.studentName) {
      setName(prefs.studentName);
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setName(stored);
    }
  }, [prefs]);

  function saveName(n: string) {
    const trimmed = n.trim();
    setName(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, trimmed);
    }
    void setPreference("studentName", trimmed);
    setEditing(false);
  }

  const book = getBookForCertificate(bookSlug);
  const completedAt = Date.now();
  const certificateId = name
    ? buildCertificateId(bookSlug, name, completedAt)
    : "—";

  if (!book) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted">
        كتاب غير موجود
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top controls — hidden when printing */}
      <div className="flex items-center justify-between gap-3 flex-wrap print:hidden">
        <Link
          href="/achievements"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 rotate-180" />
          رجوع للشارات
        </Link>
        <div className="flex items-center gap-2">
          {!editing && name && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-2 text-xs font-bold hover:border-foreground/40 transition-colors"
            >
              <Pencil className="size-3.5" />
              تعديل الاسم
            </button>
          )}
          <button
            onClick={() => window.print()}
            disabled={!name}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Printer className="size-4" />
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      {/* Name capture */}
      {(!name || editing) && (
        <NameCapture initial={name} onSave={saveName} />
      )}

      {/* Certificate itself */}
      <article
        className="certificate-paper relative bg-white text-zinc-900 rounded-2xl shadow-card overflow-hidden mx-auto"
        dir="rtl"
      >
        {/* Decorative borders */}
        <div className="absolute inset-3 border-2 border-amber-600/40 rounded-xl pointer-events-none" />
        <div className="absolute inset-5 border border-amber-500/30 rounded-lg pointer-events-none" />

        {/* Top corner ornaments */}
        <div className="absolute top-0 end-0 size-32 bg-amber-100/60 rounded-bl-full" />
        <div className="absolute top-0 start-0 size-32 bg-cyan-100/60 rounded-br-full" />
        <div className="absolute bottom-0 end-0 size-40 bg-royal-100/40 rounded-tl-full" />
        <div className="absolute bottom-0 start-0 size-40 bg-cyan-100/40 rounded-tr-full" />

        <div className="relative px-8 sm:px-14 py-12 sm:py-16 text-center">
          {/* Brand */}
          <div className="inline-flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] mb-1">
            <Award className="size-4 text-amber-600" />
            Al-Ghazzawi Academy
          </div>
          <div className="text-xs text-zinc-500 mb-8">
            أكاديمية الغزاوي · شهادة إتمام
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight mb-3">
            شهادة إتمام
          </h1>
          <div className="w-20 h-1 bg-amber-600 mx-auto rounded-full mb-8" />

          {/* Body */}
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            تشهد أكاديمية الغزاوي أن
          </p>
          <p className="mt-4 mb-4 text-3xl sm:text-5xl font-black bg-gradient-to-br from-cyan-700 to-royal-700 bg-clip-text text-transparent">
            {name || "—"}
          </p>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
            قد أتمّ بنجاح دراسة كتاب
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl font-black text-zinc-900">
            {book.title_ar}
          </h2>
          <p className="mt-1 text-sm text-zinc-500" dir="ltr">
            {book.title_en}
          </p>
          <p className="mt-6 text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
            ضمن منهج <strong>{book.program}</strong>،
            بإكمال {book.chapters.length} فصلاً كاملاً مع الملخصات والكويزات
            والبطاقات.
          </p>

          {/* Footer */}
          <div className="mt-12 flex items-end justify-between gap-4 text-start">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                التاريخ
              </div>
              <div className="text-sm font-bold text-zinc-900">
                {new Date(completedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg mb-1">
                <Award className="size-7" />
              </div>
              <div className="text-[10px] text-zinc-500">الختم</div>
            </div>
            <div className="text-end">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                رقم الشهادة
              </div>
              <div className="text-sm font-mono font-bold text-zinc-900">
                {certificateId}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Tip — hidden in print */}
      <p className="text-center text-xs text-muted print:hidden">
        <Download className="inline size-3 mb-0.5 mx-1" />
        لحفظ الشهادة كـ PDF: اضغط "طباعة" ثم اختر "حفظ كـ PDF" من المتصفح
      </p>
    </div>
  );
}

function NameCapture({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const value = inputRef.current?.value.trim() ?? "";
    if (value) onSave(value);
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-6 print:hidden">
      <h2 className="text-lg font-black text-foreground mb-2">
        اكتب اسمك للشهادة
      </h2>
      <p className="text-sm text-muted mb-4">
        هذا الاسم سيظهر على الشهادة. يُحفظ على جهازك فقط.
      </p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          defaultValue={initial}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="الاسم الكامل"
          autoFocus
          className="flex-1 rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-medium focus:border-amber-500 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-amber-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-amber-700 transition-colors"
        >
          حفظ
        </button>
      </div>
    </div>
  );
}
