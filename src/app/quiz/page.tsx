import { Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { QuizBuilder } from "@/components/quiz-builder";

export const metadata = {
  title: "مولّد كويز مخصص · أكاديمية الغزاوي",
  description: "اختر الفصول والصعوبة وعدد الأسئلة وابني كويز خاصاً بك",
};

export default function CustomQuizPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-royal-600 to-cyan-500 text-white flex items-center justify-center shadow-card shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
              كويز مخصص
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              صمّم كويزك الخاص
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              اختر الفصول التي تريد التركيز عليها، مستوى الصعوبة، وعدد الأسئلة.
              يتم خلط الأسئلة عشوائياً في كل مرة.
            </p>
          </div>
        </div>

        <QuizBuilder />
      </main>
      <Footer />
    </>
  );
}
