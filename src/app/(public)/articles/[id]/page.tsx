import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, Number(id)));

  if (!article) {
    return {
      title: "مقال غير موجود | إذاعة الجمهورية اليمنية",
    };
  }

  return {
    title: `${article.title} | إذاعة الجمهورية اليمنية`,

    description:
      article.excerpt ||
      article.body?.slice(0, 160),

    alternates: {
      canonical: `https://www.sanaaradio.org/articles/${id}`,
    },

    authors: [
      {
        name: article.authorName || "إذاعة الجمهورية اليمنية",
      },
    ],

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "article",
      locale: "ar_YE",
      url: `https://www.sanaaradio.org/articles/${id}`,
      siteName: "إذاعة الجمهورية اليمنية",
      title: article.title,
      description:
        article.excerpt ||
        article.body?.slice(0, 160),
      ...(article.imageUrl
        ? {
            images: [
              {
                url: article.imageUrl,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description:
        article.excerpt ||
        article.body?.slice(0, 160),
      ...(article.imageUrl
        ? {
            images: [article.imageUrl],
          }
        : {}),
    },
  };
}


export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
  if (!article || !article.published) notFound();

  // مقالات ذات صلة
  const related = await db.select().from(articles)
    .where(eq(articles.category, article.category))
    .orderBy(desc(articles.publishedAt))
    .limit(4);
  const filtered = related.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-white">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <Link href="/articles" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">الكتابات</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 text-sm line-clamp-1">{article.title}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* المقال */}
          <article className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {article.imageUrl && (
                <div className="w-full h-72 overflow-hidden">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover object-top" />
                </div>
              )}
              <div className="p-8">
                {/* تصنيف + تاريخ */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{article.category}</span>
                  <span className="text-slate-400 text-sm">
                    {new Date(article.publishedAt).toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>

                {/* العنوان */}
                <h1 className="text-slate-900 text-2xl md:text-3xl font-black leading-tight mb-4">{article.title}</h1>

                {/* الكاتب */}
                {article.authorName && (
                  <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">✍️</div>
                    <span className="text-slate-600 text-sm font-medium">{article.authorName}</span>
                  </div>
                )}

                {/* المقتطف */}
                {article.excerpt && (
                  <p className="text-slate-600 text-base leading-relaxed font-medium mb-6 bg-slate-50 rounded-xl p-4 border-r-4 border-slate-300">
                    {article.excerpt}
                  </p>
                )}

                {/* المحتوى */}
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base whitespace-pre-wrap text-justify">
                  {article.body}
                </div>
              </div>
            </div>

            {/* مقالات ذات صلة */}
            {filtered.length > 0 && (
              <div className="mt-8">
                <h2 className="text-slate-900 font-black text-lg mb-4">مقالات ذات صلة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filtered.map(a => (
                    <Link key={a.id} href={`/articles/${a.id}`}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                      {a.imageUrl && (
                        <div className="h-32 rounded-lg overflow-hidden mb-3">
                          <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover object-top" />
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mb-1">{a.category}</div>
                      <div className="text-slate-800 font-bold text-sm line-clamp-2">{a.title}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* سايدبار */}
          <aside className="w-full lg:w-56 flex-shrink-0 lg:sticky lg:top-20 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-slate-900 font-black text-sm mb-3 pb-2 border-b border-slate-100">معلومات المقال</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">التصنيف</span>
                  <span className="text-slate-700 font-medium">{article.category}</span>
                </div>
                {article.authorName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">الكاتب</span>
                    <span className="text-slate-700 font-medium">{article.authorName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">التاريخ</span>
                  <span className="text-slate-700 font-medium text-xs">
                    {new Date(article.publishedAt).toLocaleDateString("ar-YE")}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/articles"
              className="block bg-slate-800 text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
              ← كل الكتابات
            </Link>
          </aside>

        </div>
      </div>
    </div>
  );
}
