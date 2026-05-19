"use client";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect } from "react";

const DAYS = [
  { value: "daily", label: "يومي" },
  { value: "sat",   label: "السبت" },
  { value: "sun",   label: "الأحد" },
  { value: "mon",   label: "الاثنين" },
  { value: "tue",   label: "الثلاثاء" },
  { value: "wed",   label: "الأربعاء" },
  { value: "thu",   label: "الخميس" },
  { value: "fri",   label: "الجمعة" },
];

const COLORS = [
  { value: "blue",   label: "أزرق",  dot: "bg-blue-500" },
  { value: "red",    label: "أحمر",  dot: "bg-red-500" },
  { value: "green",  label: "أخضر",  dot: "bg-green-500" },
  { value: "yellow", label: "أصفر",  dot: "bg-yellow-500" },
  { value: "purple", label: "بنفسجي",dot: "bg-purple-500" },
  { value: "orange", label: "برتقالي",dot:"bg-orange-500" },
  { value: "slate",  label: "رمادي", dot: "bg-slate-400" },
];

const colorBg: Record<string, string> = {
  blue:"bg-blue-50 border-blue-200 text-blue-900",
  red:"bg-red-50 border-red-200 text-red-900",
  green:"bg-green-50 border-green-200 text-green-900",
  yellow:"bg-yellow-50 border-yellow-200 text-yellow-900",
  purple:"bg-purple-50 border-purple-200 text-purple-900",
  orange:"bg-orange-50 border-orange-200 text-orange-900",
  slate:"bg-slate-50 border-slate-200 text-slate-800",
};

type Item = {
  id: number;
  label: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  color: string;
};

const empty = { label:"", day:"daily", timeStart:"", timeEnd:"", type:"recorded", color:"blue" };

export default function AdminSchedulePage() {
  const [items,   setItems]   = useState<Item[]>([]);
    usePermission("schedule");
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState("daily");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form,    setForm]    = useState(empty);
  const [saving,  setSaving]  = useState(false);
  const [delId,   setDelId]   = useState<number|null>(null);

  async function load() {
    const res = await fetch("/api/schedule");
    setItems(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function openNew() {
    setEditing(null);
    setForm(empty);
    setModal(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setForm({ label: item.label, day: item.day, timeStart: item.timeStart, timeEnd: item.timeEnd, type: item.type, color: item.color });
    setModal(true);
  }

  async function handleSave() {
    setSaving(true);
    if (editing) {
      await fetch("/api/schedule", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: editing.id, ...form }) });
    } else {
      await fetch("/api/schedule", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    load();
  }

  async function handleDelete(id: number) {
    await fetch("/api/schedule", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setDelId(null);
    load();
  }

  const filtered = items
    .filter(i => i.day === filterDay || (filterDay !== "daily" && i.day === "daily"))
    .sort((a,b) => a.timeStart.localeCompare(b.timeStart));

  if (loading) return <div className="text-slate-400 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الخارطة البرامجية</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} برنامج إجمالاً</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          <span>+</span> إضافة برنامج
        </button>
      </div>

      {/* فلتر الأيام */}
      <div className="flex gap-2 flex-wrap mb-6">
        {DAYS.map(d => (
          <button key={d.value} onClick={() => setFilterDay(d.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filterDay === d.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}>
            {d.label}
            <span className="mr-1.5 text-xs opacity-70">
              ({d.value === "daily"
                ? items.filter(i => i.day === "daily").length
                : items.filter(i => i.day === d.value || i.day === "daily").length})
            </span>
          </button>
        ))}
      </div>

      {/* الجدول */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-slate-400 mb-4">لا توجد برامج</div>
          <button onClick={openNew} className="text-blue-600 text-sm font-bold hover:underline">+ أضف برنامجاً</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const cls = colorBg[item.color] || colorBg.slate;
            return (
              <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border ${cls}`}>
                {/* وقت */}
                <div className="flex-shrink-0 text-center w-24">
                  <div className="font-black text-sm" dir="ltr">{item.timeStart}</div>
                  <div className="text-xs opacity-60" dir="ltr">— {item.timeEnd}</div>
                </div>

                <div className="w-px h-8 bg-current opacity-20 flex-shrink-0" />

                {/* اسم */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{item.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {DAYS.find(d => d.value === item.day)?.label}
                    {item.day === "daily" && " • يظهر في كل الأيام"}
                  </div>
                </div>

                {/* نوع */}
                {item.type === "live" ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> مباشر
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">تسجيل</span>
                )}

                {/* أزرار */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(item)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    تعديل
                  </button>
                  <button onClick={() => setDelId(item.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-red-500 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal إضافة/تعديل */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-slate-900 font-bold text-lg mb-5">
              {editing ? "تعديل البرنامج" : "إضافة برنامج جديد"}
            </h2>

            <div className="space-y-4">
              {/* اسم البرنامج */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم البرنامج</label>
                <input value={form.label} onChange={e => f("label", e.target.value)}
                  placeholder="نشرة الأخبار"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>

              {/* اليوم */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اليوم</label>
                <select value={form.day} onChange={e => f("day", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* الوقت */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وقت البداية</label>
                  <input type="time" value={form.timeStart} onChange={e => f("timeStart", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وقت النهاية</label>
                  <input type="time" value={form.timeEnd} onChange={e => f("timeEnd", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* النوع */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">النوع</label>
                <div className="flex gap-3">
                  {[{v:"recorded",l:"تسجيل"},{v:"live",l:"مباشر"}].map(t => (
                    <button key={t.v} type="button" onClick={() => f("type", t.v)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        form.type === t.v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                      }`}>
                      {t.v === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1.5" />}
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* اللون */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">اللون</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => f("color", c.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                        form.color === c.value ? "border-blue-500 bg-blue-50" : "border-slate-200"
                      }`}>
                      <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                إلغاء
              </button>
              <button onClick={handleSave} disabled={saving || !form.label || !form.timeStart || !form.timeEnd}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تأكيد الحذف */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDelId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-slate-900 font-bold mb-2">حذف البرنامج؟</h3>
            <p className="text-slate-500 text-sm mb-5">هذا الإجراء لا يمكن التراجع عنه</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                إلغاء
              </button>
              <button onClick={() => handleDelete(delId)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
