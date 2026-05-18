import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "البرامج | إذاعة الجمهورية اليمنية",
  description: "استعرض جميع برامج إذاعة الجمهورية اليمنية — البرنامج العام.",
  openGraph: { title: "البرامج | إذاعة الجمهورية اليمنية", description: "استعرض جميع برامج إذاعة الجمهورية اليمنية.", locale: "ar_YE", type: "website" },
};
import { db } from "@/db";
import { programs, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const [allPrograms, allSettings] = await Promise.all([
    db.select().from(programs).where(eq(programs.active, true)),
    db.select().from(settings),
  ]);

  const s: Record<string, string> = {};
  allSettings.forEach((r) => (s[r.key] = r.value));

  // ترتيب البرامج
  if (s.programs_order) {
    const order: number[] = JSON.parse(s.programs_order);
    allPrograms.sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }

  // إعدادات الهيرو
  const bgMap: Record<string, string> = {
    blue:  "linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)",
    dark:  "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
    green: "linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)",
    red:   "linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
  };
  const heroBg  = bgMap[s.programs_hero_bg || s.hero_bg || "blue"] || bgMap.blue;
  const mt      = s.programs_hero_media_type || "none";
  const mu      = s.programs_hero_media_url  || "";
  const op      = Number(s.programs_hero_overlay_opacity ?? s.hero_overlay_opacity ?? 55) / 100;
  const title   = s.programs_hero_title   || "البرامج";
  const subtitle= s.programs_hero_subtitle|| "إذاعة الجمهورية اليمنية — البرنامج العام";

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-white shadow-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">← الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">البرامج</span>
      </nav>

      {/* Hero */}
      <div className="relative py-14 px-6 text-white text-center overflow-hidden"
        style={{ background: heroBg, minHeight: "200px" }}>

        {/* وسائط الخلفية */}
        {(mt === "image" || mt === "gif") && mu && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mu})` }} />
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${op})` }} />
          </>
        )}
        {mt === "video" && mu && (
          <>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={mu} />
            </video>
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${op})` }} />
          </>
        )}
        {mt === "none" && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-5 right-10 w-48 h-48 rounded-full border border-white" />
            <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white" />
          </div>
        )}

        <div className="relative z-10">
          <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-2">أرشيف</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">{title}</h1>
          <p className="text-blue-200 text-sm">{subtitle}</p>
          <p className="text-blue-300 text-xs mt-1">{allPrograms.length} برنامج</p>
        </div>
      </div>

      {/* البرامج */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {allPrograms.length === 0 ? (
          <div className="text-slate-400 text-center py-20">لا توجد برامج بعد</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPrograms.map((p) => (
              <Link key={p.id} href={`/programs/${p.slug}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all group flex flex-col">
                {p.imageUrl ? (
                  <div className="w-full flex-shrink-0" style={{ height: "180px", overflow: "hidden" }}>
                    <img src={p.imageUrl} alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      className="group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-full flex-shrink-0 bg-blue-50 flex items-center justify-center" style={{ height: "180px" }}>
                    <span className="text-5xl">📻</span>
                  </div>
                )}
                <div className="p-4 flex-1">
                  <div className="text-slate-900 font-bold text-sm mb-1 line-clamp-1">{p.name}</div>
                  <div className="text-blue-600 text-xs font-medium mb-2">{p.category}</div>
                  {p.description && <div className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{p.description}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
