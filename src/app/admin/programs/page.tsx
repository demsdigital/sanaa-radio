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
    const data = await res.json();
    setPrograms(data);
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
          <h1 className="text-white text-2xl font-bold">البرامج</h1>
          <p className="text-gray-500 text-sm mt-1">{programs.length} برنامج</p>
        </div>
        <button onClick={openAdd} className="bg-[#1a4fd6] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1a4fd6]/90 transition-colors">
          + إضافة برنامج
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-500 text-center py-20">جاري التحميل...</div>
      ) : programs.length === 0 ? (
        <div className="text-gray-500 text-center py-20">لا توجد برامج بعد</div>
      ) : (
        <div className="bg-[#0e0e18] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-gray-400 text-xs font-medium px-6 py-4">البرنامج</th>
                <th className="text-right text-gray-400 text-xs font-medium px-6 py-4">التصنيف</th>
                <th className="text-right text-gray-400 text-xs font-medium px-6 py-4">الحالة</th>
                <th className="text-right text-gray-400 text-xs font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{p.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#1a4fd6]/20 text-[#1a4fd6] text-xs px-2 py-1 rounded">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${p.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {p.active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-white text-xs px-3 py-1 border border-white/10 rounded hover:border-white/30 transition-colors">تعديل</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-500/20 rounded hover:border-red-500/40 transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e0e18] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h2 className="text-white font-bold text-lg mb-6">{editing ? "تعديل البرنامج" : "إضافة برنامج جديد"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">اسم البرنامج</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">الـ Slug (رابط)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required dir="ltr" className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" placeholder="morning-show" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">التصنيف</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="active" className="text-gray-400 text-sm">برنامج نشط</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#1a4fd6] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#1a4fd6]/90 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة البرنامج"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/10 text-gray-400 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors">
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
