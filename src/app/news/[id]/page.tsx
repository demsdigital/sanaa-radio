export const dynamic = "force-dynamic";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (isNaN(newsId)) notFound();

  // جلب الخبر المحدد من الداتابيز
  const [item] = await db.select().from(news).where(eq(news.id, newsId));

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* زر العودة */}
        <div className="p-6 pb-0">
          <Link href="/#news" className="text-sm text-slate-500 hover:text-blue-600 inline-flex items-center gap-1">
            ➔ العودة للرئيسية
          </Link>
        </div>

        <div className="p-6 md:p-8">
          <span className="text-slate-400 text-xs block mb-2">
            نُشر في: {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}
          </span>
          <h1 className="text-slate-900 text-2xl md:text-3xl font-bold mb-6 leading-tight">{item.title}</h1>

          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="w-full h-auto max-h-[400px] object-cover rounded-xl mb-6 border" />
          )}

          <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap mb-8 border-b border-slate-100 pb-6">
            {item.body}
          </p>

          {/* الإضافات والروابط (المصدر، يوتيوب، تويتر) */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-slate-800 font-bold text-xs">روابط ومصادر ذات صلة:</h3>
            
            {item.sourceLabel && (
              <div className="text-xs text-slate-600">
                🔹 <strong>المصدر الأصلي:</strong>{" "}
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.sourceLabel}</a>
                ) : item.sourceLabel}
              </div>
            )}

            {item.youtubeUrl && (
              <div className="text-xs">
                🔴 <strong>تغطية مرئية:</strong>{" "}
                <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">مشاهدة الفيديو على يوتيوب</a>
              </div>
            )}

            {item.tweetUrl && (
              <div className="text-xs">
                💬 <strong>منصة 𝕏 (تويتر سابقاً):</strong>{" "}
                <a href={item.tweetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">قراءة التغريدة الأصلية</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}