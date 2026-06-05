import { Suspense } from "react";
import { Award } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CertificateView } from "@/components/certificate-view";

export const metadata = {
  title: "شهادة إتمام · أكاديمية الغزاوي",
  description: "حمّل شهادة الإتمام الخاصة بك",
};

function CertificateFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted">
      جارٍ تحميل الشهادة…
    </div>
  );
}

export default function CertificatePage() {
  return (
    <>
      <div className="print:hidden">
        <Nav />
      </div>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 print:py-0 print:max-w-none print:px-0">
        <div className="mb-8 flex items-start gap-3 print:hidden">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-card shrink-0">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              شهادة إتمام
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              مبارك إكمالك للكتاب
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              اكتب اسمك مرة واحدة ثم احفظ الشهادة كـ PDF.
            </p>
          </div>
        </div>

        <Suspense fallback={<CertificateFallback />}>
          <CertificateView />
        </Suspense>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
