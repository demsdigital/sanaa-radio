#!/bin/bash
set -e
echo "🚀 بناء الخارطة البرامجية..."

# 1 — إضافة color للـ schema
python3 - << 'EOF'
with open("src/db/schema.ts","r") as f: c=f.read()
old='  type: text("type").notNull().default("recorded"),\n});'
new='  type: text("type").notNull().default("recorded"),\n  color: text("color").default("blue"),\n});'
if old in c:
    open("src/db/schema.ts","w").write(c.replace(old,new))
    print("✅ schema")
else:
    print("⚠️ schema — تحقق يدوياً")
EOF

# 2 — صفحة الخارطة العامة
mkdir -p src/app/schedule
cat > src/app/schedule/page.tsx << 'EOF'
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
EOF
echo "✅ schedule/page.tsx"

# 3 — صفحة الأدمن المحدثة
cat > src/app/admin/schedule/page.tsx << 'EOF'
"use client";
import { useState, useEffect } from "react";

type ScheduleItem = {
  id: number; programId: number | null; label: string;
  day: string; timeStart: string; timeEnd: string; type: string; color: string;
};
type Program = { id: number; name: string };

const days = [
  { value: "sat", label: "السبت" },{ value: "sun", label: "الأحد" },
  { value: "mon", label: "الاثنين" },{ value: "tue", label: "الثلاثاء" },
  { value: "wed", label: "الأربعاء" },{ value: "thu", label: "الخميس" },
  { value: "fri", label: "الجمعة" },{ value: "daily", label: "يومي" },
];

const colors = [
  { value: "blue",   label: "أزرق",   cls: "bg-blue-500" },
  { value: "red",    label: "أحمر",   cls: "bg-red-500" },
  { value: "green",  label: "أخضر",   cls: "bg-green-500" },
  { value: "yellow", label: "أصفر",   cls: "bg-yellow-400" },
  { value: "purple", label: "بنفسجي", cls: "bg-purple-500" },
  { value: "orange", label: "برتقالي",cls: "bg-orange-500" },
  { value: "slate",  label: "رمادي",  cls: "bg-slate-400" },
];

const colorBg: Record<string,string> = {
  blue:"bg-blue-50 border-blue-200 text-blue-900",
  red:"bg-red-50 border-red-200 text-red-900",
  green:"bg-green-50 border-green-200 text-green-900",
  yellow:"bg-yellow-50 border-yellow-200 text-yellow-900",
  purple:"bg-purple-50 border-purple-200 text-purple-900",
  orange:"bg-orange-50 border-orange-200 text-orange-900",
  slate:"bg-slate-50 border-slate-200 text-slate-800",
};

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState("sat");
  const [form, setForm] = useState({ label:"", day:"sat", timeStart:"", timeEnd:"", type:"recorded", programId:"", color:"slate" });

  async function load() {
    const [sc,pr] = await Promise.all([fetch("/api/schedule").then(r=>r.json()), fetch("/api/programs").then(r=>r.json())]);
    setItems(sc); setPrograms(pr); setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function openAdd() {
    setEditing(null);
    setForm({ label:"", day:selectedDay, timeStart:"", timeEnd:"", type:"recorded", programId:"", color:"slate" });
    setShowForm(true);
  }
  function openEdit(item: ScheduleItem) {
    setEditing(item);
    setForm({ label:item.label, day:item.day, timeStart:item.timeStart, timeEnd:item.timeEnd, type:item.type, programId:item.programId?.toString()||"", color:item.color||"slate" });
    setShowForm(true);
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body={ ...form, programId:form.programId?parseInt(form.programId):null };
    const method=editing?"PUT":"POST";
    const payload=editing?{...body,id:editing.id}:body;
    await fetch("/api/schedule",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    setShowForm(false); load();
  }
  async function handleDelete(id: number) {
    if(!confirm("هل أنت متأكد؟")) return;
    await fetch("/api/schedule",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    load();
  }

  const filtered = items.filter(i=>i.day===selectedDay||i.day==="daily")
    .sort((a,b)=>a.timeStart.localeCompare(b.timeStart));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الخارطة البرامجية</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} برنامج في الجدول</p>
        </div>
        <div className="flex gap-2">
          <a href="/schedule" target="_blank" className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors">
            معاينة ←
          </a>
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            + إضافة
          </button>
        </div>
      </div>

      {/* فلتر الأيام */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {days.map(d => (
          <button key={d.value} onClick={()=>setSelectedDay(d.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay===d.value?"bg-blue-600 text-white":"bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}>
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-xl">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-slate-400">لا يوجد جدول لهذا اليوم</div>
          <button onClick={openAdd} className="mt-4 text-blue-600 text-sm font-medium hover:underline">+ أضف برنامجاً</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const cls = colorBg[item.color||"slate"]||colorBg.slate;
            const col = colors.find(c=>c.value===(item.color||"slate"));
            return (
              <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border ${cls}`}>
                <div className={`w-3 h-10 rounded-full flex-shrink-0 ${col?.cls||"bg-slate-400"}`} />
                <div className="flex-shrink-0 text-sm font-bold text-blue-700 w-24" dir="ltr">
                  {item.timeStart} — {item.timeEnd}
                </div>
                <div className="flex-1 font-semibold">{item.label}</div>
                {item.type==="live" && (
                  <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>مباشر
                  </span>
                )}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={()=>openEdit(item)} className="text-slate-600 text-xs px-3 py-1.5 border border-white/60 bg-white/60 rounded-lg hover:bg-white transition-colors">تعديل</button>
                  <button onClick={()=>handleDelete(item.id)} className="text-red-500 text-xs px-3 py-1.5 border border-red-200 bg-white/60 rounded-lg hover:bg-red-50 transition-colors">حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-md p-6 my-8 border border-slate-200" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing?"تعديل":"إضافة للجدول"}</h2>
              <button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم البرنامج <span className="text-red-500">*</span></label>
                <input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">من</label>
                  <input type="time" value={form.timeStart} onChange={e=>setForm({...form,timeStart:e.target.value})} required dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">إلى</label>
                  <input type="time" value={form.timeEnd} onChange={e=>setForm({...form,timeEnd:e.target.value})} required dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اليوم</label>
                <select value={form.day} onChange={e=>setForm({...form,day:e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  {days.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">النوع</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  <option value="recorded">تسجيل</option>
                  <option value="live">🔴 مباشر</option>
                </select>
              </div>
              {/* اللون */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">لون البرنامج في الخارطة</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c=>(
                    <button key={c.value} type="button" onClick={()=>setForm({...form,color:c.value})}
                      title={c.label}
                      className={`w-8 h-8 rounded-full ${c.cls} transition-all ${form.color===c.value?"ring-2 ring-offset-2 ring-blue-500 scale-110":""}`} />
                  ))}
                </div>
                <div className="text-slate-400 text-xs mt-1.5">
                  اللون المختار: {colors.find(c=>c.value===form.color)?.label}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing?"حفظ التعديلات":"إضافة"}
                </button>
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
EOF
echo "✅ admin/schedule/page.tsx"

echo ""
echo "✅ الآن شغّل:"
echo "npx drizzle-kit push --config=drizzle.config.ts"
echo "git add . && git commit -m 'feat: خارطة برامجية فاخرة مع ألوان' && git push origin main"
