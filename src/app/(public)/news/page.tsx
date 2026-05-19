import { db } from "@/db";
import { news } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "أرشيف الأخبار | إذاعة الجمهورية اليمنية",
  description: "أرشيف أخبار إذاعة الجمهورية اليمنية — البرنامج العام",
};

export default async function NewsArchivePage() {
  const allNews = await db.select().from(news).orderBy(desc(news.publishedAt));

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      <PageHero badge="📰 أرشيف" title="الأخبار" subtitle={allNews.length + " خبر منشور"} />

      {/* الأخبار */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {allNews.length === 0 ? (
          <div className="text-center py-20 text-slate-400">لا توجد أخبار بعد</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all group">

                {/* صورة */}
                {item.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden bg-slate-100">
                    <img src={item.imageUrl} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <span className="text-4xl opacity-40">📰</span>
                  </div>
                )}

                <div className="p-5">
                  {/* بيانات */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-slate-400 text-xs">
                      {new Date(item.publishedAt).toLocaleDateString("ar-YE", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </span>
                    {(item as any).sourceLabel && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                        {(item as any).sourceLabel}
                      </span>
                    )}
                    {(item as any).youtubeUrl && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">▶</span>
                    )}
                    {(item as any).tweetUrl && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">𝕏</span>
                    )}
                  </div>

                  {/* عنوان */}
                  <h2 className="text-slate-900 font-bold text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-3">
                    {item.title}
                  </h2>

                  {/* مقتطف */}
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>

                  <div className="mt-4 text-blue-600 text-xs font-bold">
                    اقرأ المزيد ←
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}