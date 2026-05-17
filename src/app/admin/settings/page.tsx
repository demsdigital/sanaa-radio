"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    ticker: "",
    whatsapp: "",
    satellite_freq: "12182",
    satellite_name: "عرب سات بدر 4",
    satellite_position: "16° شرقاً",
    satellite_polarization: "أفقي (H)",
    shortwave: "11860",
  });

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setForm(f => ({ ...f, ...data }));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(key: string, value: string) {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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

  if (loading) return <div className="text-gray-500 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">الإعدادات</h1>
          <p className="text-gray-500 text-sm mt-1">إعدادات الموقع العامة</p>
        </div>
        {saved && <span className="text-green-400 text-sm">✓ تم الحفظ</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Ticker */}
        <div className="bg-[#0e0e18] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4">الشريط الإخباري</h2>
          <div>
            <label className="block text-gray-400 text-sm mb-2">نص الشريط</label>
            <textarea
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value })}
              rows={3}
              className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]"
              placeholder="إذاعة الجمهورية اليمنية — البرنامج العام..."
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-[#0e0e18] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4">التواصل</h2>
          <div>
            <label className="block text-gray-400 text-sm mb-2">رقم واتساب</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              dir="ltr"
              className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]"
              placeholder="9671234567"
            />
          </div>
        </div>

        {/* Satellite */}
        <div className="bg-[#0e0e18] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4">بيانات القمر الصناعي</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">تردد الفضائية (MHz)</label>
              <input value={form.satellite_freq} onChange={(e) => setForm({ ...form, satellite_freq: e.target.value })} dir="ltr" className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">اسم القمر</label>
              <input value={form.satellite_name} onChange={(e) => setForm({ ...form, satellite_name: e.target.value })} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">الموضع المداري</label>
              <input value={form.satellite_position} onChange={(e) => setForm({ ...form, satellite_position: e.target.value })} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">الاستقطاب</label>
              <input value={form.satellite_polarization} onChange={(e) => setForm({ ...form, satellite_polarization: e.target.value })} className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">الموجة القصيرة (كيلو هيرتز)</label>
              <input value={form.shortwave} onChange={(e) => setForm({ ...form, shortwave: e.target.value })} dir="ltr" className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6]" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-[#1a4fd6] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1a4fd6]/90 transition-colors disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
