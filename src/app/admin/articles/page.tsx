"use client";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect, useRef } from "react";

type Article = {
  id: number;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  imageUrl: string;
  authorName: string;
  category: string;
  published: boolean;
  publishedAt: string;
};

const CATEGORIES = ["رأي", "تحليل", "ثقافة", "تراث", "متنوع"];

const empty = { title: "", slug: "", body: "", excerpt: "", imageUrl: "", authorName: "", category: "رأي", published: true };

export default function ArticlesAdminPage() {
  const [articles, setArticles]   = useState<Article[]>([]);
    usePermission("articles");
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Article | null>(null);
  const [form, setForm]           = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [delId, setDelId]         = useState<number | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/articles");
    setArticles(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }
  function openEdit(a: Article) {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, body: a.body, excerpt: a.excerpt || "", imageUrl: a.imageUrl || "", authorName: a.authorName || "", category: a.category, published: a.published });
    setShowForm(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setForm(f => ({ ...f, imageUrl: url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/articles", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    await fetch("/api/articles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDelId(null);
    load();
  }

  // توليد slug تلقائي من العنوان
  function genSlug(title: string) {
    return title.trim().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").toLowerCase();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الكتابات والمقالات</h1>
          <p className="text-slate-500 text-sm mt-1">{articles.length} مقال</p>
        </div>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + إضافة مقال
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">✍️</div>
          <div className="text-slate-400 mb-4">لا توجد مقالات بعد</div>
          <button onClick={openAdd} className="text-blue-600 text-sm font-bold hover:underline">+ أضف أول مقال</button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-3">
              {/* صف أول: صورة + عنوان */}
              <div className="flex items-start gap-3 mb-2">
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">✍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-bold text-sm line-clamp-2 leading-snug">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a.category}</span>
                    {a.authorName && <span className="text-slate-400 text-xs">✍️ {a.authorName}</span>}
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (a.published ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400")}>
                      {a.published ? "منشور" : "مسودة"}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(a.publishedAt).toLocaleDateString("ar-YE")}</span>
                  </div>
                </div>
              </div>
              {/* صف ثاني: أزرار */}
              <div className="flex gap-2 border-t border-slate-100 pt-2">
                <a href={`/articles/${a.id}`} target="_blank"
                  className="flex-1 text-center text-slate-500 text-xs py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  عرض
                </a>
                <button onClick={() => openEdit(a)}
                  className="flex-1 text-slate-600 text-xs py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => setDelId(a.id)}
                  className="flex-1 text-red-500 text-xs py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة/تعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing ? "تعديل المقال" : "مقال جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* العنوان */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">العنوان <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: genSlug(e.target.value) })} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>

              {/* الكاتب + التصنيف */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">الكاتب</label>
                  <input value={form.authorName} onChange={e => setForm({ ...form, authorName: e.target.value })}
                    placeholder="اسم الكاتب"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">التصنيف</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* المقتطف */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">المقتطف (اختياري)</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2}
                  placeholder="ملخص قصير يظهر في قائمة المقالات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>

              {/* المحتوى */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">المحتوى <span className="text-red-500">*</span></label>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={10} required
                  placeholder="اكتب المقال هنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>

              {/* الصورة */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الصورة الرئيسية</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                <div className="flex gap-2">
                  <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..." dir="ltr"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 font-mono" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? "..." : "رفع ↑"}
                  </button>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.imageUrl} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* الحالة */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={form.published}
                  onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="published" className="text-slate-700 text-sm">نشر المقال (إلغاء التحديد = مسودة)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "نشر المقال"}
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

      {/* تأكيد الحذف */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDelId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-slate-900 font-bold mb-2">حذف المقال؟</h3>
            <p className="text-slate-500 text-sm mb-5">هذا الإجراء لا يمكن التراجع عنه</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">إلغاء</button>
              <button onClick={() => handleDelete(delId)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
