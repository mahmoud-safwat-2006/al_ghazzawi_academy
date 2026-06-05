/**
 * Helpers for the completion certificate.
 *
 * The student is asked once for their name (cached in preferences).
 * The certificate ID is deterministic per (book, name) so re-prints stay stable.
 */
import { hrBook, type Book } from "@/content/hr";

export interface CertificateData {
  studentName: string;
  bookSlug: string;
  bookTitle: string;
  completedAt: number;
  certificateId: string;
}

/**
 * Compute a short, human-friendly certificate ID from (book, name, date).
 * Deterministic for a given completion event so the student can reference it.
 */
export function buildCertificateId(
  bookSlug: string,
  studentName: string,
  completedAt: number,
): string {
  const dayKey = new Date(completedAt).toISOString().slice(0, 10).replace(/-/g, "");
  let hash = 0;
  const src = `${bookSlug}:${studentName}:${dayKey}`;
  for (let i = 0; i < src.length; i++) {
    hash = (hash << 5) - hash + src.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padStart(6, "0");
  return `AGA-${dayKey.slice(2)}-${code}`;
}

export function getBookForCertificate(slug: string): Book | undefined {
  if (slug === "hr") return hrBook;
  return undefined;
}
