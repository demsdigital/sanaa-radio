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

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

function getTweetId(url: string | null) {
  if (!url) return null;

  const match = url.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);

  return match ? match[1] : null;
}

function formatDate(date: Date | string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("ar-YE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = Number(id);

  if (Number.isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));

  if (!item) notFound();

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const tweetId = getTweetId(item.tweetUrl);
  const publishedDate = formatDate(item.publishedAt);

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {tweetId && (
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
        />
      )}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/#news"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← العودة للرئيسية
          </Link>

          <span className="text-sm text-slate-500">
            إذاعة الجمهورية اليمنية
          </span>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <header className="max-w-3xl">
          <span className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            أخبار الإذاعة
          </span>

          <h1 className="text-3xl font-black leading-[1.35] text-slate-950 md:text-5xl">
            {item.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-slate-200 py-4 text-sm text-slate-500">
            <span>فريق التحرير</span>
            {publishedDate && <span>•</span>}
            {publishedDate && <time>{publishedDate}</time>}
          </div>
        </header>

        {item.imageUrl && (
          <figure className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-auto max-h-[460px] w-full object-contain"
              />
            </div>
          </figure>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
            <div className="whitespace-pre-wrap text-lg leading-9 text-slate-700">
              {item.body}
            </div>

            {youtubeId && (
              <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {tweetId && item.tweetUrl && (
              <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-black text-slate-950">
                  منشور مرتبط
                </h2>

                <blockquote className="twitter-tweet">
                  <a
                    href={item.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    عرض المنشور على منصة X
                  </a>
                </blockquote>
              </section>
            )}

            {(item.sourceLabel || item.sourceUrl) && (
              <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm text-slate-500">المصدر</div>

                <div className="mt-2 font-bold text-slate-900">
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
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <img
                    src="/logo.png"
                    alt="إذاعة الجمهورية اليمنية"
                    className="h-9 w-9 object-contain"
                  />
                </div>

                <div>
                  <div className="font-black text-slate-950">
                    إذاعة الجمهورية اليمنية
                  </div>
                  <div className="text-sm text-slate-500">
                    البرنامج العام
                  </div>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                الموقع الرسمي لإذاعة الجمهورية اليمنية — البرنامج العام.
              </p>

              <Link
                href="/programs"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                تصفح البرامج
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}