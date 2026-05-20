"use client";

import MediaPicker from "@/components/MediaPicker";
import { useEffect, useRef, useState } from "react";

type Report = {
  id: number;
  title: string;
  year: number | null;
  description: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  title: "",
  year: "",
  description: "",
  imageUrl: "",
  fileUrl: "",
  sortOrder: "0",
  active: true,
};

export default function ExchangeReportsAdminPage() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/exchange/reports");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: Report) {
    setEditing(item);

    setForm({
      title: item.title || "",
      year: item.year ? String(item.year) : "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      fileUrl: item.fileUrl || "",
      sortOrder: String(item.sortOrder || 0),
      active: item.active,
    });

    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;

    await fetch("/api/exchange/reports", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowForm(false);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف التقرير؟")) return;

    await fetch("/api/exchange/reports", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await load();
  }

  async function toggleActive(item: Report) {
    await fetch("/api/exchange/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, active: !item.active }),
    });

    await load();
  }

  function f(key: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File, target: "imageUrl" | "fileUrl") {
    if (target === "imageUrl" && !file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة فقط");
      return;
    }

    if (target === "fileUrl" && file.type !== "application/pdf") {
      alert("يرجى اختيار ملف PDF فقط");
      return;
    }

    if (target === "imageUrl" && file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن لا يتجاوز 5MB");
      return;
    }

    if (target === "fileUrl" && file.size > 25 * 1024 * 1024) {
      alert("حجم ملف PDF يجب أن لا يتجاوز 25MB");
      return;
    }

    target === "imageUrl" ? setUploadingImage(true) : setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "فشل الرفع");
      }

      const data = await res.json();
      f(target, data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "فشل الرفع");
    } finally {
      target === "imageUrl" ? setUploadingImage(false) : setUploadingPdf(false);
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">
            التقارير والصور الرسمية
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            {items.length} تقرير أو ملف
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          + إضافة تقرير
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">
          جاري التحميل...
        </div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-center py-20">
          لا توجد تقارير بعد
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${
                item.active ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-44 object-cover bg-slate-100"
                />
              ) : (
                <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-4xl">
                  📑
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.active
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.active ? "ظاهر" : "مخفي"}
                  </span>

                  {item.year && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {item.year}
                    </span>
                  )}
                </div>

                <h2 className="font-black text-slate-900">
                  {item.title}
                </h2>

                {item.description && (
                  <p className="mt-3 text-sm text-slate-600 leading-7 line-clamp-3">
                    {item.description}
                  </p>
                )}

                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    className="inline-flex mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    فتح الملف ↗
                  </a>
                )}

                <div className="flex gap-2 border-t border-slate-100 pt-4 mt-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 text-slate-600 text-xs py-2 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => toggleActive(item)}
                    className="flex-1 text-amber-600 text-xs py-2 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    {item.active ? "إخفاء" : "إظهار"}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-red-500 text-xs py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">
                {editing ? "تعديل تقرير" : "إضافة تقرير"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  عنوان التقرير
                </label>

                <input
                  value={form.title}
                  onChange={(e) => f("title", e.target.value)}
                  required
                  placeholder="مثال: تكريم اتحاد إذاعات الدول العربية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    السنة
                  </label>

                  <input
                    value={form.year}
                    onChange={(e) => f("year", e.target.value)}
                    type="number"
                    placeholder="2020"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    الترتيب
                  </label>

                  <input
                    value={form.sortOrder}
                    onChange={(e) => f("sortOrder", e.target.value)}
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  الوصف
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={4}
                  placeholder="تفاصيل التقرير أو التكريم"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  صورة التقرير / التكريم
                </label>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "imageUrl");
                    e.currentTarget.value = "";
                  }}
                />

                <div className="flex gap-3 flex-wrap">
                  <input
                    value={form.imageUrl}
                    onChange={(e) => f("imageUrl", e.target.value)}
                    placeholder="رابط الصورة"
                    dir="ltr"
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-60"
                  >
                    {uploadingImage ? "جاري الرفع..." : "رفع صورة"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="px-4 rounded-lg bg-slate-900 text-white text-sm font-bold"
                  >
                    اختيار من المكتبة
                  </button>
                </div>

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="mt-3 w-full h-44 object-cover rounded-xl border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  ملف التقرير PDF
                </label>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "fileUrl");
                    e.currentTarget.value = "";
                  }}
                />

                <div className="flex gap-3 flex-wrap">
                  <input
                    value={form.fileUrl}
                    onChange={(e) => f("fileUrl", e.target.value)}
                    placeholder="رابط PDF أو ارفعه مباشرة"
                    dir="ltr"
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="px-4 rounded-lg bg-violet-600 text-white text-sm font-bold disabled:opacity-60"
                  >
                    {uploadingPdf ? "جاري الرفع..." : "رفع PDF"}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => f("active", e.target.checked)}
                />
                إظهار في الصفحة العامة
              </label>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  حفظ
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPicker && (
        <MediaPicker
          onSelect={(url) => {
            f("imageUrl", url);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
