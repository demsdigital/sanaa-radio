import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RichTextContent from "@/components/RichTextContent";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function isHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, Number(id)));
  if (!article) return { title: "مقال غير موجود | إذاعة الجمهورية اليمنية" };

  const description =
    article.metaDescription ||
    article.excerpt ||
    (isHtml(article.body) ? plainText(article.body).slice(0, 160) : article.body?.slice(0, 160));

  return {
    title: `${article.title} | إذاعة الجمهورية اليمنية`,
    description,
    alternates: { canonical: `https://www.sanaaradio.org/articles/${id}` },
    authors: [{ name: article.authorName || "إذاعة الجمهورية اليمنية" }],
    keywords: article.tags ? article.tags.split(",").map(t => t.trim()) : undefined,
    robots: { index: true, follow: true },
    openGraph: {
      type: "article", locale: "ar_YE",
      url: `https://www.sanaaradio.org/articles/${id}`,
      siteName: "إذاعة الجمهورية اليمنية",
      title: article.title, description,
      ...(article.imageUrl ? { images: [{ url: article.imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title: article.title, description,
      ...(article.imageUrl ? { images: [article.imageUrl] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
  if (!article || !article.published) notFound();

  const related = await db.select().from(articles)
    .where(eq(articles.category, article.category))
    .orderBy(desc(articles.publishedAt))
    .limit(4);
  const filtered = related.filter(a => a.id !== article.id).slice(0, 3);

  const tags = article.tags ? article.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const bodyIsHtml = isHtml(article.body);

  const publishedDate = new Date(article.publishedAt).toLocaleDateString("ar-YE", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 px-6 py-3 flex items-center gap-3 bg-white text-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <Link href="/articles" className="text-blue-600 hover:text-blue-700 transition-colors">الكتابات</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 truncate max-w-xs">{article.title}</span>
      </nav>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ المقال الرئيسي ═══ */}
          <article className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              <div className="p-6 md:p-10">

                {/* هيدر: تصنيف + تاريخ + عنوان + كاتب — مع صورة جانبية */}
                <div className="flex items-start gap-5 mb-5">

                  {/* المحتوى الرئيسي */}
                  <div className="flex-1 min-w-0">
                    {/* تصنيف + تاريخ + وسوم */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-slate-400 text-sm">{publishedDate}</span>
                      {tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* العنوان */}
                    <h1 className="text-slate-900 text-2xl md:text-3xl lg:text-4xl font-black leading-snug mb-4">
                      {article.title}
                    </h1>

                    {/* الكاتب */}
                    {article.authorName && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                          ✍️
                        </div>
                        <div>
                          <div className="text-slate-800 text-sm font-semibold">{article.authorName}</div>
                          <div className="text-slate-400 text-xs">كاتب</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* صورة المقال — بطاقة صغيرة أنيقة */}
                  {article.imageUrl && (
                    <div className="hidden sm:block flex-shrink-0 w-36 h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50 mt-1">
                      <img
                        src={article.imageUrl}
                        alt={article.authorName || article.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* فاصل */}
                <div className="border-b border-slate-100 mb-6" />

                {/* المقتطف */}
                {article.excerpt && (
                  <p className="text-slate-600 text-base leading-relaxed font-medium mb-7 bg-slate-50 rounded-xl px-5 py-4 border-r-4 border-blue-400">
                    {article.excerpt}
                  </p>
                )}

                {/* المحتوى — منطقة نص مضيّقة للقراءة */}
                <div className="max-w-[900px] mx-auto">
                  {bodyIsHtml ? (
                    <RichTextContent html={article.body} />
                  ) : (
                    <div className="text-slate-700 leading-loose text-base whitespace-pre-wrap text-justify">
                      {article.body}
                    </div>
                  )}
                  <ShareButtons
                    url={`https://www.sanaaradio.org/articles/${article.id}`}
                    title={article.title}
                  />
                </div>

              </div>
            </div>

            {/* مقالات ذات صلة */}
            {filtered.length > 0 && (
              <div className="mt-8">
                <h2 className="text-slate-900 font-black text-lg mb-4">مقالات ذات صلة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filtered.map(a => (
                    <Link key={a.id} href={`/articles/${a.id}`}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
                      {a.imageUrl && (
                        <div className="h-36 rounded-lg overflow-hidden mb-3 bg-slate-100">
                          <img src={a.imageUrl} alt={a.title}
                            className="w-full h-full object-contain object-top bg-white" />
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mb-1">{a.category}</div>
                      <div className="text-slate-800 font-bold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* ═══ السايدبار ═══ */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-20 space-y-4">

            {/* بطاقة معلومات المقال */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-slate-900 font-black text-sm mb-4 pb-3 border-b border-slate-100">
                معلومات المقال
              </h3>
              <div className="space-y-4">
                {/* التصنيف */}
                <div>
                  <div className="text-xs text-slate-400 mb-1">التصنيف</div>
                  <span className="inline-block text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>

                {/* الكاتب */}
                {article.authorName && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">الكاتب</div>
                    <div className="text-sm font-semibold text-slate-800 flex items-start gap-1.5">
                      <span className="text-base flex-shrink-0">✍️</span>
                      <span className="break-words">{article.authorName}</span>
                    </div>
                  </div>
                )}

                {/* التاريخ */}
                <div>
                  <div className="text-xs text-slate-400 mb-1">تاريخ النشر</div>
                  <div className="text-sm text-slate-700 font-medium">{publishedDate}</div>
                </div>

                {/* الوسوم */}
                {tags.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1.5">الوسوم</div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* زر العودة */}
            <Link href="/articles"
              className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
              <span>←</span>
              <span>كل الكتابات</span>
            </Link>

            {/* بطاقة الإذاعة */}
            <div className="bg-blue-600 rounded-xl p-5 text-white">
              <img src="/logo.png" alt="شعار" className="w-10 h-10 object-contain mb-3 opacity-90" />
              <div className="font-black mb-0.5 text-sm">إذاعة الجمهورية اليمنية</div>
              <div className="text-blue-100 text-xs mb-3">البرنامج العام • منذ 1947</div>
              <Link href="/"
                className="block text-center bg-white text-blue-700 font-bold text-xs py-2 rounded-lg hover:bg-blue-50 transition-colors">
                الرئيسية
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
