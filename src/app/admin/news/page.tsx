"use client";
import MediaPicker from "@/components/MediaPicker";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect, useRef } from "react";

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
    usePermission("news");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState(emptyForm);

  // حالة رفع الصورة
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<keyof typeof form | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openPicker(field: keyof typeof form) {
    setPickerTarget(field);
    setShowPicker(true);
  }

  function openPicker(field: keyof typeof form) {
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

  async function handleImageUpload(file: File) {
    if (!file) return;
    // التحقق من النوع
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة فقط");
      return;
    }
    // التحقق من الحجم (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن لا يتجاوز 5 ميغابايت");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // محاكاة progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 15, 85));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("فشل الرفع");
      const { url } = await res.json();
      clearInterval(progressInterval);
      setUploadProgress(100);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    } catch {
      clearInterval(progressInterval);
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

  const f = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
              {/* صف أول: صورة + عنوان + معلومات */}
              <div className="flex items-start gap-3 mb-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">📰</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-bold text-sm line-clamp-2 leading-snug mb-1">{item.title}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 text-xs">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</span>
                    {item.sourceLabel && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.sourceLabel}</span>}
                    {item.youtubeUrl && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">▶ يوتيوب</span>}
                    {item.tweetUrl && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">𝕏</span>}
                  </div>
                </div>
              </div>
              {/* صف ثاني: أزرار */}
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
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">
                {editing ? "تعديل الخبر" : "إضافة خبر جديد"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* العنوان */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  عنوان الخبر <span className="text-red-500">*</span>
                </label>
                <input value={form.title} onChange={(e) => f("title", e.target.value)} required
                  placeholder="أدخل عنوان الخبر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>

              {/* نص الخبر */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  نص الخبر <span className="text-red-500">*</span>
                </label>
                <textarea value={form.body} onChange={(e) => f("body", e.target.value)} required rows={6}
                  placeholder="اكتب تفاصيل الخبر هنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none" />
              </div>

              {/* المصدر */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم المصدر</label>
                  <input value={form.sourceLabel} onChange={(e) => f("sourceLabel", e.target.value)}
                    placeholder="مثال: وكالة سبأ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط المصدر</label>
                  <input value={form.sourceUrl} onChange={(e) => f("sourceUrl", e.target.value)}
                    placeholder="https://..." type="url" dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* ===== رفع الصورة ===== */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">🖼 صورة الخبر</label>

                {/* منطقة الرفع */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload(file);
                  }}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    uploading
                      ? "border-blue-300 bg-blue-50 cursor-wait"
                      : form.imageUrl
                      ? "border-green-300 bg-green-50 hover:border-green-400"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />

                  {uploading ? (
                    <div className="space-y-3">
                      <div className="text-blue-600 font-medium text-sm">جاري الرفع إلى Cloudflare R2...</div>
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-blue-400 text-xs">{uploadProgress}%</div>
                    </div>
                  ) : form.imageUrl ? (
                    <div className="space-y-3">
                      <img src={form.imageUrl} alt="معاينة"
                        className="mx-auto max-h-40 rounded-lg object-contain border border-green-200" />
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

                {/* أزرار إضافية */}
                <div className="flex items-center gap-3 mt-2">
                  <button type="button" onClick={() => openPicker("imageUrl")}
                    className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1">
                    🖼️ اختر من المكتبة
                  </button>
                  {form.imageUrl && !uploading && (
                    <button type="button"
                      onClick={() => { setForm((p) => ({ ...p, imageUrl: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-red-500 text-xs hover:text-red-700 transition-colors">
                      × حذف الصورة
                    </button>
                  )}
                </div>
              </div>

              {/* يوتيوب */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">▶ رابط فيديو يوتيوب</label>
                <input value={form.youtubeUrl} onChange={(e) => f("youtubeUrl", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..." type="url" dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>

              {/* تغريدة */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">𝕏 رابط تغريدة</label>
                <input value={form.tweetUrl} onChange={(e) => f("tweetUrl", e.target.value)}
                  placeholder="https://x.com/user/status/..." type="url" dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
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
          </div>
        </div>
      )}
      {showPicker && pickerTarget && (
        <MediaPicker
          onSelect={url => setForm(f => ({ ...f, [pickerTarget]: url }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}