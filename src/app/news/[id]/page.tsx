export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

// استخراج ID اليوتيوب
function getYouTubeId(url: string | null) {
  if (!url) return null;

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const match = url.match(regExp);

  return match && match[2].length === 11
    ? match[2]
    : null;
}

// استخراج ID التغريدة
function getTweetId(url: string | null) {
  if (!url) return null;

  const match = url.match(
    /(?:twitter|x)\.com\/\w+\/status\/(\d+)/
  );

  return match ? match[1] : null;
}

export default async function NewsDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const newsId = parseInt(id);

  if (isNaN(newsId)) notFound();

  const [item] = await db
    .select()
    .from(news)
    .where(eq(news.id, newsId));

  if (!item) notFound();

  const youtubeId = getYouTubeId(
    item.youtubeUrl
  );

  const tweetId = getTweetId(
    item.tweetUrl
  );

  const videoLabel = "فيديو";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16"
      dir="rtl"
    >
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 shadow-sm backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/#news"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            ➔ العودة للأخبار
          </Link>

          <div className="text-slate-400 text-xs font-medium">
            <span>
              نُشر في:{" "}
              {item.publishedAt
                ? new Date(
                    item.publishedAt
                  ).toLocaleDateString(
                    "ar-YE"
                  )
                : ""}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 pt-10">
        <article className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6 md:p-10 space-y-10">
          
          {/* BADGE */}
          <div className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-black px-3 py-1.5 rounded-lg">
            أخبار الإذاعة
          </div>

          {/* TITLE */}
          <h1 className="text-slate-950 text-3xl md:text-5xl font-black leading-tight tracking-tight">
            {item.title}
          </h1>

          {/* IMAGE */}
          {item.imageUrl && (
            <figure className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              
              {/* خلفية ضبابية */}
              <div
                className="absolute inset-0 blur-3xl scale-110 opacity-20 bg-center bg-cover"
                style={{
                  backgroundImage: `url(${item.imageUrl})`,
                }}
              />

              {/* الصورة الأصلية بدون قص */}
              <div className="relative flex items-center justify-center p-4 md:p-6 min-h-[320px] md:min-h-[520px]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="
                    max-w-full
                    max-h-[70vh]
                    object-contain
                    rounded-xl
                    shadow-sm
                  "
                />
              </div>
            </figure>
          )}

          {/* BODY */}
          <div
            className="
              text-slate-800
              text-lg
              md:text-[20px]
              leading-[2.2]
              whitespace-pre-wrap
              font-normal
              border-b
              border-slate-100
              pb-10
              max-w-none
            "
          >
            {item.body}
          </div>

          {/* MEDIA */}
          {(youtubeId ||
            tweetId ||
            item.sourceLabel) && (
            <div className="space-y-8 pt-2">
              
              {/* YOUTUBE */}
              {youtubeId && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 border-r-4 border-red-500 pr-3">
                    {videoLabel}
                  </h3>

                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                      title={videoLabel}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* TWEET */}
              {tweetId && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 border-r-4 border-slate-900 pr-3">
                    تغطية عبر منصة 𝕏
                  </h3>

                  <div className="w-full min-h-[400px] flex justify-center bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden">
                    <iframe
                      src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&widgetsVersion=2611156522%3A1701165234551&width=550px`}
                      className="w-full max-w-[550px] h-[500px]"
                      frameBorder="0"
                      scrolling="no"
                    />
                  </div>
                </div>
              )}

              {/* SOURCE */}
              {item.sourceLabel && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-900">
                      المصدر الأصلي
                    </div>

                    <div className="text-sm text-slate-600">
                      {item.sourceLabel}
                    </div>
                  </div>

                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-sm
                        font-black
                        text-blue-600
                        hover:text-blue-700
                        transition-colors
                      "
                    >
                      زيارة الرابط الأصلي ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
