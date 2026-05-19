import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
export const metadata: Metadata = {
  title: "الكتابات | إذاعة الجمهورية اليمنية",
  description: "مقالات وكتابات إذاعة الجمهورية اليمنية — رأي، تحليل، ثقافة وتراث.",
};
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES = ["الكل", "رأي", "تحليل", "ثقافة", "تراث", "متنوع"];

type Props = { searchParams: Promise<{ cat?: string }> };

export default async function ArticlesPage({ searchParams }: Props) {
  const { cat } = await searchParams;

  const all = await db.select().from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.publishedAt));

  const filtered = cat && cat !== "الكل"
    ? all.filter(a => a.category === cat)
    : all;

  // إحصاء لكل تصنيف
  const counts: Record<string, number> = { "الكل": all.length };
  CATEGORIES.slice(1).forEach(c => {
    counts[c] = all.filter(a => a.category === c).length;
  });

  // أحدث 5 للسايدبار
  const recent = all.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero */}
      <PageHero badge="✍️ نافذة كتابات" title="الكتابات والمقالات" subtitle="رأي • تحليل • ثقافة • تراث" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* المقالات — العمود الرئيسي */}
          <div className="flex-1 min-w-0">
            {/* فلتر التصنيفات */}
            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORIES.map(c => (
                <Link key={c} href={c === "الكل" ? "/articles" : `/articles?cat=${c}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    (c === "الكل" && !cat) || cat === c
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}>
                  {c}
                  <span className="mr-1 text-xs opacity-60">({counts[c] || 0})</span>
                </Link>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="text-4xl mb-3">✍️</div>
                <div className="text-slate-400">لا توجد مقالات في هذا التصنيف</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((a, idx) => (
                  <article key={a.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all group flex gap-0">
                    {/* صورة */}
                    {a.imageUrl && (
                      <div className="w-48 flex-shrink-0 overflow-hidden">
                        <img src={a.imageUrl} alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-5 flex-1 min-w-0">
                      {/* تصنيف + تاريخ */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{a.category}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(a.publishedAt).toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>
                      {/* عنوان */}
                      <Link href={`/articles/${a.id}`}
                        className="block text-slate-900 font-black text-lg leading-snug mb-2 hover:text-slate-700 transition-colors line-clamp-2">
                        {a.title}
                      </Link>
                      {/* مقتطف */}
                      {a.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{a.excerpt}</p>
                      )}
                      {/* كاتب + رابط */}
                      <div className="flex items-center justify-between">
                        {a.authorName && (
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <span>✍️</span> {a.authorName}
                          </span>
                        )}
                        <Link href={`/articles/${a.id}`}
                          className="text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors">
                          اقرأ المزيد ←
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* السايدبار — العمود الأيسر */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-5 lg:sticky lg:top-20">

            {/* أحدث المقالات */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-slate-900 font-black text-sm mb-4 pb-3 border-b border-slate-100">أحدث الكتابات</h3>
              <div className="space-y-3">
                {recent.map(a => (
                  <Link key={a.id} href={`/articles/${a.id}`}
                    className="block group">
                    <div className="text-slate-800 text-sm font-medium leading-snug group-hover:text-slate-600 transition-colors line-clamp-2">{a.title}</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {new Date(a.publishedAt).toLocaleDateString("ar-YE", { month: "short", day: "numeric" })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* التصنيفات */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-slate-900 font-black text-sm mb-4 pb-3 border-b border-slate-100">التصنيفات</h3>
              <div className="space-y-2">
                {CATEGORIES.slice(1).map(c => (
                  <Link key={c} href={`/articles?cat=${c}`}
                    className="flex items-center justify-between group">
                    <span className="text-slate-600 text-sm group-hover:text-slate-900 transition-colors">{c}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{counts[c] || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* رابط الأرشيف الكامل */}
            <Link href="/articles"
              className="block bg-slate-800 text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
              كل الكتابات
            </Link>
          </aside>

        </div>
      </div>
    </div>
  );
}
