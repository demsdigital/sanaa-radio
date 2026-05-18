export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2]?.length === 11 ? match[2] : null;
}

function hasTweet(url: string | null) {
  return !!url && /(twitter|x)\.com\/\w+\/status\/\d+/.test(url);
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = Number(id);

  if (Number.isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));
  if (!item) notFound();

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const showTweet = hasTweet(item.tweetUrl);
  const publishedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ar-YE")
    : "";

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {showTweet && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
      )}

      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/#news" className="text-sm font-bold text-blue-700 hover:underline">
            ← العودة للرئيسية
          </Link>
          <span className="text-sm text-slate-500">إذاعة الجمهورية اليمنية</span>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-7">
        <div className="mb-4">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            أخبار الإذاعة
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
          {item.title}
        </h1>

        <div className="mt-5 flex gap-3 border-y border-slate-200 py-3 text-sm text-slate-500">
          <span>فريق التحرير</span>
          {publishedDate && <span>•</span>}
          {publishedDate && <span>{publishedDate}</span>}
        </div>

        {item.imageUrl && (
          <figure className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="mx-auto max-h-[260px] w-auto max-w-full object-contain"
            />
          </figure>
        )}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <div className="whitespace-pre-wrap text-lg leading-9 text-slate-700">
            {item.body}
          </div>

          {youtubeId && (
            <div className="mt-8 overflow-hidden rounded-2xl border bg-black">
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
          )}

          {showTweet && item.tweetUrl && (
            <div className="mt-8 rounded-2xl border bg-slate-50 p-5">
              <h2 className="mb-3 text-lg font-black">منشور مرتبط</h2>
              <blockquote className="twitter-tweet">
                <a href={item.tweetUrl} target="_blank" rel="noopener noreferrer">
                  عرض المنشور على منصة X
                </a>
              </blockquote>
            </div>
          )}

          {(item.sourceLabel || item.sourceUrl) && (
            <div className="mt-8 rounded-2xl border bg-slate-50 p-5">
              <div className="text-sm text-slate-500">المصدر</div>
              <div className="mt-1 font-bold">
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {item.sourceLabel || "زيارة المصدر"}
                  </a>
                ) : (
                  item.sourceLabel
                )}
              </div>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
