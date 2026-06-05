import Link from "next/link";
import { Bot, Search } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { StreakBadge } from "./streak-badge";
import { AccessBadge } from "./access-badge";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/books" className="text-muted hover:text-foreground transition-colors">
            الكتب
          </Link>
          <Link href="/quiz" className="text-muted hover:text-foreground transition-colors">
            كويز
          </Link>
          <Link href="/review" className="text-muted hover:text-foreground transition-colors">
            المراجعة
          </Link>
          <Link href="/notes" className="text-muted hover:text-foreground transition-colors">
            ملاحظاتي
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
            التقدم
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/assistant"
            className="inline-flex items-center justify-center size-9 rounded-full text-muted hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
            aria-label="المساعد الذكي"
          >
            <Bot className="size-4" />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center size-9 rounded-full text-muted hover:text-foreground hover:bg-border/40 transition-colors"
            aria-label="البحث"
          >
            <Search className="size-4" />
          </Link>
          <AccessBadge />
          <StreakBadge />
          <ThemeToggle />
          <Link
            href="/books"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            ابدأ التعلم
          </Link>
        </div>
      </div>
    </header>
  );
}
