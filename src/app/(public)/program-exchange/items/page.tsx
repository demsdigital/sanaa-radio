import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeItems } from "@/db/schema";

export const metadata: Metadata = {
  title: "مواد التبادل البرامجي",
  description:
    "أرشيف مواد التبادل البرامجي والإخباري لإذاعة الجمهورية اليمنية، ويشمل البرامج والمواد الصوتية والتقارير المتاحة ضمن منصة التبادل.",
};

export default async function ExchangeItemsPage() {
  const items = await db
    .select()
    .from(exchangeItems)
    .where(eq(exchangeItems.published, true))
    .orderBy(
      desc(exchangeItems.featured),
      asc(exchangeItems.sortOrder),
      desc(exchangeItems.createdAt)
    );

  return (
    <main className="bg-slate-50 text-slate-900" dir="rtl">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <span className="inline-flex mb-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
            🎙️ أرشيف المواد المتبادلة
          </span>

          <h1 className="text-4xl md:text-5xl font-black">
            مواد التبادل البرامجي
          </h1>

          <p className="mt-5 text-blue-100 text-lg md:text-xl leading-9 max-w-3xl">
            مكتبة المواد البرامجية والإخبارية المتاحة ضمن منصة التبادل البرامجي
            لإذاعة الجمهورية اليمنية.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        {items.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center text-slate-500">
            لا توجد مواد منشورة حاليًا.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-56 object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-56 bg-slate-100 flex items-center justify-center text-6xl">
                    🎙️
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                      {item.category}
                    </span>

                    {item.featured && (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black">
                        مميزة
                      </span>
                    )}

                    {item.downloadable && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
                        قابلة للتحميل
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-black leading-tight">
                    {item.title}
                  </h2>

                  {item.producer && (
                    <div className="mt-2 text-sm text-slate-500">
                      الجهة المنتجة: {item.producer}
                    </div>
                  )}

                  {item.description && (
                    <p className="mt-4 text-slate-600 leading-8">
                      {item.description}
                    </p>
                  )}

                  {item.audioUrl && (
                    <audio
                      controls
                      src={item.audioUrl}
                      className="w-full mt-5"
                    />
                  )}

                  <div className="flex gap-3 flex-wrap mt-5">
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                      >
                        عرض الملف
                      </a>
                    )}

                    {item.downloadable && item.audioUrl && (
                      <a
                        href={item.audioUrl}
                        download
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                      >
                        تحميل الصوت
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
