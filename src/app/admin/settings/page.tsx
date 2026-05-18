"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    ticker: "",
    ticker_visible: "true",
    whatsapp: "",
    satellite_freq: "12182",
    satellite_name: "عرب سات بدر 4",
    satellite_position: "16° شرقاً",
    satellite_polarization: "أفقي (H)",
    shortwave: "11860",
    section_programs: "true",
    section_schedule: "true",
    section_news: "true",
    section_satellite: "true",
    section_contact: "true",
    show_listen_btn: "true",
    on_air_label: "نشرة الأخبار الرئيسية",
  });

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setForm(f => ({ ...f, ...data }));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await Promise.all(Object.entries(form).map(([key, value]) =>
      fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) })
    ));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function Toggle({ label, field }: { label: string; field: keyof typeof form }) {
    const isOn = form[field] === "true";
    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="text-slate-800 text-sm">{label}</span>
        <button
          type="button"
          onClick={() => setForm({ ...form, [field]: isOn ? "false" : "true" })}
          className={`w-12 h-6 rounded-full transition-colors relative ${isOn ? "bg-blue-600" : "bg-gray-700"}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isOn ? "right-1" : "left-1"}`} />
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-slate-800 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الإعدادات</h1>
          <p className="text-slate-800 text-sm mt-1">إعدادات الموقع العامة</p>
        </div>
        {saved && <span className="text-green-400 text-sm font-medium">✓ تم الحفظ</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* أقسام الموقع */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">أقسام الموقع</h2>
          <p className="text-slate-800 text-xs mb-4">تحكم في إظهار وإخفاء كل قسم في الموقع</p>
          <Toggle label="قسم البرامج" field="section_programs" />
          <Toggle label="قسم الجدول" field="section_schedule" />
          <Toggle label="قسم الأخبار" field="section_news" />
          <Toggle label="قسم عبر القمر" field="section_satellite" />
          <Toggle label="قسم التواصل / واتساب" field="section_contact" />
        </div>

        {/* الرئيسية */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">الصفحة الرئيسية</h2>
          <Toggle label="إظهار زر الاستماع" field="show_listen_btn" />
          <div className="mt-4">
            <label className="block text-slate-800 text-sm mb-2">البرنامج الحالي على الهواء</label>
            <input
              value={form.on_air_label}
              onChange={(e) => setForm({ ...form, on_air_label: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
              placeholder="نشرة الأخبار الرئيسية"
            />
          </div>
        </div>

        {/* الشريط الإخباري */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">الشريط الإخباري</h2>
          <Toggle label="إظهار الشريط" field="ticker_visible" />
          <div className="mt-4">
            <label className="block text-slate-800 text-sm mb-2">نص الشريط</label>
            <textarea
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
              placeholder="إذاعة الجمهورية اليمنية — البرنامج العام..."
            />
          </div>
        </div>

        {/* التواصل */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">التواصل</h2>
          <div>
            <label className="block text-slate-800 text-sm mb-2">رقم واتساب</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
              placeholder="9671234567"
            />
          </div>
        </div>

        {/* القمر */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">بيانات القمر الصناعي</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 text-sm mb-2">تردد الفضائية (MHz)</label>
              <input value={form.satellite_freq} onChange={(e) => setForm({ ...form, satellite_freq: e.target.value })} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-slate-800 text-sm mb-2">اسم القمر</label>
              <input value={form.satellite_name} onChange={(e) => setForm({ ...form, satellite_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-slate-800 text-sm mb-2">الموضع المداري</label>
              <input value={form.satellite_position} onChange={(e) => setForm({ ...form, satellite_position: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-slate-800 text-sm mb-2">الاستقطاب</label>
              <input value={form.satellite_polarization} onChange={(e) => setForm({ ...form, satellite_polarization: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-slate-800 text-sm mb-2">الموجة القصيرة (كيلو هيرتز)</label>
              <input value={form.shortwave} onChange={(e) => setForm({ ...form, shortwave: e.target.value })} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-blue-600 text-slate-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-600/90 transition-colors disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
