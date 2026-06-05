import { Globe, Heart, Shield, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "عن المنصة",
  description: "تعرّف على أكاديمية الغزاوي - منصة MBA العربية",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 mb-3">
          <Sparkles className="size-3.5" />
          عن المنصة
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
          منصة بُنيت بشغف
          <br />
          <span className="text-muted">لطلاب MBA العرب.</span>
        </h1>

        <div className="mt-10 prose prose-lg max-w-none text-foreground/90">
          <p className="text-lg leading-relaxed text-muted">
            أكاديمية الغزاوي هي منصة تعليمية رقمية متخصصة في برامج ماجستير إدارة الأعمال،
            تجمع بين الكتب الأصلية الكاملة، والملخصات الذكية بمستويات متعددة،
            وآلاف الأسئلة التدريبية، وبطاقات المصطلحات — كل ذلك بلغة عربية واضحة
            تحترم عقل القارئ ومستواه الأكاديمي.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {[
            {
              icon: Globe,
              title: "مجاناً، بلا حدود",
              desc: "كل المحتوى متاح بدون اشتراك في هذه المرحلة.",
            },
            {
              icon: Shield,
              title: "محتوى مفتوح",
              desc: "الكتب المستخدمة موزّعة مجاناً للأغراض التعليمية.",
            },
            {
              icon: Heart,
              title: "بناء بعناية",
              desc: "كل جزء من المنصة مصمم بمستوى احترافي عالٍ.",
            },
            {
              icon: Sparkles,
              title: "تحديثات مستمرة",
              desc: "محتوى جديد يُضاف بشكل دوري حتى اكتمال كل الكتب الخمسة.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-royal-50 to-cyan-50 ring-1 ring-cyan-100">
                <Icon className="size-4.5 text-royal-700" />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border/60 bg-gradient-to-br from-navy/[0.02] to-royal-50/30 p-8">
          <h2 className="text-2xl font-bold text-foreground">رؤيتنا</h2>
          <p className="mt-3 text-muted leading-relaxed">
            أن نُتيح لكل طالب MBA عربي فرصة الدراسة بأدوات احترافية بمستوى أفضل المنصات
            العالمية، بلغته الأم، وبجودة لا يضطر معها للبحث عن مصادر باللغة الإنجليزية.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
