import Link from "next/link";
import { db } from "@/db";
import { settings, programs, episodes, news, schedule } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const [allSettings, allPrograms, latestNews, allSchedule, latestEpisodes] = await Promise.all([
    db.select().from(settings),
    db.select().from(programs).where(eq(programs.active, true)),
    db.select().from(news).orderBy(news.publishedAt).limit(3),
    db.select().from(schedule),
    db.select().from(episodes).orderBy(episodes.publishedAt).limit(5),
  ]);

  const s: Record<string, string> = {};
  allSettings.forEach((item) => (s[item.key] = item.value));

  const todayMap: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };
  const todayKey = todayMap[new Date().getDay()];
  const todaySchedule = allSchedule
    .filter((i) => i.day === todayKey || i.day === "daily")
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#07070d] text-white" dir="rtl">

      {s.ticker_visible !== "false" && s.ticker && (
        <div className="bg-red-700 py-2 overflow-hidden">
          <div className="flex items-center gap-4 whitespace-nowrap animate-marquee">
            <span className="bg-white text-red-700 text-xs font-black px-2 py-0.5 rounded flex-shrink-0">عاجل</span>
            <span className="text-sm">{s.ticker}</span>
          </div>
        </div>
      )}

      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#07070d]/95 backdrop-blur z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a4fd6]/20 border border-[#1a4fd6]/40 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="4" fill="#1a4fd6"/>
              <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#1a4fd6" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M6 20c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="#1a4fd6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-bold">إذاعة الجمهورية اليمنية</div>
            <div className="text-gray-500 text-xs">البرنامج العام</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          {s.section_programs !== "false" && <Link href="/programs" className="hover:text-white transition-colors">البرامج</Link>}
          {s.section_schedule !== "false" && <a href="#schedule" className="hover:text-white transition-colors">الجدول</a>}
          {s.section_news !== "false" && <a href="#news" className="hover:text-white transition-colors">الأخبار</a>}
          {s.section_satellite !== "false" && <a href="#satellite" className="hover:text-white transition-colors">عبر القمر</a>}
          {s.section_contact !== "false" && s.whatsapp && <a href="#contact" className="hover:text-white transition-colors">تواصل</a>}
        </div>
      </nav>

      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(26,79,214,0.12),transparent)]" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            على الهواء
          </div>
          <h1 className="text-5xl font-black text-white mb-3 leading-tight">إذاعة الجمهورية اليمنية</h1>
          <p className="text-[#1a4fd6] text-xl font-semibold mb-2">البرنامج العام</p>
          <p className="text-gray-500 text-sm mb-10">Yemen Radio • الصوت الحقيقي</p>

          {s.on_air_label && (
            <div className="bg-[#0e0e18] border border-white/10 rounded-2xl p-6 max-w-md mx-auto mb-8">
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">الآن على الهواء</div>
              <div className="text-white font-bold text-lg mb-4">{s.on_air_label}</div>
              <div className="flex justify-center gap-1 mb-4 h-8 items-end">
                {[8,16,24,12,20,28,10,22,18,14,26,8].map((h, i) => (
                  <div key={i} className="w-1 bg-[#1a4fd6] rounded-full animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              {s.show_listen_btn !== "false" && latestEpisodes.length > 0 && (
                <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-[#1a4fd6] text-white py-3 rounded-xl font-bold hover:bg-[#1a4fd6]/90 transition-colors">
                  🎧 استمع للأرشيف
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {s.section_programs !== "false" && allPrograms.length > 0 && (
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-1">ما نقدمه</div>
              <h2 className="text-white text-2xl font-black">البرامج</h2>
            </div>
            <Link href="/programs" className="text-gray-400 hover:text-white text-sm transition-colors">عرض الكل ←</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allPrograms.slice(0, 8).map((p) => (
              <Link key={p.id} href={`/programs/${p.slug}`}
                className="bg-[#0e0e18] border border-white/10 rounded-xl p-5 hover:border-[#1a4fd6]/40 transition-colors text-center group">
                <div className="w-12 h-12 rounded-full bg-[#1a4fd6]/10 border border-[#1a4fd6]/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1a4fd6]/20 transition-colors">
                  <span className="text-xl">📻</span>
                </div>
                <div className="text-white font-bold text-sm mb-1">{p.name}</div>
                <div className="text-gray-500 text-xs">{p.category}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {s.section_schedule !== "false" && todaySchedule.length > 0 && (
        <section id="schedule" className="px-6 py-16 bg-[#0a0a14]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-1">اليوم</div>
              <h2 className="text-white text-2xl font-black">جدول البرامج</h2>
            </div>
            <div className="space-y-2">
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-[#0e0e18] border border-white/10 rounded-xl px-5 py-4">
                  <span className="text-[#1a4fd6] font-bold text-sm w-28 flex-shrink-0" dir="ltr">{item.timeStart} — {item.timeEnd}</span>
                  <span className="text-white flex-1">{item.label}</span>
                  {item.type === "live" && (
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />مباشر
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {s.section_news !== "false" && latestNews.length > 0 && (
        <section id="news" className="px-6 py-16 max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-1">آخر الأخبار</div>
            <h2 className="text-white text-2xl font-black">الأخبار</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNews.map((item) => (
              <div key={item.id} className="bg-[#0e0e18] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                <div className="text-gray-500 text-xs mb-2">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</div>
                <div className="text-white font-bold mb-2 leading-snug">{item.title}</div>
                <div className="text-gray-500 text-sm line-clamp-3">{item.body}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {s.section_satellite !== "false" && (
        <section id="satellite" className="px-6 py-16 bg-[#0a0a14]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-1">بث مباشر</div>
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
                <div key={item.label} className="bg-[#0e0e18] border border-white/10 rounded-xl p-4">
                  <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                  <div className="text-[#1a4fd6] font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {s.section_contact !== "false" && s.whatsapp && (
        <section id="contact" className="px-6 py-16 max-w-4xl mx-auto text-center">
          <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-2">تفاعل معنا</div>
          <h2 className="text-white text-2xl font-black mb-8">تواصل مع الإذاعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "رسالة صوتية", desc: "شاركنا رأيك على الهواء", msg: "رسالة صوتية" },
              { label: "طلب إهداء", desc: "أهدِ من تحب أغنية", msg: "طلب إهداء" },
              { label: "أرسل خبراً", desc: "شاركنا أخبار مجتمعك", msg: "خبر للإذاعة" },
            ].map((item) => (
              <a key={item.label} href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(item.msg)}`} target="_blank"
                className="bg-[#0e0e18] border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-colors">
                <div className="text-3xl mb-3">📱</div>
                <div className="text-white font-bold mb-1">{item.label}</div>
                <div className="text-gray-500 text-sm">{item.desc}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} إذاعة الجمهورية اليمنية — البرنامج العام
      </footer>
    </div>
  );
}
