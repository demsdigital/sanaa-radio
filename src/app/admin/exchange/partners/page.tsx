"use client";

import MediaPicker from "@/components/MediaPicker";
import { useEffect, useRef, useState } from "react";

type Partner = {
  id: number;
  name: string;
  country: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  name: "",
  country: "",
  logoUrl: "",
  websiteUrl: "",
  description: "",
  sortOrder: "0",
  active: true,
};

export default function ExchangePartnersAdminPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<Partner | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/exchange/partners");
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

  function openEdit(item: Partner) {
    setEditing(item);

    setForm({
      name: item.name || "",
      country: item.country || "",
      logoUrl: item.logoUrl || "",
      websiteUrl: item.websiteUrl || "",
      description: item.description || "",
      sortOrder: String(item.sortOrder || 0),
      active: item.active,
    });

    setShowForm(true);
  }

  function f(key: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة فقط");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      f("logoUrl", data.url);
    } catch {
      alert("فشل رفع الشعار");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";

    const payload = editing
      ? { ...form, id: editing.id }
      : form;

    await fetch("/api/exchange/partners", {
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

    await fetch("/api/exchange/partners", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    await load();
  }

  async function toggleActive(item: Partner) {
    await fetch("/api/exchange/partners", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        active: !item.active,
      }),
    });

    await load();
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">
            الهيئات والشركاء
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            {items.length} جهة أو هيئة
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          + إضافة جهة
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">
          جاري التحميل...
        </div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-center py-20">
          لا توجد جهات بعد
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {item.logoUrl ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-contain border border-slate-100 bg-white p-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                    🏛️
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="font-black text-slate-900">
                    {item.name}
                  </h2>

                  {item.country && (
                    <div className="text-sm text-slate-500 mt-1">
                      {item.country}
                    </div>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="mt-5 text-sm text-slate-600 leading-8">
                  {item.description}
                </p>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 text-xs py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                >
                  تعديل
                </button>

                <button
                  onClick={() => toggleActive(item)}
                  className="flex-1 text-xs py-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"
                >
                  {item.active ? "إخفاء" : "إظهار"}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 text-xs py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg">
                {editing ? "تعديل جهة" : "إضافة جهة"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  اسم الجهة
                </label>

                <input
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    الدولة
                  </label>

                  <input
                    value={form.country}
                    onChange={(e) => f("country", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">
                  شعار الجهة
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogo(file);
                  }}
                />

                <div className="flex gap-3 flex-wrap">
                  <input
                    value={form.logoUrl}
                    onChange={(e) => f("logoUrl", e.target.value)}
                    dir="ltr"
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 rounded-lg bg-blue-600 text-white text-sm font-bold"
                  >
                    {uploading ? "جاري الرفع..." : "رفع شعار"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="px-4 rounded-lg bg-slate-900 text-white text-sm font-bold"
                  >
                    اختيار
                  </button>
                </div>

                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt=""
                    className="mt-4 w-24 h-24 object-contain rounded-2xl border border-slate-200 p-2 bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  رابط الموقع
                </label>

                <input
                  value={form.websiteUrl}
                  onChange={(e) => f("websiteUrl", e.target.value)}
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الوصف
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
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
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold"
                >
                  حفظ
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-bold"
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
            f("logoUrl", url);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
