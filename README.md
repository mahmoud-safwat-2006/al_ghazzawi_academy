# أكاديمية الغزاوي | Al-Ghazzawi Academy

> منصة تعليمية متكاملة لطلاب الماجستير في إدارة الأعمال — كتب، ملخصات، أسئلة، وفلاش كاردز.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

## ✨ الميزات

- 📖 **كتب MBA كاملة** — خمسة كتب أصلية باللغة العربية
- 📝 **ملخصات بثلاثة مستويات** — مكثف، عادي، مفصّل
- ❓ **بنك أسئلة** — أكثر من 30 سؤالاً متدرّجاً لكل فصل
- 🎴 **فلاش كاردز ذكية** — مصطلحات عربية وإنجليزية
- 📊 **تتبع التقدم** — لوحة معلومات تفاعلية
- 🌐 **PWA** — يعمل بدون إنترنت بعد التثبيت

## 🛠️ التقنيات

- **الإطار:** Next.js 16 (App Router) + React 19
- **اللغة:** TypeScript 5
- **التصميم:** Tailwind CSS 4
- **الأيقونات:** Lucide React
- **الأنيميشن:** Motion (Framer Motion)
- **الاستضافة:** Vercel

## 🚀 التشغيل المحلي

```bash
npm install
npm run dev
```

ثم افتح [http://localhost:3000](http://localhost:3000).

## 📦 الإنتاج

```bash
npm run build
npm start
```

## 📂 بنية المشروع

```
src/
├── app/              # صفحات App Router
│   ├── about/        # عن المنصة
│   ├── books/        # المكتبة
│   │   └── hr/       # كتاب الموارد البشرية
│   ├── layout.tsx    # التخطيط الرئيسي (RTL + الخطوط)
│   ├── manifest.ts   # PWA manifest
│   └── page.tsx      # الصفحة الرئيسية
├── components/       # المكونات المشتركة
└── lib/              # الأدوات المساعدة
```

## 📜 الترخيص

محتوى الكتب مفتوح الوصول وموزّع مجاناً للأغراض التعليمية.

---

صُمم وطُوّر بعناية لطلاب MBA العرب.
