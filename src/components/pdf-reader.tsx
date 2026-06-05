"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  addPdfBookmark,
  removePdfBookmark,
  savePdfPosition,
  usePdfBookmarks,
  usePdfPosition,
} from "@/lib/use-db";
import { logStudySession } from "@/lib/db";

// PDF.js worker — served from /public/pdf-worker/
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.mjs";

interface PdfReaderProps {
  /** path under /public, e.g. "/books/hr.pdf" */
  file: string;
  /** unique slug for storing reading position (e.g. "hr") */
  bookSlug: string;
  /** display title shown in the header */
  title: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;

export function PdfReader({ file, bookSlug, title }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [pageInput, setPageInput] = useState("1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const savedPosition = usePdfPosition(bookSlug);
  const bookmarks = usePdfBookmarks(bookSlug);
  const isBookmarked = useMemo(
    () => bookmarks?.some((b) => b.page === page) ?? false,
    [bookmarks, page],
  );
  const currentBookmark = useMemo(
    () => bookmarks?.find((b) => b.page === page),
    [bookmarks, page],
  );

  // Restore saved position once on mount (after Dexie loads it).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (savedPosition && savedPosition.page >= 1) {
      setPage(savedPosition.page);
      setPageInput(String(savedPosition.page));
      if (savedPosition.scale) setScale(savedPosition.scale);
      restoredRef.current = true;
    } else if (savedPosition === undefined) {
      // useLiveQuery is still loading — wait
    } else {
      restoredRef.current = true;
    }
  }, [savedPosition]);

  // Persist position (debounced) whenever page or scale changes.
  useEffect(() => {
    if (!restoredRef.current) return;
    const timer = setTimeout(() => {
      void savePdfPosition(bookSlug, page, scale);
    }, 400);
    return () => clearTimeout(timer);
  }, [bookSlug, page, scale]);

  // Log a "reading" study session once per mount.
  useEffect(() => {
    void logStudySession("reading", bookSlug);
  }, [bookSlug]);

  // Track container width for responsive page rendering.
  useEffect(() => {
    const el = pageContainerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth - 16);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (e.key === "ArrowLeft" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowRight" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, numPages]);

  // Fullscreen state listener
  useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      setLoadError(null);
    },
    [],
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF load error", err);
    setLoadError("تعذّر تحميل الكتاب. حاول تحديث الصفحة.");
  }, []);

  function goPrev() {
    setPage((p) => {
      const next = Math.max(1, p - 1);
      setPageInput(String(next));
      return next;
    });
  }
  function goNext() {
    setPage((p) => {
      const next = numPages ? Math.min(numPages, p + 1) : p + 1;
      setPageInput(String(next));
      return next;
    });
  }
  function jumpTo(target: number) {
    if (!numPages) return;
    const clamped = Math.max(1, Math.min(numPages, target));
    setPage(clamped);
    setPageInput(String(clamped));
  }

  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  }
  function zoomOut() {
    setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
  }
  function resetZoom() {
    setScale(1.1);
  }

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  async function toggleBookmark() {
    if (isBookmarked && currentBookmark?.id) {
      await removePdfBookmark(currentBookmark.id);
    } else {
      await addPdfBookmark(bookSlug, page, `صفحة ${page}`);
    }
  }

  const progress = numPages ? Math.round((page / numPages) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden ${
        isFullscreen ? "rounded-none border-0" : ""
      }`}
    >
      {/* Header / toolbar */}
      <div className="border-b border-border/60 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">{title}</h2>
            {numPages && (
              <span className="text-xs text-muted font-medium shrink-0">
                ({numPages} صفحة)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Zoom */}
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/80 bg-card p-0.5">
              <button
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                aria-label="تصغير"
                className="inline-flex items-center justify-center size-7 rounded-md text-muted hover:text-foreground hover:bg-border/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <button
                onClick={resetZoom}
                aria-label="إعادة الزوم"
                className="px-2 h-7 rounded-md text-xs font-bold text-muted hover:text-foreground hover:bg-border/40 transition-colors min-w-12"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                aria-label="تكبير"
                className="inline-flex items-center justify-center size-7 rounded-md text-muted hover:text-foreground hover:bg-border/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              aria-label={isBookmarked ? "إزالة العلامة" : "إضافة علامة"}
              title={isBookmarked ? "إزالة العلامة" : "إضافة علامة"}
              className={`inline-flex items-center justify-center size-8 rounded-lg border transition-colors ${
                isBookmarked
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:border-amber-700"
                  : "border-border/80 bg-card text-muted hover:text-foreground"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="size-4" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </button>

            <button
              onClick={() => setShowBookmarks((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 h-8 text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline">العلامات</span>
              <span className="rounded-full bg-border/60 px-1.5 text-[10px] font-bold">
                {bookmarks?.length ?? 0}
              </span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
              className="inline-flex items-center justify-center size-8 rounded-lg border border-border/80 bg-card text-muted hover:text-foreground transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {numPages && (
          <div className="h-1 bg-border/40">
            <div
              className="h-full bg-gradient-to-r from-royal-600 to-cyan-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex">
        {/* Bookmarks sidebar */}
        {showBookmarks && (
          <aside className="w-56 shrink-0 border-e border-border/60 bg-background/40 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border/60 px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">
              العلامات المرجعية
            </div>
            {bookmarks && bookmarks.length > 0 ? (
              <ul className="p-2 space-y-1">
                {bookmarks.map((b) => (
                  <li key={b.id} className="flex items-center gap-1">
                    <button
                      onClick={() => jumpTo(b.page)}
                      className={`flex-1 text-start rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        page === b.page
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                          : "hover:bg-border/40 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="size-3 text-amber-600 shrink-0" />
                        <span className="truncate">{b.label ?? `صفحة ${b.page}`}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => b.id && removePdfBookmark(b.id)}
                      aria-label="حذف"
                      className="size-7 inline-flex items-center justify-center rounded-md text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-muted text-center">
                لا توجد علامات بعد. اضغط على أيقونة العلامة لإضافة واحدة.
              </p>
            )}
          </aside>
        )}

        {/* Page viewer */}
        <div
          ref={pageContainerRef}
          className="flex-1 min-w-0 bg-border/20 dark:bg-black/30 p-3 sm:p-6 flex items-start justify-center overflow-auto"
          style={{ maxHeight: isFullscreen ? "calc(100vh - 6rem)" : "75vh" }}
        >
          {loadError ? (
            <div className="text-center py-10">
              <p className="text-rose-600 font-semibold">{loadError}</p>
            </div>
          ) : (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center gap-3 py-10 text-muted">
                  <Loader2 className="size-8 animate-spin" />
                  <p className="text-sm font-medium">جاري تحميل الكتاب…</p>
                </div>
              }
              error={
                <div className="text-center py-10 text-rose-600 font-semibold">
                  تعذّر تحميل الكتاب.
                </div>
              }
            >
              <Page
                pageNumber={page}
                scale={scale}
                width={containerWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={
                  <div className="flex items-center justify-center py-20 text-muted">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                }
                className="shadow-card rounded-lg overflow-hidden bg-white"
              />
            </Document>
          )}
        </div>
      </div>

      {/* Footer / pagination */}
      <div className="border-t border-border/60 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5">
          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground/40 transition-colors"
          >
            <ChevronRight className="size-4" />
            <span className="hidden sm:inline">السابقة</span>
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(pageInput);
              if (!Number.isNaN(n)) jumpTo(n);
            }}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="number"
              min={1}
              max={numPages ?? 999}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-16 text-center rounded-lg border border-border/80 bg-card px-2 py-1 text-sm font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="text-muted font-medium">
              من {numPages ?? "—"}
            </span>
          </form>

          <button
            onClick={goNext}
            disabled={!numPages || page >= numPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground/40 transition-colors"
          >
            <span className="hidden sm:inline">التالية</span>
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
