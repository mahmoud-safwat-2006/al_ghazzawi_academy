import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أكاديمية الغزاوي | Al-Ghazzawi Academy",
    short_name: "أكاديمية الغزاوي",
    description:
      "منصة تعليمية متكاملة لطلاب الماجستير في إدارة الأعمال — كتب، ملخصات، أسئلة، وفلاش كاردز.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0a0e27",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    categories: ["education", "books", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
