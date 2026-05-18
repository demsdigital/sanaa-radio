export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

// دالة ذكية لاستخراج معرف فيديو اليوتيوب من أي رابط (طويل أو قصير)
function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));

  if (!item) notFound();

  const youtubeId = getYouTubeId(item.youtubeUrl);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8" dir="rtl">
      <article className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
        
        {/* شريط علوي أنيق للعودة */}
        <div className="p-6 pb-0 flex items-center justify-between border-b border-slate-50 pb-4">
          <Link href="/#news" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
            ➔ العودة إلى قسم الأخبار
          </Link>
          <span className="text-slate-400 text-xs font-medium">
            ⏳ {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}
          </span>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          
          {/* عنوان الخبر الرئيسي العريض */}
          <h1 className="text-slate-950 text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {item.title}
          </h1>

          {/* الصورة الرئيسية منسقة بحاوية سينمائية ذكية */}
          {item.imageUrl && (
            <div className="w-full h-[300px] md:h-[450px] relative rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-900">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-contain relative z-10" 
              />
              {/* تأثير خلفية ضبابية لتعبئة الفراغات إذا كانت الصورة طولية أو بمقاس مختلف */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-105"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
            </div>
          )}

          {/* نص الخبر بتنسيق مريح جداً للقراءة والمسافات */}
          <div className="text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap max-w-none pr-1 border-r-2 border-slate-100">
            {item.body}
          </div>

          {/* التضمين الذكي للميديا (الفيديو والتغريدة) */}
          {(youtubeId || item.tweetUrl || item.sourceLabel) && (
            <div className="space-y-6 pt-8 border-t border-slate-100">
              <h2 className="text-slate-900 font-black text-lg flex items-center gap-2">
                <span>🎬</span> التغطية الإعلامية والمصادر
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. تضمين فيديو يوتيوب داخل الصفحة مباشرة */}
                {youtubeId && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-red-600 block">▶ التقرير المرئي (يوتيوب)</span>
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow border border-slate-200">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* 2. تضمين تغريدة منصة X بشكل تفاعلي ذكي */}
                {item.tweetUrl && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-blue-500 block">𝕏 التغطية عبر مجتمعنا</span>
                    <div className="w-full max-h-[350px] overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 shadow-sm scrollbar-thin">
                      <iframe
                        src={`https://twitframe.com/show?url=${encodeURIComponent(item.tweetUrl)}`}
                        className="w-full h-[320px] bg-white rounded-lg"
                        frameBorder="0"
                        scrolling="no"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. شريط مصدر الخبر التوثيقي الأصلي بالأسفل */}
              {item.sourceLabel && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mt-4">
                  <div className="text-xs text-slate-700">
                    ℹ️ <strong>توثيق:</strong> هذا الخبر منقول وموثق عن المصدر الرسمي الأصلي.
                  </div>
                  {item.sourceUrl ? (
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-white border border-blue-200 text-blue-600 text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                    >
                      زيارة موقع {item.sourceLabel} ↗
                    </a>
                  ) : (
                    <span className="bg-slate-200/60 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">{item.sourceLabel}</span>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </article>
    </div>
  );
}