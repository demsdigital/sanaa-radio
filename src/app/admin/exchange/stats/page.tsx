"use client";

import { useEffect, useState } from "react";

type Stat = {
  id: number;
  label: string;
  value: string;
  suffix: string | null;
  year: number | null;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  label: "",
  value: "",
  suffix: "",
  year: "",
  description: "",
  sortOrder: "0",
  active: true,
};

export default function ExchangeStatsAdminPage() {
  const [items, setItems] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/exchange/stats");
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

  function openEdit(item: Stat) {
    setEditing(item);
    setForm({
      label: item.label || "",
      value: item.value || "",
      suffix: item.suffix || "",
      year: item.year ? String(item.year) : "",
      description: item.description || "",
      sortOrder: String(item.sortOrder || 0),
      active: item.active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;

    await fetch("/api/exchange/stats", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowForm(false);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا الرقم؟")) return;

    await fetch("/api/exchange/stats", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await load();
  }

  async function toggleActive(item: Stat) {
    await fetch("/api/exchange/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, active: !item.active }),
    });

    await load();
  }

  function f(key: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">
            إحصائيات التبادل البرامجي
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {items.length} عنصر إحصائي
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          + إضافة إحصائية
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-center py-20">
          لا توجد إحصائيات بعد
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm ${
                item.active ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl font-black text-blue-700">
                    {item.value}
                    {item.suffix || ""}
                  </div>
                  <div className="mt-2 font-bold text-slate-900">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.active
                      ? "bg-green-50 text-green-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.active ? "ظاهر" : "مخفي"}
                </span>
              </div>

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
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">
                {editing ? "تعديل إحصائية" : "إضافة إحصائية"}
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
                  العنوان <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.label}
                  onChange={(e) => f("label", e.target.value)}
                  required
                  placeholder="مثال: بندًا برامجيًا"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    الرقم / القيمة <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.value}
                    onChange={(e) => f("value", e.target.value)}
                    required
                    placeholder="720 أو الأول"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    لاحقة اختيارية
                  </label>
                  <input
                    value={form.suffix}
                    onChange={(e) => f("suffix", e.target.value)}
                    placeholder="+ أو %"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    السنة
                  </label>
                  <input
                    value={form.year}
                    onChange={(e) => f("year", e.target.value)}
                    type="number"
                    placeholder="2020"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white"
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
                  rows={3}
                  placeholder="وصف مختصر يظهر تحت الرقم"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => f("active", e.target.checked)}
                />
                إظهار هذه الإحصائية في الصفحة العامة
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
    </div>
  );
}
