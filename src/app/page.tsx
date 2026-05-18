"use client";
import { useState, useEffect } from "react";

type News = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  tweetUrl: string;
  youtubeUrl: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
};

const emptyForm = {
  title: "",
  body: "",
  imageUrl: "",
  tweetUrl: "",
  youtubeUrl: "",
  sourceLabel: "",
  sourceUrl: "",
};

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/news");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: News) {
    setEditing(item);
    setForm({
      title: item.title,
      body: item.body,
      imageUrl: item.imageUrl || "",
      tweetUrl: item.tweetUrl || "",
      youtubeUrl: item.youtubeUrl || "",
      sourceLabel: item.sourceLabel || "",
      sourceUrl: item.sourceUrl || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/news", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const f = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الأخبار</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} خبر</p>
        </div>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + إضافة خبر
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا توجد أخبار بعد</div>
      ) : (
        <div className="space-y-3 max-w-4xl mx-auto">
          {items.map((item) => (
            <div key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 font-semibold mb-1 truncate">{item.title}</div>
                <div className="text-slate-500 text-sm line-clamp-2 mb-2">{item.body}</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-slate-400 text-xs">
                    {new Date(item.publishedAt).toLocaleDateString("ar-YE")}
                  </span>
                  {item.sourceLabel && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {item.sourceLabel}
                    </span>
                  )}
                  {item.youtubeUrl && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">▶ يوتيوب</span>
                  )}
                  {item.tweetUrl && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-medium">𝕏 تغريدة</span>
                  )}
                  {item.imageUrl && (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">🖼 صورة</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(item)}
                  className="text-slate-600 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="text-red-500 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 my-8">
            <h2 className="text-slate-900 font-bold text-lg mb-6">
              {editing ? "تعديل الخبر" : "إضافة خبر جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* العنوان */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">عنوان الخبر *</label>
                <input
                  value={form.title}
                  onChange={(e) => f("title", e.target.value)}
                  required
                  placeholder="أدخل عنوان الخبر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                />
              </div>

              {/* نص الخبر */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">نص الخبر *</label>
                <textarea
                  value={form.body}
                  onChange={(e) => f("body", e.target.value)}
                  required
                  rows={5}
                  placeholder="اكتب تفاصيل الخبر هنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* المصدر */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم المصدر</label>
                  <input
                    value={form.sourceLabel}
                    onChange={(e) => f("sourceLabel", e.target.value)}
                    placeholder="مثال: رويترز"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط المصدر الأصلي</label>
                  <input
                    value={form.sourceUrl}
                    onChange={(e) => f("sourceUrl", e.target.value)}
                    placeholder="https://..."
                    type="url"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* روابط الميديا والشبكات */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">▶ رابط يوتيوب</label>
                  <input
                    value={form.youtubeUrl}
                    onChange={(e) => f("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/..."
                    type="url"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">𝕏 رابط تغريدة X</label>
                  <input
                    value={form.tweetUrl}
                    onChange={(e) => f("tweetUrl", e.target.value)}
                    placeholder="https://x.com/..."
                    type="url"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* رابط الصورة المعاينة */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">🖼 رابط الصورة</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => f("imageUrl", e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  dir="ltr"
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "نشر الخبر"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors">
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