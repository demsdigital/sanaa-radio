import { db } from "@/db";
import { schedule, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الخارطة البرامجية | إذاعة الجمهورية اليمنية",
  description: "الخارطة البرامجية لإذاعة الجمهورية اليمنية — البرنامج العام",
};

const days = [
  { value: "sat",   label: "السبت",    en: "SAT" },
  { value: "sun",   label: "الأحد",    en: "SUN" },
  { value: "mon",   label: "الاثنين",  en: "MON" },
  { value: "tue",   label: "الثلاثاء", en: "TUE" },
  { value: "wed",   label: "الأربعاء", en: "WED" },
  { value: "thu",   label: "الخميس",   en: "THU" },
  { value: "fri",   label: "الجمعة",   en: "FRI" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-900",   border: "border-blue-200",   dot: "bg-blue-500"   },
  red:    { bg: "bg-red-50",    text: "text-red-900",    border: "border-red-200",    dot: "bg-red-500"    },
  green:  { bg: "bg-green-50",  text: "text-green-900",  border: "border-green-200",  dot: "bg-green-500"  },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-900", border: "border-yellow-200", dot: "bg-yellow-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-200", dot: "bg-purple-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200", dot: "bg-orange-500" },
  slate:  { bg: "bg-slate-50",  text: "text-slate-800",  border: "border-slate-200",  dot: "bg-slate-400"  },
};

export default async function SchedulePage() {
  const allItems = await db.select().from(schedule);
  const allPrograms = await db.select().from(programs);

  const todayMap: Record<number, string> = { 0:"sun",1:"mon",2:"tue",3:"wed",4:"thu",5:"fri",6:"sat" };
  const todayKey = todayMap[new Date().getDay()];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* هيرو */}
      <div className="py-14 px-6 text-white text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-5 right-10 w-48 h-48 rounded-full border border-white" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            📅 الخارطة البرامجية
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">جدول البرامج</h1>
          <p className="text-blue-200 text-sm">إذاعة الجمهورية اليمنية — البرنامج العام</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {days.map((d) => {
            const count = allItems.filter(i => i.day === d.value || i.day === "daily").length;
            const isToday = d.value === todayKey;
            return (
              <div key={d.value}
                className={`rounded-xl p-3 text-center border transition-all ${
                  isToday
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-200"
                }`}>
                <div className={`text-xs font-bold mb-1 ${isToday ? "text-blue-100" : "text-slate-400"}`}>{d.en}</div>
                <div className="font-black text-sm">{d.label}</div>
                <div className={`text-xs mt-1 ${isToday ? "text-blue-100" : "text-slate-400"}`}>{count} برنامج</div>
                {isToday && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-1.5 animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* جدول كل يوم */}
        <div className="space-y-10">
          {days.map((d) => {
            const dayItems = allItems
              .filter(i => i.day === d.value || i.day === "daily")
              .sort((a,b) => a.timeStart.localeCompare(b.timeStart));
            if (dayItems.length === 0) return null;
            const isToday = d.value === todayKey;

            return (
              <div key={d.value}>
                {/* عنوان اليوم */}
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${isToday ? "border-blue-500" : "border-slate-200"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    isToday ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600"
                  }`}>{d.en}</div>
                  <div>
                    <h2 className={`text-lg font-black ${isToday ? "text-blue-600" : "text-slate-900"}`}>{d.label}</h2>
                    {isToday && <span className="text-xs text-blue-500 font-medium">● اليوم</span>}
                  </div>
                  <span className="mr-auto text-slate-400 text-sm">{dayItems.length} برنامج</span>
                </div>

                {/* البرامج */}
                <div className="space-y-2">
                  {dayItems.map((item, idx) => {
                    const col = colorMap[(item as any).color || "slate"] || colorMap.slate;
                    const isLive = item.type === "live";
                    return (
                      <div key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${col.bg} ${col.border} transition-all hover:shadow-sm`}>

                        {/* رقم */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${col.dot} text-white`}>
                          {idx + 1}
                        </div>

                        {/* وقت */}
                        <div className="flex-shrink-0 text-center" style={{minWidth:"100px"}}>
                          <div className="text-blue-700 font-black text-sm" dir="ltr">{item.timeStart}</div>
                          <div className="text-slate-400 text-xs" dir="ltr">— {item.timeEnd}</div>
                        </div>

                        {/* خط فاصل */}
                        <div className={`w-px h-10 flex-shrink-0 ${col.dot} opacity-30`} />

                        {/* اسم البرنامج */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-base ${col.text}`}>{item.label}</div>
                          {item.day === "daily" && (
                            <div className="text-slate-400 text-xs mt-0.5">يومي</div>
                          )}
                        </div>

                        {/* نوع */}
                        {isLive ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            مباشر
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full flex-shrink-0">
                            تسجيل
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
