import Link from "next/link";
import { db } from "@/db";
import { settings, programs, episodes, news, schedule } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function HomePage() {
  const [allSettings, allPrograms, latestNews, allSchedule, latestEpisodes] = await Promise.all([
    db.select().from(settings),
    db.select().from(programs).where(eq(programs.active, true)),
    db.select().from(news).orderBy(desc(news.publishedAt)).limit(3),
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

      {/* Nav */}
      <nav className="border-b border-slate-200 px-6 py-0 flex items-center justify-between sticky top-0 bg-white z-40 shadow-sm">
        <div className="flex items-center gap-3 py-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="4" fill="white"/>
              <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M6 20c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7"/>
            </svg>
          </div>
          <div>
            <div className="text-slate-900 text-sm font-bold leading-tight">إذاعة الجمهورية اليمنية</div>
            <div className="text-blue-600 text-xs font-medium">البرنامج العام</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {s.section_programs !== "false" && <Link href="/programs" className="px-4 py-5 text-sm text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all font-medium">البرامج</Link>}
          {s.section_schedule !== "false" && <a href="#schedule" className="px-4 py-5 text-sm text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all font-medium">الجدول</a>}
          {s.section_news !== "false" && <a href="#news" className="px-4 py-5 text-sm text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all font-medium">الأخبار</a>}
          {s.section_satellite !== "false" && <a href="#satellite" className="px-4 py-5 text-sm text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all font-medium">عبر القمر</a>}
          {s.section_contact !== "false" && s.whatsapp && <a href="#contact" className="px-4 py-5 text-sm text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all font-medium">تواصل</a>}
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            على الهواء الآن
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">إذاعة الجمهورية اليمنية</h1>
          <p className="text-blue-100 text-lg mb-2 font-medium">البرنامج العام • Yemen Radio</p>
          <p className="text-blue-200 text-sm mb-10">الصوت الحقيقي منذ عقود</p>

          {s.on_air_label && (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
              <div className="text-blue-100 text-xs uppercase tracking-widest mb-2 font-medium">البرنامج الحالي</div>
              <div className="text-white font-bold text-xl mb-4">{s.on_air_label}</div>
              <div className="flex justify-center gap-1 mb-5 h-8 items-end">
                {[8,16,24,12,20,28,10,22,18,14,26,8].map((h, i) => (
                  <div key={i} className="w-1 bg-white rounded-full animate-pulse opacity-80"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              {s.show_listen_btn !== "false" && latestEpisodes.length > 0 && (
                <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                  🎧 استمع للأرشيف
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

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
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                  <span className="text-xl">📻</span>
                </div>
                <div className="text-slate-900 font-bold text-sm mb-1">{p.name}</div>
                <div className="text-blue-600 text-xs font-medium">{p.category}</div>
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

      {/* News */}
      {s.section_news !== "false" && latestNews.length > 0 && (
        <section id="news" className="px-6 py-16 max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">آخر الأخبار</div>
            <h2 className="text-slate-900 text-2xl font-black">الأخبار</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNews.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="text-slate-400 text-xs mb-2">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</div>
                <div className="text-slate-900 font-bold mb-2 leading-snug">{item.title}</div>
                <div className="text-slate-500 text-sm line-clamp-3">{item.body}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Satellite */}
      {s.section_satellite !== "false" && (
        <section id="satellite" className="px-6 py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">بث مباشر</div>
              <h2 className="text-white text-2xl font-black">استمع عبر القمر</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "تردد الفضائية", value: `${s.satellite_freq} MHz` },
                { label: "القمر الصناعي", value: s.satellite_name },
                { label: "الموضع المداري", value: s.satellite_position },
                { label: "الاستقطاب", value: s.satellite_polarization },
                { label: "الموجة القصيرة", value: `${s.shortwave} كيلو هيرتز` },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-colors">
                  <div className="text-blue-200 text-xs mb-1 font-medium">{item.label}</div>
                  <div className="text-white font-bold">{item.value}</div>
                </div>
              ))}
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
              { label: "رسالة صوتية", desc: "شاركنا رأيك على الهواء", icon: "🎤" },
              { label: "طلب إهداء", desc: "أهدِ من تحب أغنية", icon: "🎵" },
              { label: "أرسل خبراً", desc: "شاركنا أخبار مجتمعك", icon: "📰" },
            ].map((item) => (
              <a key={item.label}
                href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(item.label)}`}
                target="_blank"
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-slate-900 font-bold mb-1">{item.label}</div>
                <div className="text-slate-500 text-sm mb-3">{item.desc}</div>
                <div className="text-green-600 text-xs font-bold group-hover:text-green-700">عبر واتساب ←</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="4" fill="white"/>
                <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-bold">إذاعة الجمهورية اليمنية</div>
              <div className="text-slate-400 text-xs">البرنامج العام</div>
            </div>
          </div>
          <div className="text-slate-500 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}
