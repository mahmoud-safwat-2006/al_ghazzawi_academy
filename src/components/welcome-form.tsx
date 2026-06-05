"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useAccess, registerStudent, activate } from "@/lib/access";

/**
 * Login / registration form for /welcome.
 * Name is required; activation code is optional (no code → trial access).
 */
export function WelcomeForm() {
  const router = useRouter();
  const { loading, registered, studentName, tier } = useAccess();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const effectiveName = (name || studentName).trim();

  // Already fully unlocked → just send them in.
  if (!loading && registered && tier === "full") {
    return (
      <div className="text-center">
        <p className="font-bold text-emerald-700">
          مرحباً {studentName} — حسابك مفعّل بالكامل ✓
        </p>
        <Link
          href="/books"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          تابع إلى الكتب
          <ArrowLeft className="size-4" />
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!effectiveName) {
      setError("أدخل اسمك للمتابعة.");
      return;
    }
    setBusy(true);
    try {
      if (code.trim()) {
        const res = await activate(code, effectiveName);
        if (!res.ok) {
          setBusy(false);
          setError(
            res.reason === "invalid"
              ? "كود غير صحيح. تأكد من الشكل AGZ-XXXX-XXXX، أو ابدأ تجريبياً بدون كود."
              : res.reason === "used_by_other"
                ? "هذا الكود مُستخدَم بالفعل أو مسجّل لاسم آخر."
                : res.reason === "device_limit"
                  ? "بلغت الحدّ الأقصى لعدد الأجهزة لهذا الكود."
                  : "تعذّر الاتصال. حاول مجدداً.",
          );
          return;
        }
      } else {
        await registerStudent(effectiveName);
      }
      router.push("/books");
    } catch {
      setBusy(false);
      setError("حدث خطأ غير متوقع. حاول مجدداً.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-foreground mb-1.5">
          اسمك
        </label>
        <input
          type="text"
          value={name || studentName}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: أحمد العبيد"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground mb-1.5">
          كود التفعيل{" "}
          <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="AGZ-XXXX-XXXX"
          dir="ltr"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-mono tracking-widest text-center outline-none focus:border-cyan-400 transition-colors"
        />
        <p className="mt-1.5 text-xs text-muted">
          بدون كود تبدأ بحساب تجريبي (تصفّح كامل + تفاعل مع الفصل المجاني). أدخل
          الكود لفتح كل الفصول.
        </p>
      </div>

      {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {code.trim() ? "تفعيل ودخول" : "ابدأ التعلّم"}
      </button>
    </form>
  );
}
