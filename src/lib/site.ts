export const SITE = {
  name: {
    ar: "أكاديمية الغزاوي",
    en: "Al-Ghazzawi Academy",
  },
  tagline: {
    ar: "منصة تعليمية متكاملة لطلاب الماجستير في إدارة الأعمال",
    en: "An integrated learning platform for MBA students",
  },
  description: {
    ar: "ادرس MBA باللغة العربية: كتب أصلية، ملخصات بثلاثة مستويات، آلاف الأسئلة، فلاش كاردز، وتتبع تقدمك.",
    en: "Study MBA in Arabic: original books, three-level summaries, thousands of questions, flashcards, and progress tracking.",
  },
  url: "https://al-ghazzawi-academy.vercel.app",
  author: {
    name: "Akram",
    url: "https://github.com/Akramalobaid",
  },
} as const;

export const BOOKS = [
  {
    slug: "hr",
    title_ar: "إدارة الموارد البشرية",
    title_en: "Human Resource Management",
    chapters: 14,
    status: "ready",
    color: "from-blue-500 to-cyan-500",
  },
  {
    slug: "marketing",
    title_ar: "التسويق",
    title_en: "Marketing",
    chapters: 14,
    status: "ready",
    color: "from-purple-500 to-pink-500",
  },
  {
    slug: "management",
    title_ar: "مبادئ الإدارة",
    title_en: "Management Principles",
    chapters: 12,
    status: "ready",
    color: "from-orange-500 to-red-500",
  },
  {
    slug: "economics",
    title_ar: "الاقتصاد الإداري",
    title_en: "Managerial Economics",
    chapters: 0,
    status: "coming",
    color: "from-emerald-500 to-teal-500",
  },
  {
    slug: "research",
    title_ar: "مناهج البحث في الأعمال",
    title_en: "Business Research Methods",
    chapters: 0,
    status: "coming",
    color: "from-amber-500 to-yellow-500",
  },
] as const;
