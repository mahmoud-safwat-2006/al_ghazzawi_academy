import type { Metadata, Viewport } from "next";
import { Tajawal, Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import { ThemeProvider } from "@/components/theme-provider";
import { AchievementWatcher } from "@/components/achievement-watcher";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name.ar} | ${SITE.name.en}`,
    template: `%s | ${SITE.name.ar}`,
  },
  description: SITE.description.ar,
  keywords: [
    "MBA",
    "ماجستير إدارة الأعمال",
    "تعليم عربي",
    "الموارد البشرية",
    "التسويق",
    "الإدارة",
    "أكاديمية الغزاوي",
  ],
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: SITE.url,
    title: `${SITE.name.ar} | ${SITE.name.en}`,
    description: SITE.description.ar,
    siteName: SITE.name.ar,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0e27" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {children}
          <AchievementWatcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
