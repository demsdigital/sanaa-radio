export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { settings, programs, episodes, news, schedule, articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import type { Metadata } from "next";
import AudioPlayer from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "إذاعة الجمهورية اليمنية — البرنامج العام",
  description: "إذاعة الجمهورية اليمنية — الصوت الحقيقي منذ عقود.",
  openGraph: { title: "إذاعة الجمهورية اليمنية — البرنامج العام", description: "الصوت الحقيقي منذ عقود.", locale: "ar_YE", type: "website" },
};

export default async function HomePage() {
  const [allSettings, allPrograms, latestNews, allSchedule, latestEpisodes, latestArticles] = await Promise.all([
    db.select().from(settings),
    db.select().from(programs).where(eq(programs.active, true)).orderBy(programs.createdAt),
    db.select().from(news).orderBy(desc(news.publishedAt)).limit(6), // تم تعديل الحد إلى 6 أخبار لمظهر أفضل
    db.select().from(schedule),
    db.select().from(episodes).orderBy(desc(episodes.publishedAt)).limit(5),
    db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.publishedAt)).limit(3),
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
    <div>
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
          <section className="relative text-white py-10 md:py-20 px-4 md:px-6 overflow-hidden" style={{background:bg[s.hero_bg||"blue"]||bg.blue}}>
            {(()=>{
              const mmt=s.hero_mobile_media_type||"same";
              const mmu=s.hero_mobile_media_url||"";
              const mop=s.hero_mobile_overlay_opacity?Number(s.hero_mobile_overlay_opacity)/100:op;
              return(<>
                {/* موبايل */}
                {mmt==="none"&&(<div className="md:hidden absolute inset-0 opacity-10 pointer-events-none"/>)}
                {mmt==="same"&&(mt==="image"||mt==="gif")&&mu&&(<><img src={mu} alt="" className="absolute inset-0 w-full h-full object-cover object-center"/><div className="absolute inset-0" style={{background:`rgba(0,0,0,${op})`}}/></>)}
                {mmt!=="same"&&mmt!=="none"&&mmu&&(<><img src={mmu} alt="" className="md:hidden absolute inset-0 w-full h-full object-cover object-center"/><div className="md:hidden absolute inset-0" style={{background:`rgba(0,0,0,${mop})`}}/></>)}
                {/* ديسكتوب */}
                {mmt!=="same"&&(mt==="image"||mt==="gif")&&mu&&(<><img src={mu} alt="" className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"/><div className="hidden md:block absolute inset-0" style={{background:`rgba(0,0,0,${op})`}}/></>)}
                {mt==="video"&&mu&&(<><video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"><source src={mu}/></video><div className="absolute inset-0" style={{background:`rgba(0,0,0,${op})`}}/></>)}
                {(mmt==="same"||mmt==="none")&&mt==="none"&&(<div className="absolute inset-0 opacity-10 pointer-events-none"><div className="absolute top-10 right-10 w-64 h-64 rounded-full border-2 border-white"/><div className="absolute top-20 right-20 w-48 h-48 rounded-full border border-white"/><div className="absolute bottom-10 left-10 w-80 h-80 rounded-full border border-white"/></div>)}
              </>);
            })()}
            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="flex-1 text-center md:text-right w-full min-w-0">
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                    {s.hero_badge||"على الهواء الآن"}
                  </div>
                  <h1 className="text-2xl md:text-5xl font-black mb-2 leading-tight drop-shadow-lg">{s.hero_title||"إذاعة الجمهورية اليمنية"}</h1>
                  <p className="text-blue-100 text-base md:text-xl font-semibold mb-1 drop-shadow">{s.hero_subtitle||"البرنامج العام"}</p>
                  <p className="text-blue-200 text-sm mb-4 md:mb-8 drop-shadow">Yemen Radio • {s.hero_tagline||"الصوت الحقيقي منذ عقود"}</p>
                  {s.on_air_label&&(
                    <div className="backdrop-blur border border-white/20 rounded-xl p-4 w-full md:max-w-sm shadow-lg mx-auto md:mx-0" style={{background:`rgba(255,255,255,${Number(s.hero_card_opacity||"12")/100})`}}>
                      <div className="text-blue-100 text-xs uppercase tracking-widest mb-1 font-medium">البرنامج الحالي</div>
                      <div className="text-white font-bold text-base mb-2">{s.on_air_label}</div>
                      <div className="flex gap-1 mb-3 h-5 items-end">
                        {[6,12,18,9,15,21,8,16,13,10,19,6].map((h,i)=>(<div key={i} className="w-1 bg-white rounded-full animate-pulse opacity-70" style={{height:`${h}px`,animationDelay:`${i*0.1}s`}}/>))}
                      </div>
                      {s.show_listen_btn!=="false"&&latestEpisodes.length>0&&(
                        <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors text-xs">🎧 استمع للأرشيف</Link>
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
                  <div className="w-full bg-slate-50 flex items-center justify-center" style={{height:"200px",overflow:"hidden"}}>
                    <img src={p.imageUrl} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} className="group-hover:scale-105 transition-transform duration-300" />
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

      {s.section_articles !== "false" && latestArticles.length > 0 && (
        <section id="articles" className="px-6 py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-slate-600 text-xs uppercase tracking-widest font-bold mb-1">نافذة كتابات</div>
                <h2 className="text-slate-900 text-2xl font-black">الكتابات والمقالات</h2>
              </div>
              <Link href="/articles" className="text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors">عرض الكل ←</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all group flex flex-col">
                  {a.imageUrl && (
                    <div className="h-44 w-full overflow-hidden">
                      <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{a.category}</span>
                      {a.authorName && <span className="text-slate-400 text-xs">✍️ {a.authorName}</span>}
                    </div>
                    <div className="text-slate-900 font-bold text-base leading-snug line-clamp-2 mb-2 flex-1">{a.title}</div>
                    {a.excerpt && <div className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">{a.excerpt}</div>}
                    <div className="text-slate-600 text-xs font-bold">اقرأ المزيد ←</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Schedule */}
      {s.section_schedule !== "false" && todaySchedule.length > 0 && (
        <section id="schedule" className="px-6 py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">اليوم</div>
                <h2 className="text-slate-900 text-2xl font-black">خارطة برامج اليوم</h2>
              </div>
              <a href="/schedule" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">الخارطة الكاملة ←</a>
            </div>
            <div className="space-y-2">
              {todaySchedule.map((item, idx) => {
                const colorMap: Record<string,{bg:string;text:string;border:string;dot:string}> = {
                  blue:{bg:"bg-blue-50",text:"text-blue-900",border:"border-blue-200",dot:"bg-blue-500"},
                  red:{bg:"bg-red-50",text:"text-red-900",border:"border-red-200",dot:"bg-red-500"},
                  green:{bg:"bg-green-50",text:"text-green-900",border:"border-green-200",dot:"bg-green-500"},
                  yellow:{bg:"bg-yellow-50",text:"text-yellow-900",border:"border-yellow-200",dot:"bg-yellow-500"},
                  purple:{bg:"bg-purple-50",text:"text-purple-900",border:"border-purple-200",dot:"bg-purple-500"},
                  orange:{bg:"bg-orange-50",text:"text-orange-900",border:"border-orange-200",dot:"bg-orange-500"},
                  slate:{bg:"bg-slate-50",text:"text-slate-800",border:"border-slate-200",dot:"bg-slate-400"},
                };
                const col = colorMap[(item as any).color||"slate"]||colorMap.slate;
                return (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border ${col.bg} ${col.border} hover:shadow-sm transition-all`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${col.dot} text-white`}>{idx+1}</div>
                    <div className="flex-shrink-0" style={{minWidth:"100px"}}>
                      <div className="text-blue-700 font-black text-sm" dir="ltr">{item.timeStart}</div>
                      <div className="text-slate-400 text-xs" dir="ltr">— {item.timeEnd}</div>
                    </div>
                    <div className={`w-px h-8 flex-shrink-0 ${col.dot} opacity-30`}/>
                    <span className={`flex-1 font-bold ${col.text}`}>{item.label}</span>
                    {item.type === "live" && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>مباشر
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Satellite */}
      {s.section_satellite !== "false" && (
        <section id="satellite" className="relative overflow-hidden py-20 px-6"
          style={{background:"linear-gradient(135deg,#0a1628 0%,#0f2a5e 50%,#1a3a7c 100%)"}}>
          {/* خلفية زخرفية */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"/>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl"/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5"/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5"/>
          </div>

          <div className="max-w-6xl mx-auto relative z-10" dir="rtl">

            {/* العنوان */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
                بث مباشر
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-black mb-3">استمع عبر القمر الصناعي</h2>
              <p className="text-blue-300 text-sm">إذاعة الجمهورية اليمنية — البرنامج العام</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* بيانات البث */}
              <div>
                <div className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-4">📡 بيانات الاستقبال</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "القمر الصناعي", value: s.satellite_name, icon: "🛰️" },
                    { label: "التردد", value: `${s.satellite_freq} MHz`, icon: "📶" },
                    { label: "الموضع المداري", value: s.satellite_position, icon: "🌍" },
                    { label: "الاستقطاب", value: s.satellite_polarization, icon: "↔️" },
                    { label: "الموجة القصيرة", value: `${s.shortwave} kHz`, icon: "📻" },
                  ].map((item) => (
                    <div key={item.label}
                      className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 cursor-default">
                      <div className="text-xl mb-2">{item.icon}</div>
                      <div className="text-blue-300 text-xs mb-1 font-medium">{item.label}</div>
                      <div className="text-white font-black text-sm" dir="ltr">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* خطوات الضبط */}
              <div>
                <div className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-4">🔧 خطوات الضبط</div>
                <div className="space-y-3">
                  {[
                    { step:"وجّه طبقك الفضائي نحو القمر عرب سات بدر 4 على موضع 16° شرقاً", icon:"📡" },
                    { step:`أدخل التردد ${s.satellite_freq} MHz مع الاستقطاب ${s.satellite_polarization}`, icon:"⚙️" },
                    { step:"ابحث عن القنوات وستجد إذاعة الجمهورية اليمنية", icon:"🔍" },
                    { step:`للموجة القصيرة اضبط على ${s.shortwave} كيلو هيرتز`, icon:"📻" },
                  ].map((item, i) => (
                    <div key={i}
                      className="flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 transition-all duration-300">
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-white text-xs font-black">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg mb-1">{item.icon}</div>
                        <div className="text-blue-100 text-sm leading-relaxed">{item.step}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* بطاقة الموجة القصيرة */}
                <div className="mt-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-xl flex-shrink-0">📻</div>
                    <div>
                      <div className="text-blue-200 text-xs font-medium mb-0.5">الموجة القصيرة</div>
                      <div className="text-white font-black text-lg" dir="ltr">{s.shortwave} kHz</div>
                    </div>
                    <div className="mr-auto flex gap-0.5 items-end h-6">
                      {[3,5,7,4,6,8,3,5,7,4].map((h,i)=>(
                        <div key={i} className="w-1 bg-blue-400 rounded-full animate-pulse opacity-70"
                          style={{height:`${h*3}px`,animationDelay:`${i*0.1}s`}}/>
                      ))}
                    </div>
                  </div>
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

      {s.show_player === "true" && s.stream_url && (
        <AudioPlayer
          streamUrl={s.stream_url}
          stationName="إذاعة الجمهورية اليمنية"
          onAirLabel={s.on_air_label || "البرنامج العام"}
          opacity={s.player_opacity || "82"}
        />
      )}
    </div>
  );
}