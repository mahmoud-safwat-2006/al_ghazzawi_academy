import { Suspense } from "react";
import { Search } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SearchClient } from "@/components/search-client";

export const metadata = {
  title: "البحث الشامل · أكاديمية الغزاوي",
  description: "ابحث في الملخصات والبطاقات والأسئلة والملاحظات",
};

function SearchFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted">
      جارٍ تحميل البحث…
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-royal-600 text-white flex items-center justify-center shadow-card shrink-0">
            <Search className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
              البحث الشامل
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              ابحث في كل المحتوى
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              ملخصات، بطاقات، أسئلة، وملاحظاتك الشخصية في مكان واحد.
            </p>
          </div>
        </div>

        <Suspense fallback={<SearchFallback />}>
          <SearchClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
