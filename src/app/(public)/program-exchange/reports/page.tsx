import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeReports } from "@/db/schema";
import ReportsGallery from "@/components/exchange/ReportsGallery";

export const metadata: Metadata = {
  title: "التقارير والصور الرسمية",
  description:
    "أرشيف التقارير والصور الرسمية الخاصة بالتبادل البرامجي والإخباري لإذاعة الجمهورية اليمنية.",
};

export default async function ExchangeReportsPage() {
  const reports = await db
    .select()
    .from(exchangeReports)
    .where(eq(exchangeReports.active, true))
    .orderBy(asc(exchangeReports.sortOrder));

  return (
    <main className="bg-slate-50 text-slate-900" dir="rtl">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <span className="inline-flex mb-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
            📑 أرشيف التقارير والصور
          </span>

          <h1 className="text-4xl md:text-5xl font-black">
            التقارير والصور الرسمية
          </h1>

          <p className="mt-5 text-blue-100 text-lg md:text-xl leading-9 max-w-3xl">
            أرشيف مرئي ووثائقي للتقارير والاجتماعات والتكريمات والإحصائيات
            المرتبطة بالتبادل البرامجي والإخباري العربي.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        {reports.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center text-slate-500">
            لا توجد تقارير منشورة حاليًا.
          </div>
        ) : (
          <ReportsGallery reports={reports} />
        )}
      </section>
    </main>
  );
}
