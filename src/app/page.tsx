export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { settings, programs, episodes, news, schedule } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إذاعة الجمهورية اليمنية — البرنامج العام",
  description: "إذاعة الجمهورية اليمنية — الصوت الحقيقي منذ عقود.",
  openGraph: { title: "إذاعة الجمهورية اليمنية — البرنامج العام", description: "الصوت الحقيقي منذ عقود.", locale: "ar_YE", type: "website" },
};

export default async function HomePage() {
  const [allSettings, allPrograms, latestNews, allSchedule, latestEpisodes] = await Promise.all([
    db.select().from(settings),
    db.select().from(programs).where(eq(programs.active, true)),
    db.select().from(news).orderBy(desc(news.publishedAt)).limit(6), // تم تعديل الحد إلى 6 أخبار لمظهر أفضل
    db.select().from(schedule),
    db.select().from(episodes).orderBy(desc(episodes.publishedAt)).limit(5),
  ]);

  const s: Record<string, string> = {};
  allSettings.forEach((item) => (s[item.key] = item.value));

  const todayMap: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };
  const todayKey = todayMap[new Date().getDay()];
  const todaySchedule = allSchedule
    .filter((i) => i.day === todayKey || i.day === "daily")
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white text-slate-900" dir="rtl">

      {/* Ticker */}
      {s.ticker_visible !== "false" && s.ticker && (
        <div className="bg-red-600 py-2 overflow-hidden">
          <div className="flex items-center gap-4 whitespace-nowrap animate-marquee">
            <span className="bg-white text-red-600 text-xs font-black px-3 py-0.5 rounded flex-shrink-0">عاجل</span>
            <span className="text-white text-sm font-medium">{s.ticker}</span>
          </div>
        </div>
      )}


      {/* Hero */}
      {(()=>{
        const bg:Record<string,string>={
          blue:"linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)",
          dark:"linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
          green:"linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)",
          red:"linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
        };
        const mt=s.hero_media_type||"none";
        const mu=s.hero_media_url||"";
        const op=s.hero_overlay_opacity?Number(s.hero_overlay_opacity)/100:0.55;
        return(
          <section className="relative text-white py-20 px-6 overflow-hidden" style={{minHeight:"520px",background:bg[s.hero_bg||"blue"]||bg.blue}}>
            {(mt==="image"||mt==="gif")&&mu&&(<><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${mu})`}}/><div className="absolute inset-0" style={{background:`rgba(0,0,0,${op})`}}/></>)}
            {mt==="video"&&mu&&(<><video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"><source src={mu}/></video><div className="absolute inset-0" style={{background:`rgba(0,0,0,${op})`}}/></>)}
            {mt==="none"&&(<div className="absolute inset-0 opacity-10 pointer-events-none"><div className="absolute top-10 right-10 w-64 h-64 rounded-full border-2 border-white"/><div className="absolute top-20 right-20 w-48 h-48 rounded-full border border-white"/><div className="absolute bottom-10 left-10 w-80 h-80 rounded-full border border-white"/></div>)}
            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">

                <div className="flex-1 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                    {s.hero_badge||"على الهواء الآن"}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight drop-shadow-lg">{s.hero_title||"إذاعة الجمهورية اليمنية"}</h1>
                  <p className="text-blue-100 text-xl font-semibold mb-1 drop-shadow">{s.hero_subtitle||"البرنامج العام"}</p>
                  <p className="text-blue-200 text-sm mb-8 drop-shadow">Yemen Radio • {s.hero_tagline||"الصوت الحقيقي منذ عقود"}</p>
                  {s.on_air_label&&(
                    <div className="bg-white/15 backdrop-blur border border-white/25 rounded-2xl p-5 max-w-sm shadow-xl">
                      <div className="text-blue-100 text-xs uppercase tracking-widest mb-1 font-medium">البرنامج الحالي</div>
                      <div className="text-white font-bold text-lg mb-3">{s.on_air_label}</div>
                      <div className="flex gap-1 mb-4 h-7 items-end">
                        {[8,16,24,12,20,28,10,22,18,14,26,8].map((h,i)=>(<div key={i} className="w-1 bg-white rounded-full animate-pulse opacity-80" style={{height:`${h}px`,animationDelay:`${i*0.1}s`}}/>))}
                      </div>
                      {s.show_listen_btn!=="false"&&latestEpisodes.length>0&&(
                        <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">🎧 استمع للأرشيف</Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}
      {/* Programs */}
      {s.section_programs !== "false" && allPrograms.length > 0 && (
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">ما نقدمه</div>
              <h2 className="text-slate-900 text-2xl font-black">البرامج</h2>
            </div>
            <Link href="/programs" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">عرض الكل ←</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allPrograms.slice(0, 8).map((p) => (
              <Link key={p.id} href={`/programs/${p.slug}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group">
                {p.imageUrl ? (
                  <div className="w-full bg-slate-50 flex items-center justify-center" style={{minHeight:"130px"}}>
                    <img src={p.imageUrl} alt={p.name} className="w-full h-auto object-contain max-h-40" />
                  </div>
                ) : (
                  <div className="w-full h-24 bg-blue-50 flex items-center justify-center">
                    <span className="text-3xl">📻</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="text-slate-900 font-bold text-sm mb-1 line-clamp-1">{p.name}</div>
                  <div className="text-blue-600 text-xs font-medium mb-1">{p.category}</div>
                  {p.description && <div className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{p.description}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Schedule */}
      {s.section_schedule !== "false" && todaySchedule.length > 0 && (
        <section id="schedule" className="px-6 py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">اليوم</div>
              <h2 className="text-slate-900 text-2xl font-black">جدول البرامج</h2>
            </div>
            <div className="space-y-2">
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-200 hover:shadow-sm transition-all">
                  <span className="text-blue-600 font-bold text-sm w-28 flex-shrink-0" dir="ltr">{item.timeStart} — {item.timeEnd}</span>
                  <span className="text-slate-800 flex-1 font-medium">{item.label}</span>
                  {item.type === "live" && (
                    <span className="text-red-500 text-xs flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />مباشر
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {s.section_news !== "false" && latestNews.length > 0 && (
        <section id="news" className="px-6 py-16 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">آخر الأخبار</div>
              <h2 className="text-slate-900 text-2xl font-black">الأخبار</h2>
            </div>
            <Link href="/news" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">عرض الكل ←</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  {item.imageUrl && (
                    <div className="h-44 w-full overflow-hidden border-b">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-slate-400 text-xs mb-2">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-YE") : ""}</div>
                    <Link href={`/news/${item.id}`} className="text-slate-900 font-bold text-base mb-2 block leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                    <div className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">{item.body}</div>
                    
                    {/* شارات نوع المحتوى المضاف حديثاً */}
                    <div className="flex gap-1.5 flex-wrap">
                      {item.sourceLabel && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">📰 {item.sourceLabel}</span>}
                      {item.youtubeUrl && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">▶ يوتيوب</span>}
                      {item.tweetUrl && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">𝕏 تغريدة</span>}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 mt-2">
                  <Link href={`/news/${item.id}`} className="text-blue-600 text-xs font-bold inline-flex items-center gap-1 hover:underline">
                    اقرأ المزيد ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Satellite */}
      {s.section_satellite !== "false" && (
        <section id="satellite" className="px-6 py-16 bg-blue-700 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-12">
              <div className="flex-1">
                <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-2">بث مباشر</div>
                <h2 className="text-white text-2xl font-black mb-6">استمع عبر القمر الصناعي</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "تردد الفضائية", value: `${s.satellite_freq} MHz` },
                    { label: "القمر الصناعي", value: s.satellite_name },
                    { label: "الموضع المداري", value: s.satellite_position },
                    { label: "الاستقطاب", value: s.satellite_polarization },
                    { label: "الموجة القصيرة", value: `${s.shortwave} كيلو هيرتز` },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 border border-white/20 rounded-xl p-4">
                      <div className="text-blue-200 text-xs mb-1 font-medium">{item.label}</div>
                      <div className="text-white font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-4">خطوات الضبط</div>
                <div className="space-y-3">
                  {[
                    "وجّه طبقك الفضائي نحو القمر عرب سات بدر 4 على موضع 16° شرقاً",
                    "أدخل التردد 12182 MHz مع الاستقطاب أفقي (H)",
                    "ابحث عن القنوات وستجد إذاعة الجمهورية اليمنية",
                    "للموجة القصيرة اضبط على 11860 كيلو هيرتز",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-blue-100 text-sm leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {s.section_contact !== "false" && s.whatsapp && (
        <section id="contact" className="px-6 py-16 max-w-4xl mx-auto text-center">
          <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-2">تفاعل معنا</div>
          <h2 className="text-slate-900 text-2xl font-black mb-8">تواصل مع الإذاعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "رسالة صوتية", desc: "شاركنا رأيك على الهواء", icon: "🎤", msg: "رسالة صوتية" },
              { label: "طلب إهداء", desc: "أهدِ من تحب أغنية", icon: "🎵", msg: "طلب إهداء" },
              { label: "أرسل خبراً", desc: "شاركنا أخبار مجتمعك", icon: "📰", msg: "خبر للإذاعة" },
            ].map((item) => (
              <a key={item.label}
                href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(item.msg)}`}
                target="_blank"
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-slate-900 font-bold mb-1">{item.label}</div>
                <div className="text-slate-500 text-sm mb-3">{item.desc}</div>
                <div className="text-green-600 text-xs font-bold">عبر واتساب ←</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
    </div>
  );
}