export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getTweetId(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));

  if (!item) notFound();

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const tweetId = getTweetId(item.tweetUrl);
  const videoLabel = "المادة المرئية";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16" dir="rtl">
      
      {/* هيدر الصفحة الممتد */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/#news" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
            ➔ العودة للأخبار
          </Link>
          <div className="text-slate-400 text-xs font-medium">
            <span>تاريخ النشر: {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}</span>
          </div>
        </div>
      </header>

      {/* توزيع الصفحة العريض باستخدام شبكة ممتدة تمنع الانحصار في المنتصف */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* الجانب الأيمن: تفاصيل الخبر والصورة الإخبارية كاملة */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            
            <div className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-md">
              آخر الأخبار
            </div>

            <h1 className="text-slate-900 text-2xl md:text-3xl font-black leading-tight">
              {item.title}
            </h1>

            {/* معالجة الصورة: الحاوية مرنة، والصورة object-contain تمنع أي قص نهائياً */}
            {item.imageUrl && (
              <div className="w-full h-auto max-h-[500px] relative rounded-xl overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full max-h-[500px] object-contain" 
                />
              </div>
            )}

            {/* نص الخبر ممتد ومنسق بمساحة مريحة للعين */}
            <div className="text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-normal pt-4">
              {item.body}
            </div>

          </div>

          {/* الجانب الأيسر (الشريط الجانبي): يضم المواد الملحقة دون تكدس رأسي */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. المادة المرئية (يوتيوب) */}
            {youtubeId && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-r-4 border-red-500 pr-2">
                  {videoLabel}
                </h3>
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black shadow-sm">
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

            {/* 2. تضمين التغريدة الرسمي الصافي */}
            {tweetId && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-r-4 border-slate-900 pr-2">
                  منصة 𝕏
                </h3>
                <div className="w-full min-h-[400px] flex justify-center bg-slate-50 border border-slate-100 rounded-xl p-2 overflow-hidden">
                  <iframe
                    src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&widgetsVersion=2611156522%3A1701165234551&width=100%`}
                    className="w-full h-[480px]"
                    frameBorder="0"
                    scrolling="no"
                  />
                </div>
              </div>
            )}

            {/* 3. توثيق المصدر */}
            {item.sourceLabel && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-center">
                <div className="text-xs text-slate-500">
                  المصدر الأصلي للخبر: <strong className="text-slate-800">{item.sourceLabel}</strong>
                </div>
                {item.sourceUrl && (
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl block transition-all border border-slate-200 text-center"
                  >
                    زيارة الرابط الأصلي ↗
                  </a>
                )}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}