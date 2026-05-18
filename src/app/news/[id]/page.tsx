export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function getYouTubeId(url?: string | null) {
  if (!url) return null;

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const match = url.match(regExp);

  return match?.[2]?.length === 11 ? match[2] : null;
}

/* SEO ديناميكي */
export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  const newsId = parseInt(id);

  if (isNaN(newsId)) {
    return {};
  }

  const [item] = await db
    .select()
    .from(news)
    .where(eq(news.id, newsId));

  if (!item) {
    return {};
  }

  return {
    title: item.title,
    description: item.body?.slice(0, 160),

    openGraph: {
      title: item.title,
      description: item.body?.slice(0, 160),
      images: item.imageUrl ? [item.imageUrl] : [],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.body?.slice(0, 160),
      images: item.imageUrl ? [item.imageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const newsId = parseInt(id);

  if (isNaN(newsId)) {
    notFound();
  }

  const [item] = await db
    .select()
    .from(news)
    .where(eq(news.id, newsId));

  if (!item) {
    notFound();
  }

  const youtubeId = getYouTubeId(item.youtubeUrl);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        {item.imageUrl && (
          <>
            {/* خلفية ضبابية سينمائية */}
            <div className="absolute inset-0">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                priority
                className="object-cover blur-3xl scale-110 opacity-20"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/70 to-white" />
          </>
        )}

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
          {/* العودة */}
          <Link
            href="/#news"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← العودة للأخبار
          </Link>

          {/* التاريخ */}
          <div className="mt-6 text-sm text-slate-500">
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString(
                  "ar-YE",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : ""}
          </div>

          {/* العنوان */}
          <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-950 max-w-4xl">
            {item.title}
          </h1>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        {/* الصورة الرئيسية */}
        {item.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 shadow-2xl mb-12">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* النص */}
        <article
          className="
            prose prose-slate
            prose-lg
            md:prose-xl
            max-w-none
            prose-headings:font-black
            prose-p:leading-9
            prose-p:text-slate-800
            prose-a:text-blue-600
          "
        >
          {item.body
            ?.split("\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </article>

        {/* MEDIA */}
        {(youtubeId || item.tweetUrl) && (
          <section className="mt-20 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-red-500" />

              <h2 className="text-2xl font-black text-slate-950">
                التغطية الإعلامية
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* يوتيوب */}
              {youtubeId && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-red-600">
                    فيديو التقرير
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="YouTube player"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* X */}
              {item.tweetUrl && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-900">
                    التفاعل عبر منصة X
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-white">
                    <iframe
                      src={`https://twitframe.com/show?url=${encodeURIComponent(
                        item.tweetUrl
                      )}`}
                      className="w-full h-[500px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SOURCE */}
        {item.sourceLabel && (
          <section className="mt-16">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="text-sm font-black text-blue-700">
                  المصدر الرسمي
                </div>

                <p className="text-sm text-slate-700 mt-1">
                  تم توثيق الخبر ونقله عن المصدر الأصلي.
                </p>
              </div>

              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-white
                    hover:bg-blue-100
                    transition-colors
                    border
                    border-blue-200
                    px-5
                    py-3
                    rounded-2xl
                    text-sm
                    font-black
                    text-blue-700
                  "
                >
                  زيارة {item.sourceLabel}
                  ↗
                </a>
              ) : (
                <div className="text-sm font-bold text-slate-700">
                  {item.sourceLabel}
                </div>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}