import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeItems, settings } from "@/db/schema";

export const metadata: Metadata = {
  title: "مواد التبادل البرامجي",
  description:
    "أرشيف مواد التبادل البرامجي والإخباري لإذاعة الجمهورية اليمنية، ويشمل البرامج والمواد الصوتية والتقارير المتاحة ضمن منصة التبادل.",
};

export default async function ExchangeItemsPage() {
  const settingRows = await db.select().from(settings);

  const settingMap = Object.fromEntries(
    settingRows.map((row) => [row.key, row.value])
  );

  const exchangeEnabled = settingMap.exchange_enabled !== "false";

  const items = await db
    .select()
    .from(exchangeItems)
    .where(eq(exchangeItems.published, true))
    .orderBy(
      desc(exchangeItems.featured),
      asc(exchangeItems.sortOrder),
      desc(exchangeItems.createdAt)
    );

  if (!exchangeEnabled) {
    return (
      <main className="bg-slate-50 text-slate-900" dir="rtl">
        <section className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm">
            <div className="text-5xl mb-5">📡</div>
            <h1 className="text-3xl font-black text-slate-900">
              صفحة مواد التبادل غير متاحة حاليًا
            </h1>
          </div>
        </section>
      </main>
    );
  }

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
                    className="w-full h-40 md:h-56 object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-40 md:h-56 bg-slate-100 flex items-center justify-center text-5xl md:text-6xl">
                    🎙️
                  </div>
                )}

                <div className="p-6 flex flex-col">
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

                  <h2 className="text-lg md:text-2xl font-black leading-snug break-words">
                    {item.title}
                  </h2>

                  {item.producer && (
                    <div className="mt-2 text-sm text-slate-500">
                      الجهة المنتجة: {item.producer}
                    </div>
                  )}

                  {item.description && (
                    <p className="mt-3 text-slate-600 leading-7 text-sm md:text-base">
                      {item.description}
                    </p>
                  )}

                  {item.audioUrl && (
                    <div className="mt-6">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
                          <span>🎧</span>
                          <span>الاستماع للمادة</span>
                        </div>

                        <audio
                          controls
                          src={item.audioUrl}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 mt-6">                    {item.downloadable && item.audioUrl && (
                      <a
                        href={`/api/download/audio?url=${encodeURIComponent(item.audioUrl)}`}
                        download
                        className="w-full text-center px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors"
                      >
                        ⬇ تحميل MP3
                      </a>
                    )}

                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        className="w-full text-center px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                      >
                        📄 عرض الملف المرفق
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
