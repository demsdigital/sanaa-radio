"use client";

import MediaPicker from "@/components/MediaPicker";
import { useEffect, useRef, useState } from "react";

type ExchangeItem = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  fileUrl: string | null;
  category: string;
  producer: string | null;
  duration: number | null;
  downloadable: boolean;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  audioUrl: "",
  fileUrl: "",
  category: "program",
  producer: "",
  duration: "",
  downloadable: false,
  featured: false,
  published: true,
  sortOrder: "0",
};

export default function ExchangeItemsAdminPage() {
  const [items, setItems] = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [editing, setEditing] = useState<ExchangeItem | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/exchange/items");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: ExchangeItem) {
    setEditing(item);

    setForm({
      title: item.title || "",
      slug: item.slug || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      audioUrl: item.audioUrl || "",
      fileUrl: item.fileUrl || "",
      category: item.category || "program",
      producer: item.producer || "",
      duration: item.duration ? String(item.duration) : "",
      downloadable: item.downloadable,
      featured: item.featured,
      published: item.published,
      sortOrder: String(item.sortOrder || 0),
    });

    setShowForm(true);
  }

  function f(key: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(
    file: File,
    target: "imageUrl" | "audioUrl"
  ) {
    if (target === "imageUrl") setUploadingImage(true);
    if (target === "audioUrl") setUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      f(target, data.url);
    } catch {
      alert("فشل الرفع");
    } finally {
      setUploadingImage(false);
      setUploadingAudio(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";

    const payload = editing
      ? { ...form, id: editing.id }
      : form;

    await fetch("/api/exchange/items", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setShowForm(false);

    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد؟")) return;

    await fetch("/api/exchange/items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    await load();
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            مواد التبادل البرامجي
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {items.length} مادة
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          + إضافة مادة
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          جاري التحميل...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          لا توجد مواد بعد
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-52 object-cover bg-slate-100"
                />
              ) : (
                <div className="w-full h-52 bg-slate-100 flex items-center justify-center text-5xl">
                  🎙️
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                    {item.category}
                  </span>

                  {item.featured && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black">
                      مميزة
                    </span>
                  )}

                  {!item.published && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black">
                      مخفية
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black">
                  {item.title}
                </h2>

                {item.description && (
                  <p className="mt-3 text-slate-600 text-sm leading-8 line-clamp-3">
                    {item.description}
                  </p>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 border border-slate-200 rounded-xl py-2 text-sm"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 border border-red-200 text-red-500 rounded-xl py-2 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex items-start justify-center">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">
                {editing ? "تعديل مادة" : "إضافة مادة"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  العنوان
                </label>

                <input
                  value={form.title}
                  onChange={(e) => {
                    f("title", e.target.value);

                    if (!editing) {
                      f("slug", slugify(e.target.value));
                    }
                  }}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    الرابط المختصر
                  </label>

                  <input
                    value={form.slug}
                    onChange={(e) => f("slug", e.target.value)}
                    required
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    التصنيف
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) => f("category", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  >
                    <option value="program">برنامج</option>
                    <option value="news">مادة إخبارية</option>
                    <option value="report">تقرير</option>
                    <option value="special">خاص</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الوصف
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الصورة
                </label>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "imageUrl");
                  }}
                />

                <div className="flex gap-3 flex-wrap">
                  <input
                    value={form.imageUrl}
                    onChange={(e) => f("imageUrl", e.target.value)}
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 rounded-xl bg-blue-600 text-white text-sm font-bold"
                  >
                    {uploadingImage ? "جاري الرفع..." : "رفع صورة"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="px-4 rounded-xl bg-slate-900 text-white text-sm font-bold"
                  >
                    اختيار
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الملف الصوتي
                </label>

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "audioUrl");
                  }}
                />

                <div className="flex gap-3 flex-wrap">
                  <input
                    value={form.audioUrl}
                    onChange={(e) => f("audioUrl", e.target.value)}
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold"
                  >
                    {uploadingAudio ? "جاري الرفع..." : "رفع صوت"}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المنتج
                  </label>

                  <input
                    value={form.producer}
                    onChange={(e) => f("producer", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    المدة (ثانية)
                  </label>

                  <input
                    value={form.duration}
                    onChange={(e) => f("duration", e.target.value)}
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => f("featured", e.target.checked)}
                  />
                  مادة مميزة
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.downloadable}
                    onChange={(e) => f("downloadable", e.target.checked)}
                  />
                  قابلة للتحميل
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => f("published", e.target.checked)}
                  />
                  منشورة
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black"
                >
                  حفظ
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-black"
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
