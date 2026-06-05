"use client";

import { Lock } from "lucide-react";
import { useAccess, canInteract } from "@/lib/access";

/**
 * Small "مقفل" pill shown on a chapter activity card (quiz/flashcards/notes)
 * when the current student can't interact with that chapter. Purely a visual
 * hint — the card stays clickable and leads to the full lock screen.
 */
export function ActivityLockBadge({
  bookSlug,
  chapterNum,
}: {
  bookSlug: string;
  chapterNum: number;
}) {
  const { loading, tier } = useAccess();
  if (loading || canInteract(bookSlug, chapterNum, tier)) return null;

  return (
    <div className="absolute top-3 start-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold shadow-soft">
      <Lock className="size-3" />
      مقفل
    </div>
  );
}
