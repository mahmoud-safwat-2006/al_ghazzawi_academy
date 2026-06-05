import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { WelcomeForm } from "@/components/welcome-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description:
    "سجّل اسمك للبدء في أكاديمية الغزاوي، وفعّل حسابك بكود التفعيل للوصول الكامل لكل الفصول.",
};

export default function WelcomePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center">
          <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-royal-600 to-cyan-600 text-white flex items-center justify-center shadow-card">
            <GraduationCap className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black text-foreground">
            مرحباً بك في أكاديمية الغزاوي
          </h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            سجّل اسمك للبدء. تستطيع تصفّح كل الكتب والفصول، والتفاعل مجاناً مع
            الفصل التجريبي. لديك كود تفعيل؟ أدخله لفتح كل الفصول.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <WelcomeForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
