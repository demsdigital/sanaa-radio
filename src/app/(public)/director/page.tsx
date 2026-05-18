import type { Metadata } from "next";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const metadata: Metadata = {
  title: "رئيس القطاع — إذاعة الجمهورية اليمنية",
  description: "رئيس قطاع إذاعة صنعاء – البرنامج العام",
};

export const dynamic = "force-dynamic";

export default async function DirectorPage() {
  const rows = await db.select().from(settings);
  const s: Record<string, string> = {};
  rows.forEach((r) => (s[r.key] = r.value));

  const name     = s.director_name  || "الأستاذ صالح علي أمين القادري";
  const title    = s.director_title || "رئيس قطاع إذاعة صنعاء – البرنامج العام";
  const photo    = s.director_photo || "";
  const bio1     = s.director_bio1  || "";
  const bio2     = s.director_bio2  || "";
  const bio3     = s.director_bio3  || "";
  const bio4     = s.director_bio4  || "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-3">القيادة</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">رئيس القطاع</h1>
          <p className="text-blue-200 text-base">إذاعة الجمهورية اليمنية — البرنامج العام</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
              {/* صورة */}
              <div className="flex-shrink-0">
                {photo ? (
                  <img src={photo} alt={name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-blue-100 border-4 border-blue-200 flex items-center justify-center shadow-md">
                    <span className="text-5xl">👤</span>
                  </div>
                )}
              </div>
              {/* الاسم والمسمى */}
              <div className="text-center md:text-right">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{name}</h2>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {title}
                </div>
              </div>
            </div>

            {/* السيرة */}
            <div className="space-y-6 text-slate-700 text-base leading-relaxed text-right">
              {bio1 && <p>{bio1}</p>}
              {bio2 && <p>{bio2}</p>}
              {bio3 && <p>{bio3}</p>}
              {bio4 && <p>{bio4}</p>}
            </div>
          </div>
        </div>

        {/* المناصب */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🏛️", title: "مدير عام إذاعة إب", desc: "قيادة وإدارة الإذاعة المحلية" },
            { icon: "🏛️", title: "وكيل محافظة إب", desc: "شؤون الإعلام والسياحة والاستثمار" },
            { icon: "📻", title: "رئيس قطاع صنعاء", desc: "إذاعة الجمهورية — البرنامج العام" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-6 text-right shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-slate-900 font-bold text-sm mb-1">{item.title}</div>
              <div className="text-slate-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
