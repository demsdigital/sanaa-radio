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
    // المشغّل الصوتي
    show_player: "false",
    stream_url: "",
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
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
    ));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const f = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  function Toggle({ label, field, desc }: { label: string; field: keyof typeof form; desc?: string }) {
    const isOn = form[field] === "true";
    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div>
          <span className="text-slate-800 text-sm font-medium">{label}</span>
          {desc && <div className="text-slate-400 text-xs mt-0.5">{desc}</div>}
        </div>
        <button
          type="button"
          onClick={() => f(field, isOn ? "false" : "true")}
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isOn ? "bg-blue-600" : "bg-slate-200"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isOn ? "right-1" : "left-1"}`} />
        </button>
      </div>
    );
  }

  function Input({ label, field, placeholder, dir = "rtl", type = "text" }: {
    label: string; field: keyof typeof form; placeholder?: string; dir?: "rtl" | "ltr"; type?: string;
  }) {
    return (
      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1.5">{label}</label>
        <input
          type={type}
          value={form[field]}
          onChange={(e) => f(field, e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
      </div>
    );
  }

  if (loading) return (
    <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الإعدادات</h1>
          <p className="text-slate-500 text-sm mt-1">إعدادات الموقع العامة</p>
        </div>
        {saved && (
          <span className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            ✓ تم الحفظ
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* ===== المشغّل الصوتي ===== */}
        <div className="bg-white border-2 border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎙️</span>
            <h2 className="text-slate-900 font-bold">المشغّل الصوتي المباشر</h2>
          </div>
          <p className="text-slate-400 text-xs mb-5">يظهر شريط ثابت أسفل الموقع للاستماع المباشر</p>

          <Toggle
            label="إظهار المشغّل الصوتي"
            field="show_player"
            desc="أخفِه حتى تحصل على رابط البث"
          />

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                رابط البث المباشر (Stream URL)
              </label>
              <input
                type="url"
                value={form.stream_url}
                onChange={(e) => f("stream_url", e.target.value)}
                placeholder="https://stream.example.com/radio.mp3"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors font-mono"
              />
              <p className="text-slate-400 text-xs mt-1.5">
                يدعم: MP3 • AAC • Icecast • HLS (.m3u8)
              </p>
            </div>
            <Input
              label="اسم البرنامج الحالي على الهواء"
              field="on_air_label"
              placeholder="نشرة الأخبار الرئيسية"
            />
          </div>

          {form.show_player === "true" && !form.stream_url && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-700 text-sm">
              ⚠️ المشغّل مفعّل لكن رابط البث فارغ — لن يعمل حتى تضع الرابط
            </div>
          )}
          {form.show_player === "true" && form.stream_url && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
              ✓ المشغّل جاهز — سيظهر أسفل الموقع
            </div>
          )}
        </div>

        {/* ===== أقسام الموقع ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-1">أقسام الموقع</h2>
          <p className="text-slate-400 text-xs mb-4">تحكم في إظهار وإخفاء كل قسم</p>
          <Toggle label="قسم البرامج" field="section_programs" />
          <Toggle label="قسم الجدول" field="section_schedule" />
          <Toggle label="قسم الأخبار" field="section_news" />
          <Toggle label="قسم عبر القمر" field="section_satellite" />
          <Toggle label="قسم التواصل / واتساب" field="section_contact" />
          <Toggle label="زر الاستماع للأرشيف" field="show_listen_btn" />
        </div>

        {/* ===== الشريط الإخباري ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">الشريط الإخباري العاجل</h2>
          <Toggle label="إظهار الشريط" field="ticker_visible" />
          <div className="mt-4">
            <label className="block text-slate-700 text-sm font-medium mb-1.5">نص الشريط</label>
            <textarea
              value={form.ticker}
              onChange={(e) => f("ticker", e.target.value)}
              rows={3}
              placeholder="إذاعة الجمهورية اليمنية — البرنامج العام..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        {/* ===== التواصل ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">التواصل</h2>
          <Input label="رقم واتساب" field="whatsapp" placeholder="9671234567" dir="ltr" />
        </div>

        {/* ===== القمر الصناعي ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">بيانات القمر الصناعي</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="تردد الفضائية (MHz)" field="satellite_freq" dir="ltr" />
            <Input label="اسم القمر" field="satellite_name" />
            <Input label="الموضع المداري" field="satellite_position" />
            <Input label="الاستقطاب" field="satellite_polarization" />
            <Input label="الموجة القصيرة (كيلو هيرتز)" field="shortwave" dir="ltr" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
          {saving ? "جاري الحفظ..." : "💾 حفظ الإعدادات"}
        </button>

      </form>
    </div>
  );
}