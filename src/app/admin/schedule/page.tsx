"use client";
import { useState, useEffect } from "react";

type ScheduleItem = {
  id: number;
  programId: number | null;
  label: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  type: string;
};

type Program = { id: number; name: string };

const days = [
  { value: "sat", label: "السبت" },
  { value: "sun", label: "الأحد" },
  { value: "mon", label: "الاثنين" },
  { value: "tue", label: "الثلاثاء" },
  { value: "wed", label: "الأربعاء" },
  { value: "thu", label: "الخميس" },
  { value: "fri", label: "الجمعة" },
  { value: "daily", label: "يومي" },
];

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState("sat");
  const [form, setForm] = useState({ label: "", day: "sat", timeStart: "", timeEnd: "", type: "recorded", programId: "" });

  async function load() {
    const [sc, pr] = await Promise.all([fetch("/api/schedule").then(r => r.json()), fetch("/api/programs").then(r => r.json())]);
    setItems(sc);
    setPrograms(pr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ label: "", day: selectedDay, timeStart: "", timeEnd: "", type: "recorded", programId: "" });
    setShowForm(true);
  }

  function openEdit(item: ScheduleItem) {
    setEditing(item);
    setForm({ label: item.label, day: item.day, timeStart: item.timeStart, timeEnd: item.timeEnd, type: item.type, programId: item.programId?.toString() || "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, programId: form.programId ? parseInt(form.programId) : null };
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...body, id: editing.id } : body;
    await fetch("/api/schedule", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/schedule", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  const filtered = items.filter(i => i.day === selectedDay || i.day === "daily");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">جدول البرامج</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} برنامج في الجدول</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
          + إضافة
        </button>
      </div>

      {/* Days filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {days.map(d => (
          <button key={d.value} onClick={() => setSelectedDay(d.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedDay === d.value ? "bg-blue-600 text-slate-900 font-bold" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-900"}`}>
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا يوجد جدول لهذا اليوم</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">الوقت</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">البرنامج</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">النوع</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => a.timeStart.localeCompare(b.timeStart)).map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-white/2">
                  <td className="px-6 py-4">
                    <span className="text-blue-600 font-bold text-sm" dir="ltr">{item.timeStart} — {item.timeEnd}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{item.label}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${item.type === "live" ? "bg-red-500/20 text-red-500" : "bg-gray-500/20 text-slate-500"}`}>
                      {item.type === "live" ? "🔴 مباشر" : "تسجيل"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-slate-900 text-xs px-3 py-1 border border-slate-200 rounded hover:border-white/30 transition-colors">تعديل</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-300 text-xs px-3 py-1 border border-red-500/20 rounded hover:border-red-500/40 transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6">
            <h2 className="text-slate-900 font-bold text-lg mb-6">{editing ? "تعديل" : "إضافة للجدول"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-sm mb-2">اسم البرنامج</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-sm mb-2">من</label>
                  <input type="time" value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })} required dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-slate-500 text-sm mb-2">إلى</label>
                  <input type="time" value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })} required dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-2">اليوم</label>
                <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  {days.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-2">النوع</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  <option value="recorded">تسجيل</option>
                  <option value="live">مباشر</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
                  {editing ? "حفظ" : "إضافة"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-500 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors">
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
