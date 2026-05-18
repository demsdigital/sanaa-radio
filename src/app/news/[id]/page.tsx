import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

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
      ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
      type: "article",
      publishedTime: item.publishedAt?.toISOString(),
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { id } = await params;
  const [item] = await db.select().from(news).where(eq(news.id, Number(id)));
  if (!item) notFound();

  const otherNews = await db.select().from(news).orderBy(news.publishedAt).limit(4);
  const related = otherNews.filter((n) => n.id !== item.id).slice(0, 3);

  const dateFormatted = new Date(item.publishedAt).toLocaleDateString("ar-YE", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="sticky top-0 z-40 border-b border-slate-200 px-8 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-slate-900 text-sm font-black">إذاعة الجمهورية اليمنية</div>
            <div className="text-blue-600 text-xs font-semibold">البرنامج العام</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">الأخبار</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold px-4 py-2 rounded-full mb-6">
          📰 خبر
        </div>
        <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight mb-4">{item.title}</h1>
        <div className="flex items-center gap-3 text-slate-400 text-sm mb-8 pb-8 border-b border-slate-100">
          <span>📅 {dateFormatted}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>إذاعة الجمهورية اليمنية</span>
        </div>
        {item.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <img src={item.imageUrl} alt={item.title} className="w-full h-64 md:h-80 object-cover" />
          </div>
        )}
        <div className="text-slate-700 text-lg leading-[2] space-y-4">
          {item.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-4">شارك الخبر</div>
          <div className="flex items-center gap-3 flex-wrap">
            <a href={`https://wa.me/?text=${encodeURIComponent(item.title + "\n" + process.env.NEXT_PUBLIC_URL + "/news/" + item.id)}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors text-sm">
              واتساب
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/news/" + item.id)}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-sm">
              X (تويتر)
            </a>
          </div>
        </div>
      </main>

      {related.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100 px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-slate-900 text-xl font-black mb-6">أخبار أخرى</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="text-slate-400 text-xs mb-2">{new Date(n.publishedAt).toLocaleDateString("ar-YE")}</div>
                  <div className="text-slate-900 font-bold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">{n.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-slate-900 text-white px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="شعار" className="w-12 h-12 object-contain opacity-80" />
            <div>
              <div className="text-white font-black">إذاعة الجمهورية اليمنية</div>
              <div className="text-slate-400 text-sm">البرنامج العام • Yemen Radio</div>
            </div>
          </div>
          <div className="text-slate-600 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}
