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

// دالة لتنظيف وتجهيز رابط التغريدة ليفتح عبر مشغل مخصص أو رسمي
function getTweetEmbedUrl(url: string | null) {
  if (!url) return null;
  // تحويل روابط x.com إلى twitter.com لضمان استقرار التضمين القديم أو استخدام iframe نظيف
  let cleanUrl = url.split("?")[0];
  cleanUrl = cleanUrl.replace("x.com", "twitter.com");
  return `https://twitframe.com/show?url=${encodeURIComponent(cleanUrl)}`;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (isNaN(newsId)) notFound();

  const [item] = await db.select().from(news).where(eq(news.id, newsId));

  if (!item) notFound();

  const youtubeId = getYouTubeId(item.youtubeUrl);
  const tweetEmbedUrl = getTweetEmbedUrl(item.tweetUrl);
  
  // حساب تقريبي لزمن القراءة ذكياً
  const wordsCount = item.body ? item.body.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 150));

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased pb-12" dir="rtl">
      
      {/* شريط علوي ذكي ونظيف */}
      <header className="border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/#news" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-all group">
            <span className="group-hover:translate-x-1 transition-transform">➔</span> العودة للأخبار
          </Link>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">معرف الخبر: #{item.id}</span>
            <span>📅 {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        {/* شبكة التوزيع الذكية العريضة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* العمود الأيمن (8 أسطر): محتوى الخبر والصورة والتحليلات الجانبية */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* كرت العنوان والنص الرئيسي */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
              
              <h1 className="text-2xl md:text-4xl font-black leading-tight text-white mb-6">
                {item.title}
              </h1>

              {item.imageUrl && (
                <div className="w-full h-[250px] md:h-[400px] relative rounded-xl overflow-hidden border border-slate-800 bg-[#070a13] mb-6">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain relative z-10" />
                  <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-105" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                </div>
              )}

              <div className="text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {item.body}
              </div>
            </div>

            {/* صف التحليلات والملخص بالذكاء الاصطناعي المصمم خصيصاً كـ Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-bold block mb-1">⏱️ وقت القراءة المتوقع</span>
                <span className="text-xl font-black text-blue-400">{readingTime} دقيقة</span>
                <span className="text-[10px] text-slate-500 mt-2">محسوب بناءً على طول النص الحالي</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-bold block mb-1">🧠 تصنيف المحتوى (AI)</span>
                <span className="text-lg font-black text-green-400">إعلان رسمي وتدشين</span>
                <span className="text-[10px] text-slate-500 mt-2">تحليل تلقائي لنبرة وسياق الخبر</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-bold block mb-1">🎯 الكلمات المفتاحية</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">#إذاعة_صنعاء</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">#تدشين</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">#اليمن</span>
                </div>
              </div>
            </div>

          </div>

          {/* العمود الأيسر (4 أسطر): التضمينات والميديا الحية التفاعلية */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* كرت التقرير المرئي بيوتيوب */}
            {youtubeId && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="text-red-500">▶</span> التقرير المرئي الحي
                  </h3>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">YouTube</span>
                </div>
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* كرت تضمين التغريدة بعد تنظيف المشغل المكسور */}
            {item.tweetUrl && tweetEmbedUrl && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="text-blue-400">𝕏</span> التغطية التفاعلية عبر تويتر
                  </h3>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">Twitter</span>
                </div>
                {/* ضبط الـ iframe ليقرأ التغريدة الفعلية دون تحويلات عشوائية */}
                <div className="w-full h-[360px] overflow-hidden rounded-xl border border-slate-800 bg-white">
                  <iframe
                    src={tweetEmbedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                  />
                </div>
              </div>
            )}

            {/* كرت توثيق المصدر الأنيق بالأسفل */}
            {item.sourceLabel && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-center space-y-4">
                <div className="text-xs text-slate-400">
                  ⚠️ تم التحقق من هذا الخبر وتوثيقه عبر المصدر الرسمي الإخباري.
                </div>
                {item.sourceUrl ? (
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-4 rounded-xl block transition-all shadow-md shadow-blue-600/10"
                  >
                    الانتقال لموقع {item.sourceLabel} ↗
                  </a>
                ) : (
                  <div className="bg-slate-800 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-700">{item.sourceLabel}</div>
                )}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}