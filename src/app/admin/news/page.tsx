"use client";
import { useState, useEffect } from "react";

type News = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  publishedAt: string;
};

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState({ title: "", body: "", imageUrl: "" });

  async function load() {
    const res = await fetch("/api/news");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ title: "", body: "", imageUrl: "" });
    setShowForm(true);
  }

  function openEdit(item: News) {
    setEditing(item);
    setForm({ title: item.title, body: item.body, imageUrl: item.imageUrl || "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/news", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">الأخبار</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} خبر</p>
        </div>
        <button onClick={openAdd} className="bg-[#1a4fd6] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1a4fd6]/90 transition-colors">
          + إضافة خبر
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-20">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 text-center py-20">لا توجد أخبار بعد</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-[#0e0e18] border border-white/10 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-white font-medium mb-1">{item.title}</div>
                <div className="text-gray-500 text-sm line-clamp-2">{item.body}</div>
                <div className="text-gray-600 text-xs mt-2">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-white text-xs px-3 py-1 border border-white/10 rounded hover:border-white/30 transition-colors">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-500/20 rounded hover:border-red-500/40 transition-colors">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e0e18] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-white font-bold text-lg mb-6">{editing ? "تعديل الخبر" : "إضافة خبر جديد"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">عنوان الخبر</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">نص الخبر</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={5} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#1a4fd6] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#1a4fd6]/90 transition-colors">
                  {editing ? "حفظ التعديلات" : "نشر الخبر"}
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
