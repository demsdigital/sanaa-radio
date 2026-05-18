export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

// استخراج الـ ID الخاص باليوتيوب
function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// تنظيف رابط التغريدة واستخراج الـ ID الخاص بها للتضمين الرسمي المباشر بدون وسيط
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

  // حقل عنوان المادة المرئية الاختياري (تعديل التسمية أو إرجاع الافتراضي)
  // ملاحظة: إذا قمت بإضافة حقل الإدخال في الداتابيز لاحقاً يمكنك استبدال "فيديو" بـ item.youtubeTitle
  const videoLabel = "فيديو"; 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16" dir="rtl">
      
      {/* رأس الصفحة المتناسق مع الهوية العامة */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/#news" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
            ➔ العودة للأخبار
          </Link>
          <div className="text-slate-400 text-xs font-medium">
            <span>نُشر في: {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}</span>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي للخبر المفرد كالمواقع الإخبارية العالمية */}
      <main className="max-w-3xl mx-auto px-4 pt-10">
        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 md:p-10 space-y-8">
          
          {/* تصنيف أو شارة الخبر بالهوية الزرقاء */}
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-md">
            أخبار الإذاعة
          </div>

          {/* عنوان الخبر العريض */}
          <h1 className="text-slate-900 text-2xl md:text-4xl font-black leading-tight">
            {item.title}
          </h1>

          {/* الصورة الرئيسية للمادة الإخبارية بمقاس متناسق */}
          {item.imageUrl && (
            <div className="w-full h-[250px] md:h-[420px] relative rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* نص الخبر الإخباري المنسق والمريح جداً للقراءة */}
          <div className="text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-normal border-b border-slate-100 pb-8">
            {item.body}
          </div>

          {/* الملحقات والمواد المرئية المضمنة في ذيل الخبر */}
          {(youtubeId || tweetId || item.sourceLabel) && (
            <div className="space-y-6 pt-2">
              
              {/* 1. حقل إدراج المادة المرئية (يوتيوب) */}
              {youtubeId && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 border-r-4 border-red-500 pr-2">
                    {videoLabel}
                  </h3>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
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

              {/* 2. تضمين التغريدة الرسمي الصافي من خوادم Twitter/X مباشرة */}
              {tweetId && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 border-r-4 border-slate-900 pr-2">
                    تغطية ذات صلة عبر منصة 𝕏
                  </h3>
                  <div className="w-full min-h-[400px] flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden">
                    <iframe
                      src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&widgetsVersion=2611156522%3A1701165234551&width=550px`}
                      className="w-full max-w-[550px] h-[500px]"
                      frameBorder="0"
                      scrolling="no"
                    />
                  </div>
                </div>
              )}

              {/* 3. توثيق المصدر */}
              {item.sourceLabel && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mt-6">
                  <span className="text-xs text-slate-500">
                    المصدر الأصلي للخبر: <strong className="text-slate-800">{item.sourceLabel}</strong>
                  </span>
                  {item.sourceUrl && (
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
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