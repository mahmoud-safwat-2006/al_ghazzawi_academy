"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { setPreference } from "@/lib/use-db";

type ThemeChoice = "light" | "dark" | "system";

const choices: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "فاتح", Icon: Sun },
  { value: "system", label: "تلقائي", Icon: Monitor },
  { value: "dark", label: "داكن", Icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — next-themes can't know the theme until client mount.
  useEffect(() => setMounted(true), []);

  function handleChange(next: ThemeChoice) {
    setTheme(next);
    // Best-effort sync to Dexie preferences (silent on failure).
    void setPreference("theme", next);
  }

  const active = (mounted ? (theme as ThemeChoice) : "system") ?? "system";

  return (
    <div
      role="radiogroup"
      aria-label="اختيار المظهر"
      className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card p-0.5"
    >
      {choices.map(({ value, label, Icon }) => {
        const selected = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => handleChange(value)}
            className={`inline-flex items-center justify-center size-7 rounded-full transition-all ${
              selected
                ? "bg-foreground text-background shadow-soft"
                : "text-muted hover:text-foreground hover:bg-border/40"
            }`}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
