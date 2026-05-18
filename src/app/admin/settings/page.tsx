"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    // موجود
    ticker: "", ticker_visible: "true",
    whatsapp: "",
    satellite_freq: "12182", satellite_name: "عرب سات بدر 4",
    satellite_position: "16° شرقاً", satellite_polarization: "أفقي (H)", shortwave: "11860",
    section_programs: "true", section_schedule: "true", section_news: "true",
    section_satellite: "true", section_contact: "true", show_listen_btn: "true",
    on_air_label: "نشرة الأخبار الرئيسية",
    show_player: "false", stream_url: "",
    // هيرو
    hero_title: "إذاعة الجمهورية اليمنية",
    hero_subtitle: "البرنامج العام",
    hero_tagline: "الصوت الحقيقي منذ عقود",
    hero_badge: "على الهواء الآن",
    hero_bg: "blue",
    // سوشال ميديا
    social_facebook: "", social_twitter: "", social_youtube: "",
    social_telegram: "", social_instagram: "", social_tiktok: "",
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
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const f = (key: keyof typeof form, value: string) => setForm(p => ({ ...p, [key]: value }));

  function Toggle({ label, field, desc }: { label: string; field: keyof typeof form; desc?: string }) {
    const isOn = form[field] === "true";
    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div>
          <div className="text-slate-800 text-sm font-medium">{label}</div>
          {desc && <div className="text-slate-400 text-xs mt-0.5">{desc}</div>}
        </div>
        <button type="button" onClick={() => f(field, isOn ? "false" : "true")}
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isOn ? "bg-blue-600" : "bg-slate-200"}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isOn ? "right-1" : "left-1"}`} />
        </button>
      </div>
    );
  }

  function Input({ label, field, placeholder, dir = "rtl", type = "text", mono = false }: {
    label: string; field: keyof typeof form; placeholder?: string; dir?: "rtl" | "ltr"; type?: string; mono?: boolean;
  }) {
    return (
      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1.5">{label}</label>
        <input type={type} value={form[field]} onChange={(e) => f(field, e.target.value)}
          placeholder={placeholder} dir={dir}
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors ${mono ? "font-mono" : ""}`} />
      </div>
    );
  }

  if (loading) return <div className="text-slate-400 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الإعدادات</h1>
          <p className="text-slate-500 text-sm mt-1">تحكم كامل في كل عناصر الموقع</p>
        </div>
        {saved && <span className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">✓ تم الحفظ</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* ===== المشغّل الصوتي ===== */}
        <div className="bg-white border-2 border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎙️</span>
            <h2 className="text-slate-900 font-bold">المشغّل الصوتي المباشر</h2>
          </div>
          <p className="text-slate-400 text-xs mb-4">شريط ثابت أسفل الموقع — أخفِه حتى تحصل على رابط البث</p>
          <Toggle label="إظهار المشغّل" field="show_player" />
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط البث المباشر (Stream URL)</label>
              <input type="url" value={form.stream_url} onChange={(e) => f("stream_url", e.target.value)}
                placeholder="https://stream.example.com/live.mp3" dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 font-mono" />
              <p className="text-slate-400 text-xs mt-1">يدعم: MP3 • AAC • Icecast • HLS (.m3u8)</p>
            </div>
            <Input label="البرنامج الحالي على الهواء" field="on_air_label" placeholder="نشرة الأخبار الرئيسية" />
          </div>
          {form.show_player === "true" && !form.stream_url && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-amber-700 text-sm">⚠️ رابط البث فارغ — المشغّل لن يظهر للزوار</div>
          )}
          {form.show_player === "true" && form.stream_url && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-green-700 text-sm">✓ المشغّل جاهز ويظهر أسفل الموقع</div>
          )}
        </div>

        {/* ===== الهيرو ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎨</span>
            <h2 className="text-slate-900 font-bold">قسم الهيرو</h2>
          </div>
          <p className="text-slate-400 text-xs mb-4">نصوص وألوان الجزء العلوي من الصفحة الرئيسية</p>
          <div className="space-y-3">
            <Input label="العنوان الرئيسي" field="hero_title" placeholder="إذاعة الجمهورية اليمنية" />
            <Input label="العنوان الفرعي" field="hero_subtitle" placeholder="البرنامج العام" />
            <Input label="الوسم التعريفي" field="hero_tagline" placeholder="الصوت الحقيقي منذ عقود" />
            <Input label="نص شارة الهواء" field="hero_badge" placeholder="على الهواء الآن" />
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">لون خلفية الهيرو</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { val: "blue",  label: "أزرق ملكي",  bg: "linear-gradient(135deg,#0a1628,#1a3a7c,#2563eb)" },
                  { val: "dark",  label: "داكن رسمي",  bg: "linear-gradient(135deg,#0f172a,#1e293b,#334155)" },
                  { val: "green", label: "أخضر يمني",  bg: "linear-gradient(135deg,#064e3b,#065f46,#047857)" },
                  { val: "red",   label: "أحمر وطني",  bg: "linear-gradient(135deg,#7f1d1d,#991b1b,#b91c1c)" },
                ].map((c) => (
                  <button key={c.val} type="button" onClick={() => f("hero_bg", c.val)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${form.hero_bg === c.val ? "border-blue-500 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
                    <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: c.bg }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== سوشال ميديا ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📱</span>
            <h2 className="text-slate-900 font-bold">حسابات السوشال ميديا</h2>
          </div>
          <p className="text-slate-400 text-xs mb-4">تظهر في الـ Header والـ Footer — اتركها فارغة لإخفائها</p>
          <div className="space-y-3">
            {[
              { field: "social_facebook" as const,  label: "🔵 فيسبوك",   placeholder: "https://facebook.com/..." },
              { field: "social_twitter" as const,   label: "⬛ تويتر X",   placeholder: "https://x.com/..." },
              { field: "social_youtube" as const,   label: "🔴 يوتيوب",    placeholder: "https://youtube.com/..." },
              { field: "social_telegram" as const,  label: "🔷 تيليغرام",  placeholder: "https://t.me/..." },
              { field: "social_instagram" as const, label: "🟣 انستغرام",  placeholder: "https://instagram.com/..." },
              { field: "social_tiktok" as const,    label: "⬛ تيك توك",   placeholder: "https://tiktok.com/@..." },
            ].map((soc) => (
              <div key={soc.field}>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">{soc.label}</label>
                <input type="url" value={form[soc.field]} onChange={(e) => f(soc.field, e.target.value)}
                  placeholder={soc.placeholder} dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* ===== أقسام الموقع ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-1">أقسام الموقع</h2>
          <p className="text-slate-400 text-xs mb-4">إظهار وإخفاء أقسام الصفحة الرئيسية</p>
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
            <textarea value={form.ticker} onChange={(e) => f("ticker", e.target.value)} rows={3}
              placeholder="إذاعة الجمهورية اليمنية — البرنامج العام..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>

        {/* ===== التواصل ===== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">التواصل</h2>
          <Input label="رقم واتساب" field="whatsapp" placeholder="9671234567" dir="ltr" />
        </div>

        {/* ===== القمر ===== */}
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

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
          {saving ? "جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
        </button>

      </form>
    </div>
  );
}