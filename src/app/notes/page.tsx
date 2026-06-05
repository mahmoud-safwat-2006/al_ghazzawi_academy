import { StickyNote } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { NotesIndex } from "@/components/notes-index";

export const metadata = {
  title: "ملاحظاتي · أكاديمية الغزاوي",
  description: "كل ملاحظاتك الشخصية مجمّعة في مكان واحد",
};

export default function NotesPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-card shrink-0">
            <StickyNote className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-violet-700 uppercase tracking-wider">
              ملاحظاتي
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              كل الملاحظات
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              ملاحظاتك مجمّعة حسب الفصل، مرتبة بالأحدث.
            </p>
          </div>
        </div>

        <NotesIndex />
      </main>
      <Footer />
    </>
  );
}
