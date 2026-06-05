import { Bot } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { AssistantClient } from "@/components/assistant-client";

export const metadata = {
  title: "المساعد الذكي · أكاديمية الغزاوي",
  description: "اسأل أي سؤال واحصل على إجابة مبنية على محتوى الكتب",
};

export default function AssistantPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 flex items-start gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-royal-600 text-white flex items-center justify-center shadow-card shrink-0">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
              المساعد الذكي
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              اسأل، واحصل على جواب من الكتاب
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              لا يستخدم خدمات خارجية. الإجابات تُبنى محلياً من محتوى الكتب مع
              ذكر المصدر الأصلي.
            </p>
          </div>
        </div>

        <AssistantClient />
      </main>
      <Footer />
    </>
  );
}
