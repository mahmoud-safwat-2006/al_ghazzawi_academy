import { Logo } from "./logo";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {SITE.tagline.ar}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">المنصة</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="/books" className="hover:text-foreground transition-colors">الكتب</a></li>
              <li><a href="/assistant" className="hover:text-foreground transition-colors">المساعد الذكي</a></li>
              <li><a href="/certificate" className="hover:text-foreground transition-colors">الشهادة</a></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">عن المنصة</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">المصادر</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><span>الكتب مفتوحة الوصول</span></li>
              <li><span>محتوى عربي 100%</span></li>
              <li><span>يعمل بدون إنترنت (PWA)</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted">
          <p>© {new Date().getFullYear()} {SITE.name.ar}. صُمم وطُوّر بعناية.</p>
          <p className="font-mono text-[11px]">
            v0.1.0 · Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
