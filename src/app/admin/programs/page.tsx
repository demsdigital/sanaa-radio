"use client";
import { useState, useEffect } from "react";

type Program = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  active: boolean;
};

const categories = ["أخبار", "ديني", "ثقافي", "اجتماعي", "رياضي", "ترفيهي", "عام"];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "عام", active: true });

  async function load() {
    const res = await fetch("/api/programs");
    setPrograms(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", category: "عام", active: true });
    setShowForm(true);
  }

  function openEdit(p: Program) {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, description: p.description || "", category: p.category, active: p.active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/programs", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/programs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">البرامج</h1>
          <p className="text-slate-700 text-sm mt-1">{programs.length} برنامج</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + إضافة برنامج
        </button>
      </div>

      {loading ? (
        <div className="text-slate-600 text-center py-20">جاري التحميل...</div>
      ) : programs.length === 0 ? (
        <div className="text-slate-600 text-center py-20">لا توجد برامج بعد</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-right text-slate-700 text-xs font-medium px-6 py-4">البرنامج</th>
                <th className="text-right text-slate-700 text-xs font-medium px-6 py-4">التصنيف</th>
                <th className="text-right text-slate-700 text-xs font-medium px-6 py-4">الحالة</th>
                <th className="text-right text-slate-700 text-xs font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{p.name}</div>
                    <div className="text-slate-600 text-xs mt-1">{p.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${p.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {p.active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-slate-700 hover:text-slate-900 text-xs px-3 py-1 border border-slate-200 rounded hover:border-slate-400 transition-colors">تعديل</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600 text-xs px-3 py-1 border border-red-100 rounded hover:border-red-300 transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-slate-900 font-bold text-lg mb-6">{editing ? "تعديل البرنامج" : "إضافة برنامج جديد"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">اسم البرنامج</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">الـ Slug (رابط)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" placeholder="morning-show" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-2 font-medium">التصنيف</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="active" className="text-slate-600 text-sm">برنامج نشط</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة البرنامج"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors">
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
