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

    alternates: {
      canonical: `https://www.sanaaradio.org/news/${id}`,
    },

    authors: [{ name: "إذاعة الجمهورية اليمنية" }],

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: item.title,
      description: item.body?.slice(0, 160),
      url: `https://www.sanaaradio.org/news/${id}`,
      siteName: "إذاعة الجمهورية اليمنية",
      locale: "ar_YE",
      type: "article",
      publishedTime: item.publishedAt?.toISOString(),
      ...(item.imageUrl ? { images: [{ url: item.imageUrl }] } : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.body?.slice(0, 160),
      ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
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
    .limit(4);

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const showTweet = hasTweet(item.tweetUrl);
  const shareUrl = `${process.env.NEXT_PUBLIC_URL}/news/${newsId}`;

  const publishedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ar-YE", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {showTweet && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
      )}

      {/* Nav */}

      {/* Layout رئيسي: مقال + sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ===== عمود المقال ===== */}
          <article className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 overflow-hidden">

            {/* الصورة كاملة بلا قص */}
            {item.imageUrl && (
              <div className="relative w-full" style={{ background: "#f1f5f9", borderBottom: "3px solid #2563eb" }}>
                <div style={{ paddingBottom: "56.25%", position: "relative" }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      padding: "16px",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">

              {/* تصنيف */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  📰 أخبار
                </span>
              </div>

              {/* العنوان */}
              <h1 className="text-slate-900 text-2xl md:text-3xl font-black leading-tight mb-5">
                {item.title}
              </h1>

              {/* بيانات الخبر */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-5 mb-6 border-b border-slate-100 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">ي</span>
                  فريق التحرير
                </span>
                {publishedDate && (
                  <span>📅 {publishedDate}</span>
                )}
                {item.sourceLabel && (
                  <span>
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
              <div className="text-slate-700 text-[17px] leading-[2.1] mb-8 text-justify"
                >
                {item.body.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="mb-5">{para}</p>
                ))}
              </div>

              {/* فيديو يوتيوب */}
              {youtubeId && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-red-500 rounded-full" />
                    <span className="text-slate-900 font-bold">فيديو مرتبط</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
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
                <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-slate-900 rounded-full" />
                    <span className="text-slate-900 font-bold">𝕏 منشور مرتبط</span>
                  </div>
                  <blockquote className="twitter-tweet" data-lang="ar" data-theme="light">
                    <a href={item.tweetUrl} target="_blank" rel="noopener noreferrer">
                      عرض المنشور على منصة X
                    </a>
                  </blockquote>
                </div>
              )}

              {/* أزرار المشاركة */}
              <ShareButtons title={item.title} url={shareUrl} />

            </div>
          </article>

          {/* ===== Sidebar ===== */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">

            {/* عنوان الـ sidebar */}
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <h2 className="text-slate-900 font-black text-base">أخبار أخرى</h2>
            </div>

            {related.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all group flex gap-3 p-3">
                {n.imageUrl ? (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img src={n.imageUrl} alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
                    📰
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-400 text-xs mb-1">
                    {new Date(n.publishedAt).toLocaleDateString("ar-YE")}
                  </div>
                  <div className="text-slate-900 font-bold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                    {n.title}
                  </div>
                </div>
              </Link>
            ))}

            {/* بطاقة الإذاعة */}
            <div className="bg-blue-600 rounded-xl p-5 text-white">
              <img src="/logo.png" alt="شعار" className="w-12 h-12 object-contain mb-3 opacity-90" />
              <div className="font-black mb-1">إذاعة الجمهورية اليمنية</div>
              <div className="text-blue-100 text-sm mb-4">البرنامج العام • منذ 1947</div>
              <Link href="/"
                className="block text-center bg-white text-blue-700 font-bold text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors">
                الرئيسية
              </Link>
            </div>

          </aside>

        </div>
      </div>

      {/* Footer */}
    </div>
  );
}