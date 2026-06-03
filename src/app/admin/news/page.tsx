"use client";
import dynamic from "next/dynamic";
import MediaPicker from "@/components/MediaPicker";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect, useRef } from "react";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

type News = {
  id: number;
  title: string;
  slug?: string;
  body: string;
  imageUrl: string;
  tweetUrl: string;
  youtubeUrl: string;
  sourceLabel: string;
  sourceUrl: string;
  category?: string;
  published?: boolean;
  breaking?: boolean;
  priority?: number;
  editorName?: string;
  newsDate?: string;
  scheduledAt?: string;
  tags?: string;
  metaDescription?: string;
  galleryImages?: string;
  publishedAt: string;
};

const NEWS_CATEGORIES = ["عام", "محلي", "عربي", "دولي", "رياضة", "اقتصاد", "ثقافة", "صحة"];

const emptyForm = {
  title: "",
  slug: "",
  body: "",
  imageUrl: "",
  tweetUrl: "",
  youtubeUrl: "",
  sourceLabel: "",
  sourceUrl: "",
  category: "عام",
  published: true,
  breaking: false,
  priority: 0,
  editorName: "",
  newsDate: "",
  scheduledAt: "",
  tags: "",
  metaDescription: "",
  galleryImages: "",
};

function genSlug(title: string) {
  return title.trim().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "").toLowerCase();
}

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  usePermission("news");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openPicker(field: string) {
    setPickerTarget(field);
    setShowPicker(true);
  }

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
    setShowPreview(false);
  }

  function openEdit(item: News) {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug || "",
      body: item.body,
      imageUrl: item.imageUrl || "",
      tweetUrl: item.tweetUrl || "",
      youtubeUrl: item.youtubeUrl || "",
      sourceLabel: item.sourceLabel || "",
      sourceUrl: item.sourceUrl || "",
      category: item.category || "عام",
      published: item.published ?? true,
      breaking: item.breaking ?? false,
      priority: item.priority ?? 0,
      editorName: item.editorName || "",
      newsDate: item.newsDate ? item.newsDate.slice(0, 16) : "",
      scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : "",
      tags: item.tags || "",
      metaDescription: item.metaDescription || "",
      galleryImages: item.galleryImages || "",
    });
    setShowForm(true);
    setShowPreview(false);
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) { alert("يرجى اختيار صورة فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("حجم الصورة يجب أن لا يتجاوز 5 ميغابايت"); return; }
    setUploading(true);
    setUploadProgress(0);
    const prog = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("فشل الرفع");
      const { url } = await res.json();
      clearInterval(prog);
      setUploadProgress(100);
      setForm(prev => ({ ...prev, imageUrl: url }));
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    } catch {
      clearInterval(prog);
      setUploading(false);
      setUploadProgress(0);
      alert("فشل رفع الصورة، حاول مجدداً");
    }
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

  const f = (key: keyof typeof emptyForm, value: string | boolean | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
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
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-start gap-3 mb-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">📰</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-bold text-sm line-clamp-2 leading-snug mb-1">{item.title}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span>}
                    {item.breaking && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">عاجل</span>}
                    <span className={"text-xs px-2 py-0.5 rounded-full " + ((item.published ?? true) ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400")}>
                      {(item.published ?? true) ? "منشور" : "مسودة"}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</span>
                    {item.sourceLabel && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.sourceLabel}</span>}
                    {item.youtubeUrl && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">▶ يوتيوب</span>}
                    {item.tweetUrl && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">𝕏</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-slate-100 pt-2">
                <button onClick={() => openEdit(item)}
                  className="flex-1 text-slate-600 text-xs py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="flex-1 text-red-500 text-xs py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal الإضافة/التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">
                {editing ? "تعديل الخبر" : "إضافة خبر جديد"}
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowPreview(v => !v)}
                  className="text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                  {showPreview ? "تعديل" : "معاينة"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                  ×
                </button>
              </div>
            </div>

            {/* معاينة */}
            {showPreview ? (
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 min-h-64">
                {form.imageUrl && <img src={form.imageUrl} alt={form.title} className="w-full max-h-64 object-cover rounded-xl mb-4" />}
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{form.category}</span>
                  {form.breaking && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">عاجل</span>}
                  {!form.published && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">مسودة</span>}
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-3">{form.title || "بدون عنوان"}</h1>
                {form.editorName && <p className="text-slate-500 text-sm mb-3">المحرر: {form.editorName}</p>}
                <div
                  className="text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.body }}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* العنوان */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    عنوان الخبر <span className="text-red-500">*</span>
                  </label>
                  <input value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value, slug: genSlug(e.target.value) })}
                    required
                    placeholder="أدخل عنوان الخبر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Slug (رابط الخبر)</label>
                  <input value={form.slug} onChange={e => f("slug", e.target.value)}
                    dir="ltr" placeholder="news-slug"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400" />
                </div>

                {/* التصنيف + المحرر */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">التصنيف</label>
                    <select value={form.category} onChange={e => f("category", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors">
                      {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم المحرر</label>
                    <input value={form.editorName} onChange={e => f("editorName", e.target.value)}
                      placeholder="اسم المحرر"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                  </div>
                </div>

                {/* عاجل + الأولوية */}
                <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.breaking} onChange={e => f("breaking", e.target.checked)}
                      className="w-4 h-4 accent-red-600" />
                    <span className="text-sm text-slate-700 font-medium">خبر عاجل</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">الأولوية:</span>
                    <select value={form.priority} onChange={e => f("priority", Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-sm">
                      <option value={0}>عادي</option>
                      <option value={1}>مهم</option>
                      <option value={2}>أولوية قصوى</option>
                    </select>
                  </div>
                </div>

                {/* الوسوم */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">الوسوم (tags) — مفصولة بفاصلة</label>
                  <input value={form.tags} onChange={e => f("tags", e.target.value)}
                    placeholder="يمن، صنعاء، سياسة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>

                {/* وصف SEO */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وصف SEO (metaDescription)</label>
                  <textarea value={form.metaDescription} onChange={e => f("metaDescription", e.target.value)} rows={2}
                    maxLength={160}
                    placeholder="وصف قصير للمحركات (160 حرف)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none" />
                  <div className="text-xs text-slate-400 mt-1 text-left" dir="ltr">{form.metaDescription.length}/160</div>
                </div>

                {/* نص الخبر */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    نص الخبر <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={form.body}
                    onChange={body => setForm(p => ({ ...p, body }))}
                    placeholder="اكتب تفاصيل الخبر هنا..."
                    minHeight={240}
                  />
                </div>

                {/* المصدر */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم المصدر</label>
                    <input value={form.sourceLabel} onChange={e => f("sourceLabel", e.target.value)}
                      placeholder="مثال: وكالة سبأ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط المصدر</label>
                    <input value={form.sourceUrl} onChange={e => f("sourceUrl", e.target.value)}
                      placeholder="https://..." type="url" dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                  </div>
                </div>

                {/* رفع الصورة */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">صورة الخبر</label>
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleImageUpload(file); }}
                    className={[
                      "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                      uploading ? "border-blue-300 bg-blue-50 cursor-wait"
                        : form.imageUrl ? "border-green-300 bg-green-50 hover:border-green-400"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                    ].join(" ")}>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                    {uploading ? (
                      <div className="space-y-3">
                        <div className="text-blue-600 font-medium text-sm">جاري الرفع...</div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <div className="text-blue-400 text-xs">{uploadProgress}%</div>
                      </div>
                    ) : form.imageUrl ? (
                      <div className="space-y-3">
                        <img src={form.imageUrl} alt="معاينة" className="mx-auto max-h-40 rounded-lg object-contain border border-green-200" />
                        <div className="text-green-600 text-sm font-medium">✓ تم رفع الصورة</div>
                        <div className="text-slate-400 text-xs">اضغط لتغيير الصورة</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">📷</div>
                        <div className="text-slate-600 font-medium text-sm">اسحب الصورة هنا أو اضغط للاختيار</div>
                        <div className="text-slate-400 text-xs">PNG, JPG, WEBP — بحد أقصى 5 ميغابايت</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button type="button" onClick={() => openPicker("imageUrl")}
                      className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1">
                      🖼️ اختر من المكتبة
                    </button>
                    {form.imageUrl && !uploading && (
                      <button type="button"
                        onClick={() => { setForm(p => ({ ...p, imageUrl: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-red-500 text-xs hover:text-red-700 transition-colors">
                        × حذف الصورة
                      </button>
                    )}
                  </div>
                </div>

                {/* صور المعرض */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">صور المعرض (Gallery) — JSON Array أو روابط بفاصلة</label>
                  <textarea value={form.galleryImages} onChange={e => f("galleryImages", e.target.value)} rows={2}
                    placeholder='["https://...", "https://..."] أو رابط1, رابط2'
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none" />
                </div>

                {/* يوتيوب */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">▶ رابط فيديو يوتيوب</label>
                  <input value={form.youtubeUrl} onChange={e => f("youtubeUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..." type="url" dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>

                {/* تغريدة */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">𝕏 رابط تغريدة</label>
                  <input value={form.tweetUrl} onChange={e => f("tweetUrl", e.target.value)}
                    placeholder="https://x.com/user/status/..." type="url" dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>

                {/* تواريخ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">تاريخ الخبر</label>
                    <input type="datetime-local" value={form.newsDate} onChange={e => f("newsDate", e.target.value)}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">جدولة النشر</label>
                    <input type="datetime-local" value={form.scheduledAt} onChange={e => f("scheduledAt", e.target.value)}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                </div>

                {/* الحالة */}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="news-published" checked={form.published}
                    onChange={e => f("published", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="news-published" className="text-slate-700 text-sm">نشر الخبر (إلغاء التحديد = مسودة)</label>
                </div>

                {/* أزرار */}
                <div className="flex gap-3 pt-2">
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
            )}
          </div>
        </div>
      )}

      {showPicker && pickerTarget && (
        <MediaPicker
          onSelect={url => setForm(p => ({ ...p, [pickerTarget]: url }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
