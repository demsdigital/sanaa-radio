"use client";
import { useState, useEffect, useRef } from "react";

type MediaItem = {
  id: number;
  filename: string;
  url: string;
  uploadedBy: number;
  createdAt: string;
};

type Me = { id: number; role: string };

export default function MediaPage() {
  const [items, setItems]       = useState<MediaItem[]>([]);
  const [me, setMe]             = useState<Me | null>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [copied, setCopied]     = useState<number | null>(null);
  const fileRef                 = useRef<HTMLInputElement>(null);

  async function load() {
    const [itemsRes, meRes] = await Promise.all([
      fetch("/api/media").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]);
    setItems(itemsRes);
    setMe(meRes);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleUpload() {
    if (!filename.trim()) { alert("أدخل اسماً وصفياً للصورة"); return; }
    if (!previewUrl) { alert("اختر صورة أولاً"); return; }
    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: filename.trim(), url: previewUrl }),
    });
    setFilename(""); setPreviewUrl(""); setShowUpload(false);
    load();
  }

  async function handleFileSelect(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setPreviewUrl(url);
    setUploading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه الصورة؟")) return;
    await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = items.filter(i =>
    i.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">مكتبة الصور</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} صورة</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + رفع صورة جديدة
        </button>
      </div>

      {/* نموذج الرفع */}
      {showUpload && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 mb-6">
          <h2 className="text-slate-900 font-bold mb-4">رفع صورة جديدة</h2>
          <div className="space-y-4">
            {/* اسم الصورة — إجباري */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                اسم الصورة <span className="text-red-500">*</span>
                <span className="text-slate-400 text-xs font-normal mr-1">(يساعد في البحث لاحقاً)</span>
              </label>
              <input value={filename} onChange={e => setFilename(e.target.value)}
                placeholder="مثال: الرئيس العليمي خلال اجتماع مجلس القيادة"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>

            {/* رفع الملف */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">الصورة <span className="text-red-500">*</span></label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              <div onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  previewUrl ? "border-green-300 bg-green-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"
                }`}>
                {uploading ? (
                  <div className="text-blue-600 text-sm">جاري الرفع...</div>
                ) : previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="معاينة" className="mx-auto h-32 rounded-lg object-cover mb-2" />
                    <div className="text-green-600 text-sm font-medium">✓ تم الرفع — اضغط لتغيير الصورة</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">🖼️</div>
                    <div className="text-slate-600 text-sm">اضغط لاختيار صورة</div>
                    <div className="text-slate-400 text-xs mt-1">PNG, JPG, WEBP</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleUpload} disabled={uploading || !previewUrl || !filename.trim()}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                حفظ في المكتبة
              </button>
              <button onClick={() => { setShowUpload(false); setFilename(""); setPreviewUrl(""); }}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* بحث */}
      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث باسم الصورة..."
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>

      {/* الشبكة */}
      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">🖼️</div>
          <div className="text-slate-400">{search ? "لا توجد نتائج" : "لا توجد صور بعد"}</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all">
              {/* الصورة */}
              <div className="h-40 overflow-hidden bg-slate-50 relative">
                <img src={item.url} alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {/* أزرار على hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(item.id, item.url)}
                    className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                    {copied === item.id ? "✓ تم النسخ" : "نسخ الرابط"}
                  </button>
                  {(me?.role === "admin" || me?.id === item.uploadedBy) && (
                    <button onClick={() => handleDelete(item.id)}
                      className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                      حذف
                    </button>
                  )}
                </div>
              </div>
              {/* المعلومات */}
              <div className="p-3">
                <div className="text-slate-800 text-xs font-medium line-clamp-2 leading-snug">{item.filename}</div>
                <div className="text-slate-400 text-xs mt-1">
                  {new Date(item.createdAt).toLocaleDateString("ar-YE")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
