import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StructuredData from "./structured-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sanaaradio.org"),

  title: {
    default: "إذاعة الجمهورية اليمنية — البرنامج العام",
    template: "%s | إذاعة الجمهورية اليمنية",
  },

  description:
    "إذاعة الجمهورية اليمنية — البرنامج العام، الصوت الرسمي من صنعاء، أخبار وبرامج وتغطيات وإذاعة وطنية جامعة.",

  keywords: [
    "إذاعة الجمهورية اليمنية",
    "إذاعة صنعاء",
    "Yemen Radio",
    "البرنامج العام",
    "راديو اليمن",
    "أخبار اليمن",
    "إذاعة رسمية",
  ],

  authors: [{ name: "إذاعة الجمهورية اليمنية" }],
  creator: "إذاعة الجمهورية اليمنية",
  publisher: "إذاعة الجمهورية اليمنية",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_YE",
    url: "https://www.sanaaradio.org",
    siteName: "إذاعة الجمهورية اليمنية",
    title: "إذاعة الجمهورية اليمنية — البرنامج العام",
    description:
      "الموقع الرسمي لإذاعة الجمهورية اليمنية — البرنامج العام.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "إذاعة الجمهورية اليمنية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "إذاعة الجمهورية اليمنية — البرنامج العام",
    description:
      "الموقع الرسمي لإذاعة الجمهورية اليمنية.",
    images: ["/og.jpg"],
  },

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="pt-9 overflow-x-hidden">
        <StructuredData />
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
