/**
 * Export flashcards to Anki-compatible formats.
 *
 * Anki imports tab-separated text files where:
 *   - Each line is one card
 *   - Tab separates fields (front, back, optional tags)
 *   - HTML in fields is preserved (controlled via Anki import settings)
 *
 * This keeps the export simple — no .apkg deps, just plain text.
 */
import type { Flashcard } from "@/content/hr/types";

interface ExportOptions {
  /** title for the file (e.g. "hr-chapter-3") */
  fileBase: string;
  /** tag applied to every card (e.g. "HR::Chapter3") */
  tag?: string;
  cards: Flashcard[];
}

/** Escape tab + newline + double-quote to keep TSV well-formed. */
function sanitizeField(s: string): string {
  return s
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, '""')
    .trim();
}

/** Build a TSV string ready to download. */
export function buildAnkiTsv({ cards, tag }: Omit<ExportOptions, "fileBase">): string {
  const header = "#separator:tab\n#html:false\n#tags column:3\n";
  const lines = cards.map((c) => {
    const front = sanitizeField(
      `${c.term}${c.term_en ? ` (${c.term_en})` : ""}`,
    );
    const back = sanitizeField(c.definition);
    const cardTag = tag ? sanitizeField(tag) : "";
    return [front, back, cardTag].join("\t");
  });
  return header + lines.join("\n") + "\n";
}

/** Trigger a browser download of the TSV. */
export function downloadAnkiTsv(options: ExportOptions) {
  const tsv = buildAnkiTsv(options);
  const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.fileBase}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
