import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "إذاعة الجمهورية اليمنية — البرنامج العام",
  description: "إذاعة الجمهورية اليمنية — البرنامج العام، الصوت الرسمي من صنعاء",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="pt-9">
        {children}
      </body>
    </html>
  );
}
