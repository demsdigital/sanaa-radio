import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="pt-9 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
