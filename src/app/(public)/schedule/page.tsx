import { db } from "@/db";
import { schedule } from "@/db/schema";
import { Suspense } from "react";
import DayTabs from "./DayTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الخارطة البرامجية | إذاعة الجمهورية اليمنية",
  description: "الخارطة البرامجية لإذاعة الجمهورية اليمنية — البرنامج العام",
};
export const dynamic = "force-dynamic";

const dayLabels: Record<string,string> = { sat:"السبت",sun:"الأحد",mon:"الاثنين",tue:"الثلاثاء",wed:"الأربعاء",thu:"الخميس",fri:"الجمعة" };
const colorMap: Record<string,{bg:string;text:string;border:string;dot:string}> = {
  blue:{bg:"bg-blue-50",text:"text-blue-900",border:"border-blue-200",dot:"bg-blue-500"},
  red:{bg:"bg-red-50",text:"text-red-900",border:"border-red-200",dot:"bg-red-500"},
  green:{bg:"bg-green-50",text:"text-green-900",border:"border-green-200",dot:"bg-green-500"},
  yellow:{bg:"bg-yellow-50",text:"text-yellow-900",border:"border-yellow-200",dot:"bg-yellow-500"},
  purple:{bg:"bg-purple-50",text:"text-purple-900",border:"border-purple-200",dot:"bg-purple-500"},
  orange:{bg:"bg-orange-50",text:"text-orange-900",border:"border-orange-200",dot:"bg-orange-500"},
  slate:{bg:"bg-slate-50",text:"text-slate-800",border:"border-slate-200",dot:"bg-slate-400"},
};

type Props = { searchParams: Promise<{day?:string}> };

export default async function SchedulePage({ searchParams }: Props) {
  const { day } = await searchParams;
  const allItems = await db.select().from(schedule);
  const todayMap: Record<number,string> = {0:"sun",1:"mon",2:"tue",3:"wed",4:"thu",5:"fri",6:"sat"};
  const yemenTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const todayKey = todayMap[yemenTime.getUTCDay()];
  const selectedDay = day || todayKey;

  const counts: Record<string,number> = {};
  ["sat","sun","mon","tue","wed","thu","fri"].forEach(d => {
    counts[d] = allItems.filter(i => i.day===d || i.day==="daily").length;
  });

  const dayItems = allItems
    .filter(i => i.day===selectedDay || i.day==="daily")
    .sort((a,b) => a.timeStart.localeCompare(b.timeStart));

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="py-14 px-6 text-white text-center relative overflow-hidden"
        style={{background:"linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)"}}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-5 right-10 w-48 h-48 rounded-full border border-white"/>
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white"/>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4">📅 الخارطة البرامجية</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">جدول البرامج</h1>
          <p className="text-blue-200 text-sm">إذاعة الجمهورية اليمنية — البرنامج العام</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense><DayTabs counts={counts} today={todayKey} /></Suspense>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-slate-900 text-xl font-black">{dayLabels[selectedDay]}</h2>
            {selectedDay===todayKey && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>اليوم
              </span>
            )}
          </div>
          <span className="text-slate-400 text-sm">{dayItems.length} برنامج</span>
        </div>

        {dayItems.length===0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-slate-400">لا توجد برامج لهذا اليوم</div>
          </div>
        ) : (
          <div className="space-y-2">
            {dayItems.map((item,idx) => {
              const col = colorMap[(item as any).color||"slate"]||colorMap.slate;
              return (
                <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border ${col.bg} ${col.border}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${col.dot} text-white`}>{idx+1}</div>
                  <div className="flex-shrink-0 text-center" style={{minWidth:"110px"}}>
                    <div className="text-blue-700 font-black text-sm" dir="ltr">{item.timeStart}</div>
                    <div className="text-slate-400 text-xs" dir="ltr">— {item.timeEnd}</div>
                  </div>
                  <div className={`w-px h-10 flex-shrink-0 ${col.dot} opacity-30`}/>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${col.text}`}>{item.label}</div>
                    {item.day==="daily" && <div className="text-slate-400 text-xs mt-0.5">يومي</div>}
                  </div>
                  {item.type==="live" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>مباشر
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full flex-shrink-0">تسجيل</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
