"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// react-pdf relies on browser-only APIs (canvas, DOMMatrix, web worker).
// We must disable SSR — ssr:false works only inside Client Components.
const PdfReader = dynamic(
  () => import("@/components/pdf-reader").then((m) => m.PdfReader),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border/60 bg-card p-12 shadow-soft flex flex-col items-center gap-3 text-muted">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm font-medium">جاري تحضير قارئ الكتاب…</p>
      </div>
    ),
  },
);

interface ReaderWrapperProps {
  file: string;
  bookSlug: string;
  title: string;
}

export function ReaderWrapper(props: ReaderWrapperProps) {
  return <PdfReader {...props} />;
}
