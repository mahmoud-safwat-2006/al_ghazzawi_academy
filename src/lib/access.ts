"use client";

/**
 * Access control — local-first (Phase 1).
 *
 * A registered student may BROWSE everything (summaries, PDF, mind-maps) but may
 * only INTERACT (quiz, flashcards, notes, progress) with the free *trial chapter*
 * of each book — unless they redeem an activation code to unlock "full" access.
 *
 * ⚠️ Phase 1 verifies codes locally (a "red ribbon" deterrent). Phase 2 replaces
 * the body of `verifyCode` with a POST to /api/activate backed by Supabase, for
 * true single-use, per-person, device-limited codes. Keep ALL backend-facing
 * logic behind this module so the upgrade only touches `verifyCode`.
 */
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "./db";

export type AccessTier = "trial" | "full";

/**
 * Free trial chapter per book — يحدّده صاحب المنصة.
 * غيّر الرقم هنا لتغيير الفصل المجاني لأي كتاب.
 */
const TRIAL_CHAPTERS: Record<string, number> = {
  hr: 1,
  marketing: 1,
  management: 1,
};

export function trialChapterFor(bookSlug: string): number {
  return TRIAL_CHAPTERS[bookSlug] ?? 1;
}

/** Is this the book's free trial chapter? */
export function isTrialChapter(bookSlug: string, chapterNum: number): boolean {
  return chapterNum === trialChapterFor(bookSlug);
}

/** Can the student interact with (not just read) this chapter? */
export function canInteract(
  bookSlug: string,
  chapterNum: number,
  tier: AccessTier,
): boolean {
  return tier === "full" || isTrialChapter(bookSlug, chapterNum);
}

// =====================
// Device identity
// =====================

const DEVICE_ID_KEY = "agz_device_id";

/** Stable per-browser device id, created once and persisted in localStorage. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `dev_${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// =====================
// Reactive access state
// =====================

export interface AccessState {
  /** true until the local DB has been read at least once */
  loading: boolean;
  /** has the student entered a name? */
  registered: boolean;
  studentName: string;
  tier: AccessTier;
}

export function useAccess(): AccessState {
  // Returning `null` (not undefined) when empty lets us tell "loading" apart
  // from "loaded but no row yet".
  const prefs = useLiveQuery(
    async () => (await getDB().preferences.get("user")) ?? null,
    [],
  );
  const loading = prefs === undefined;
  const studentName = prefs?.studentName?.trim() ?? "";
  return {
    loading,
    registered: studentName.length > 0,
    studentName,
    tier: prefs?.accessTier === "full" ? "full" : "trial",
  };
}

// =====================
// Mutations
// =====================

/** Register (or update) the student's name; keeps "full" tier if already unlocked. */
export async function registerStudent(name: string): Promise<void> {
  try {
    const db = getDB();
    const existing =
      (await db.preferences.get("user")) ?? { id: "user" as const };
    await db.preferences.put({
      ...existing,
      studentName: name.trim(),
      accessTier: existing.accessTier === "full" ? "full" : "trial",
    });
  } catch (err) {
    console.warn("[access] registerStudent failed", err);
  }
}

export type ActivationReason =
  | "invalid"
  | "used_by_other"
  | "device_limit"
  | "network";

export type ActivationResult =
  | { ok: true }
  | { ok: false; reason: ActivationReason };

/**
 * Verify an activation code against the central ledger (Phase 2).
 *
 * Calls our own /api/activate route (same origin), which holds the Supabase
 * service-role key server-side and runs the atomic `claim_code` RPC. The browser
 * never talks to Supabase directly. Maps the server's reason to ActivationReason.
 */
async function verifyCode(
  code: string,
  name: string,
  deviceId: string,
): Promise<ActivationResult> {
  const res = await fetch("/api/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, name, deviceId }),
  });
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; reason?: string }
    | null;
  if (!data || typeof data.ok !== "boolean") {
    return { ok: false, reason: "network" };
  }
  if (data.ok) return { ok: true };
  const reason: ActivationReason =
    data.reason === "invalid" ||
    data.reason === "used_by_other" ||
    data.reason === "device_limit"
      ? data.reason
      : "network";
  return { ok: false, reason };
}

/**
 * Redeem a code and, on success, unlock full access locally + persist the name.
 */
export async function activate(
  code: string,
  name: string,
): Promise<ActivationResult> {
  const deviceId = getDeviceId();
  let result: ActivationResult;
  try {
    result = await verifyCode(code, name, deviceId);
  } catch {
    return { ok: false, reason: "network" };
  }
  if (!result.ok) return result;

  try {
    const db = getDB();
    const existing =
      (await db.preferences.get("user")) ?? { id: "user" as const };
    await db.preferences.put({
      ...existing,
      studentName: name.trim() || existing.studentName,
      accessTier: "full",
      activationCode: code.trim().toUpperCase(),
      unlockedAt: Date.now(),
    });
  } catch (err) {
    console.warn("[access] activate persist failed", err);
  }
  return { ok: true };
}
