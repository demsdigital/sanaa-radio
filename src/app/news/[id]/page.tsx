export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, ne, desc } from "drizzle-orm";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

  // أخبار ذات صلة
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
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(item.title + "\n" + shareUrl)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(shareUrl)}`;

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

        {/* Badge */}
        <div className="mb-5">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            📰 أخبار الإذاعة
          </span>
        </div>

        {/* عنوان */}
        <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
          {item.title}
        </h1>

        {/* ميتا */}
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
                <span className="font-medium">{item.sourceLabel}</span>
              )}
            </>
          )}
        </div>

        {/* صورة */}
        {item.imageUrl && (
          <figure className="mt-6 rounded-2xl border bg-white p-4 shadow-sm overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="mx-auto max-h-[320px] w-full object-cover rounded-xl"
            />
          </figure>
        )}

        {/* المحتوى */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8 space-y-6">

          {/* نص الخبر */}
          <div className="whitespace-pre-wrap text-lg leading-9 text-slate-700">
            {item.body}
          </div>

          {/* يوتيوب */}
          {youtubeId && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-black text-slate-900">▶ فيديو مرتبط</span>
              </div>
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

          {/* تغريدة */}
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

        {/* المشاركة */}
        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-slate-700 text-sm font-bold mb-4">شارك الخبر</div>
          <div className="flex items-center gap-3 flex-wrap">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L.057 23.714l5.997-1.573A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.359-.214-3.722.976.994-3.628-.234-.372A9.818 9.818 0 1112 21.818z"/></svg>
              واتساب
            </a>
            <a href={twitterHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              𝕏 تويتر
            </a>
            <button
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              🔗 نسخ الرابط
            </button>
          </div>
        </div>
      </article>

      {/* أخبار ذات صلة */}
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

      {/* Footer */}
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