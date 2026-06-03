"use client";
import dynamic from "next/dynamic";
import MediaPicker from "@/components/MediaPicker";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect, useRef } from "react";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

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
  tags?: string;
  scheduledAt?: string;
  metaDescription?: string;
};

const CATEGORIES = ["رأي", "تحليل", "ثقافة", "تراث", "متنوع"];

const empty = {
  title: "", slug: "", body: "", excerpt: "", imageUrl: "",
  authorName: "", category: "رأي", published: true,
  tags: "", scheduledAt: "", metaDescription: "",
};

function genSlug(title: string) {
  return title.trim().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "").toLowerCase();
}

function wordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, readTime: Math.max(1, Math.ceil(words / 200)) };
}

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  usePermission("articles");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    setShowPreview(false);
  }

  function openEdit(a: Article) {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      body: a.body,
      excerpt: a.excerpt || "",
      imageUrl: a.imageUrl || "",
      authorName: a.authorName || "",
      category: a.category,
      published: a.published,
      tags: a.tags || "",
      scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : "",
      metaDescription: a.metaDescription || "",
    });
    setShowForm(true);
    setShowPreview(false);
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
    const payload = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/articles", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    await fetch("/api/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDelId(null);
    load();
  }

  const { words, readTime } = wordCount(form.body);

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
                    {a.tags && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">{a.tags.split(",")[0]}</span>}
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (a.published ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400")}>
                      {a.published ? "منشور" : "مسودة"}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(a.publishedAt).toLocaleDateString("ar-YE")}</span>
                  </div>
                </div>
              </div>
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
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing ? "تعديل المقال" : "مقال جديد"}</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowPreview(v => !v)}
                  className="text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                  {showPreview ? "تعديل" : "معاينة"}
                </button>
                <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
              </div>
            </div>

            {/* معاينة */}
            {showPreview ? (
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 min-h-64">
                {form.imageUrl && <img src={form.imageUrl} alt={form.title} className="w-full max-h-64 object-cover rounded-xl mb-4" />}
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{form.category}</span>
                  {!form.published && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">مسودة</span>}
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">{form.title || "بدون عنوان"}</h1>
                {form.authorName && <p className="text-slate-500 text-sm mb-3">✍️ {form.authorName}</p>}
                {form.excerpt && <p className="text-slate-600 border-r-4 border-slate-300 pr-3 mb-4 italic">{form.excerpt}</p>}
                <div
                  className="text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.body }}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* العنوان */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">العنوان <span className="text-red-500">*</span></label>
                  <input value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value, slug: genSlug(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Slug (رابط المقال)</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    dir="ltr" placeholder="article-slug"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400" />
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

                {/* الوسوم */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">الوسوم (tags) — مفصولة بفاصلة</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="يمن، إذاعة، ثقافة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>

                {/* المقتطف */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">المقتطف (اختياري)</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2}
                    placeholder="ملخص قصير يظهر في قائمة المقالات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                </div>

                {/* وصف SEO */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وصف SEO (metaDescription)</label>
                  <textarea value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} rows={2}
                    maxLength={160}
                    placeholder="وصف قصير للمحركات (160 حرف كحد أقصى)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                  <div className="text-xs text-slate-400 mt-1 text-left" dir="ltr">{form.metaDescription.length}/160</div>
                </div>

                {/* المحتوى */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 text-sm font-medium">المحتوى <span className="text-red-500">*</span></label>
                    <span className="text-xs text-slate-400">{words} كلمة · ~{readTime} دقيقة</span>
                  </div>
                  <RichTextEditor
                    value={form.body}
                    onChange={body => setForm(f => ({ ...f, body }))}
                    placeholder="اكتب المقال هنا..."
                    minHeight={320}
                  />
                </div>

                {/* الصورة */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">الصورة الرئيسية</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..." dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 font-mono mb-2" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {uploading ? "جاري الرفع..." : "📤 رفع صورة"}
                    </button>
                    <button type="button" onClick={() => setShowPicker(true)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200">
                      🖼️ من المكتبة
                    </button>
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.imageUrl} alt="معاينة" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* جدولة النشر */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">جدولة النشر (اختياري)</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
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
            )}
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

      {showPicker && (
        <MediaPicker
          onSelect={url => setForm(f => ({ ...f, imageUrl: url }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
