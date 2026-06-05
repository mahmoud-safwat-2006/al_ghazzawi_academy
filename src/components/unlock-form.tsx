"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { activate, type ActivationReason } from "@/lib/access";

function messageFor(reason: ActivationReason): string {
  switch (reason) {
    case "invalid":
      return "كود غير صحيح. تأكد من كتابته بالشكل AGZ-XXXX-XXXX.";
    case "used_by_other":
      return "هذا الكود مُستخدَم بالفعل أو مسجّل لاسم آخر.";
    case "device_limit":
      return "بلغت الحدّ الأقصى لعدد الأجهزة المسموح بها لهذا الكود.";
    case "network":
      return "تعذّر الاتصال بالخادم. تحقّق من الإنترنت وحاول مجدداً.";
  }
}

/**
 * Shared activation form: optional name (when not yet registered) + code.
 * Used by the locked-chapter gate and anywhere a quick unlock is needed.
 */
export function UnlockForm({
  needName,
  defaultName = "",
  onDone,
}: {
  needName: boolean;
  defaultName?: string;
  onDone?: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (needName && !name.trim()) {
      setError("أدخل اسمك أولاً.");
      return;
    }
    if (!code.trim()) {
      setError("أدخل كود التفعيل.");
      return;
    }
    setBusy(true);
    const res = await activate(code, needName ? name : defaultName);
    setBusy(false);
    if (res.ok) {
      onDone?.();
      return;
    }
    setError(messageFor(res.reason));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {needName && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك الكامل"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors"
        />
      )}
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="AGZ-XXXX-XXXX"
        dir="ltr"
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-mono tracking-widest text-center outline-none focus:border-cyan-400 transition-colors"
      />
      {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4" />
        )}
        تفعيل الحساب
      </button>
    </form>
  );
}
