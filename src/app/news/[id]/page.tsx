export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, ne, desc } from "drizzle-orm";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareButtons from "./ShareButtons";

type Props = { params: Promise<{ id: string }> };

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/^.*(youtu\.be\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2]?.length === 11 ? match[2] : null;
}

function hasTweet(url: string | null) {
  return !!url && /(twitter|x)\.com\/\w+\/status\/\d+/.test(url);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [item] = await db.select().from(news).where(eq(news.id, Number(id)));
  if (!item) return { title: "خبر غير موجود | إذاعة الجمهورية اليمنية" };
  return {
    title: `${item.title} | إذاعة الجمهورية اليمنية`,
    description: item.body?.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.body?.slice(0, 160),
      type: "article",
      publishedTime: item.publishedAt?.toISOString(),
      ...(item.imageUrl ? { images: [{ url: item.imageUrl }] } : {}),
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = Number(id);
  if (Number.isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));
  if (!item) notFound();

  const related = await db
    .select().from(news)
    .where(ne(news.id, newsId))
    .orderBy(desc(news.publishedAt))
    .limit(3);

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const showTweet = hasTweet(item.tweetUrl);
  const shareUrl = `${process.env.NEXT_PUBLIC_URL}/news/${newsId}`;

  const publishedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ar-YE", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {showTweet && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
      )}

      {/* ===== شريط التنقل ===== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="إذاعة الجمهورية اليمنية" className="w-8 h-8 object-contain" />
            <div className="hidden sm:block">
              <div className="text-slate-900 text-sm font-black leading-tight">إذاعة الجمهورية اليمنية</div>
              <div className="text-blue-600 text-xs">البرنامج العام</div>
            </div>
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">الرئيسية</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 px-3 py-1.5">الأخبار</span>
          </div>
        </div>
      </nav>

      {/* ===== صورة الغلاف — عريضة بلا هوامش ===== */}
      {item.imageUrl && (
        <div className="w-full bg-slate-900" style={{ maxHeight: "480px", overflow: "hidden" }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full object-cover object-center"
            style={{ maxHeight: "480px", display: "block" }}
          />
        </div>
      )}

      {/* ===== المحتوى الرئيسي ===== */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* تصنيف */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            📰 أخبار
          </span>
        </div>

        {/* عنوان */}
        <h1 className="text-slate-900 text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-6">
          {item.title}
        </h1>

        {/* بيانات الخبر */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-6 mb-8 border-b-2 border-slate-100 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">ي</span>
            فريق التحرير
          </span>
          {publishedDate && (
            <span className="flex items-center gap-1">
              <span>📅</span>
              {publishedDate}
            </span>
          )}
          {item.sourceLabel && (
            <span className="flex items-center gap-1">
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold">
                  المصدر: {item.sourceLabel}
                </a>
              ) : (
                <span className="font-semibold text-slate-600">المصدر: {item.sourceLabel}</span>
              )}
            </span>
          )}
        </div>

        {/* نص الخبر */}
        <div
          className="text-slate-700 text-lg leading-[2] mb-10"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {item.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i} className="mb-5">{para}</p>
          ))}
        </div>

        {/* فيديو يوتيوب */}
        {youtubeId && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-red-500 rounded-full" />
              <span className="text-slate-900 font-bold text-base">فيديو مرتبط</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="فيديو مرتبط"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* تغريدة */}
        {showTweet && item.tweetUrl && (
          <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-slate-900 rounded-full" />
              <span className="text-slate-900 font-bold text-base">𝕏 منشور مرتبط</span>
            </div>
            <blockquote className="twitter-tweet" data-lang="ar" data-theme="light">
              <a href={item.tweetUrl} target="_blank" rel="noopener noreferrer">
                عرض المنشور على منصة X
              </a>
            </blockquote>
          </div>
        )}

        {/* المشاركة */}
        <ShareButtons title={item.title} url={shareUrl} />
      </div>

      {/* ===== أخبار ذات صلة ===== */}
      {related.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-slate-900 text-xl font-black">أخبار ذات صلة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all group">
                  {n.imageUrl ? (
                    <div className="w-full h-44 overflow-hidden bg-slate-100">
                      <img src={n.imageUrl} alt={n.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-3xl">
                      📰
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-slate-400 text-xs mb-2">
                      {new Date(n.publishedAt).toLocaleDateString("ar-YE")}
                    </div>
                    <div className="text-slate-900 font-bold text-sm leading-relaxed group-hover:text-blue-600 transition-colors line-clamp-3">
                      {n.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== فوتر ===== */}
      <footer className="bg-slate-900 text-white px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="شعار" className="w-10 h-10 object-contain opacity-80" />
            <div>
              <div className="text-white font-black">إذاعة الجمهورية اليمنية</div>
              <div className="text-slate-400 text-sm">البرنامج العام • Yemen Radio</div>
            </div>
          </div>
          <div className="text-slate-500 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}