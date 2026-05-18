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
    .select()
    .from(news)
    .where(ne(news.id, newsId))
    .orderBy(desc(news.publishedAt))
    .limit(3);

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const showTweet = hasTweet(item.tweetUrl);
  const publishedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ar-YE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const shareUrl = `${process.env.NEXT_PUBLIC_URL}/news/${newsId}`;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {showTweet && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-9 h-9 object-contain" />
            <div>
              <div className="text-slate-900 text-sm font-black leading-tight">إذاعة الجمهورية اليمنية</div>
              <div className="text-blue-600 text-xs font-semibold">البرنامج العام</div>
            </div>
          </div>
          <Link href="/#news" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            ← الأخبار
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-8">

        <div className="mb-5">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            📰 أخبار الإذاعة
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
          {item.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3 border-y border-slate-200 py-3 text-sm text-slate-500">
          <span>فريق التحرير</span>
          {publishedDate && <><span>•</span><span>{publishedDate}</span></>}
          {item.sourceLabel && (
            <>
              <span>•</span>
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium">
                  المصدر: {item.sourceLabel}
                </a>
              ) : (
                <span className="font-medium">المصدر: {item.sourceLabel}</span>
              )}
            </>
          )}
        </div>

        {item.imageUrl && (
          <figure className="mt-6 rounded-2xl overflow-hidden border shadow-sm">
            <img src={item.imageUrl} alt={item.title} className="w-full max-h-[360px] object-cover" />
          </figure>
        )}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8 space-y-8">
          <div className="whitespace-pre-wrap text-lg leading-9 text-slate-700">
            {item.body}
          </div>

          {youtubeId && (
            <div>
              <div className="text-base font-black text-slate-900 mb-3">▶ فيديو مرتبط</div>
              <div className="overflow-hidden rounded-2xl border bg-black">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {showTweet && item.tweetUrl && (
            <div className="rounded-2xl border bg-slate-50 p-5">
              <h2 className="mb-3 text-base font-black">𝕏 منشور مرتبط</h2>
              <blockquote className="twitter-tweet" data-lang="ar">
                <a href={item.tweetUrl} target="_blank" rel="noopener noreferrer">
                  عرض المنشور على منصة X
                </a>
              </blockquote>
            </div>
          )}
        </section>

        {/* client component للمشاركة */}
        <ShareButtons title={item.title} url={shareUrl} />

      </article>

      {related.length > 0 && (
        <section className="border-t bg-white mt-4 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-slate-900 text-xl font-black mb-6">أخبار أخرى</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all group block">
                  {n.imageUrl && (
                    <img src={n.imageUrl} alt={n.title}
                      className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-100" />
                  )}
                  <div className="text-slate-400 text-xs mb-2">
                    {new Date(n.publishedAt).toLocaleDateString("ar-YE")}
                  </div>
                  <div className="text-slate-900 font-bold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                    {n.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-slate-900 text-white px-8 py-10">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="شعار" className="w-10 h-10 object-contain opacity-80" />
            <div>
              <div className="text-white font-black text-sm">إذاعة الجمهورية اليمنية</div>
              <div className="text-slate-400 text-xs">البرنامج العام • Yemen Radio</div>
            </div>
          </div>
          <div className="text-slate-600 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </main>
  );
}