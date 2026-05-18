"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [form,   setForm]     = useState({
    ticker: "", ticker_visible: "true", whatsapp: "",
    satellite_freq: "12182", satellite_name: "عرب سات بدر 4",
    satellite_position: "16° شرقاً", satellite_polarization: "أفقي (H)", shortwave: "11860",
    section_programs: "true", section_schedule: "true", section_news: "true",
    section_satellite: "true", section_contact: "true", show_listen_btn: "true",
    on_air_label: "نشرة الأخبار الرئيسية",
    show_player: "false", stream_url: "", player_opacity: "82",
    hero_title: "إذاعة الجمهورية اليمنية", hero_subtitle: "البرنامج العام",
    hero_tagline: "الصوت الحقيقي منذ عقود", hero_badge: "على الهواء الآن",
    hero_bg: "blue", hero_media_type: "none", hero_media_url: "", hero_overlay_opacity: "55", hero_card_opacity: "12",
    programs_hero_bg: "blue", programs_hero_media_type: "none", programs_hero_media_url: "", programs_hero_overlay_opacity: "55",
    programs_hero_title: "البرامج", programs_hero_subtitle: "إذاعة الجمهورية اليمنية — البرنامج العام",
    social_facebook: "", social_twitter: "", social_youtube: "",
    social_telegram: "", social_instagram: "", social_tiktok: "",
    director_name: "الأستاذ صالح علي أمين القادري",
    director_title: "رئيس قطاع إذاعة صنعاء – البرنامج العام",
    director_photo: "",
    director_bio1: "", director_bio2: "", director_bio3: "", director_bio4: "",
  });

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setForm(f => ({ ...f, ...data }));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await Promise.all(Object.entries(form).map(([key, value]) =>
      fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) })
    ));
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  const f = (key: keyof typeof form, value: string) => setForm(p => ({ ...p, [key]: value }));

  async function uploadFile(accept: string, field: keyof typeof form) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      f(field, url);
    };
    input.click();
  }

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

        {/* مشغّل صوتي */}
        <div className="bg-white border-2 border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1"><span>🎙️</span><h2 className="text-slate-900 font-bold">المشغّل الصوتي المباشر</h2></div>
          <p className="text-slate-400 text-xs mb-4">شريط ثابت أسفل الموقع — أخفِه حتى تحصل على رابط البث</p>
          <Toggle label="إظهار المشغّل" field="show_player" />
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط البث المباشر</label>
              <input type="url" value={form.stream_url} onChange={e => f("stream_url", e.target.value)}
                placeholder="https://stream.example.com/live.mp3" dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 font-mono" />
              <p className="text-slate-400 text-xs mt-1">MP3 • AAC • Icecast • HLS (.m3u8)</p>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">البرنامج الحالي على الهواء</label>
              <input value={form.on_air_label} onChange={e => f("on_air_label", e.target.value)}
                placeholder="نشرة الأخبار الرئيسية"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-slate-700 text-sm font-medium">شفافية المشغّل</label>
                <span className="text-blue-600 text-sm font-bold">{form.player_opacity}%</span>
              </div>
              <input type="range" min="40" max="100" step="5"
                value={form.player_opacity}
                onChange={e => f("player_opacity", e.target.value)}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-slate-400 text-xs mt-1">
                <span>شفاف</span>
                <span>معتم ←</span>
              </div>
            </div>
          </div>
          {form.show_player === "true" && !form.stream_url && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-amber-700 text-sm">⚠️ رابط البث فارغ — المشغّل لن يظهر للزوار</div>
          )}
        </div>

        {/* هيرو */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1"><span>🎨</span><h2 className="text-slate-900 font-bold">قسم الهيرو</h2></div>
          <p className="text-slate-400 text-xs mb-4">نصوص وخلفية الجزء العلوي من الصفحة الرئيسية</p>
          <div className="space-y-3">
            {[
              { label: "العنوان الرئيسي",    field: "hero_title"    as const, ph: "إذاعة الجمهورية اليمنية" },
              { label: "العنوان الفرعي",     field: "hero_subtitle" as const, ph: "البرنامج العام" },
              { label: "الوسم التعريفي",     field: "hero_tagline"  as const, ph: "الصوت الحقيقي منذ عقود" },
              { label: "نص شارة الهواء",    field: "hero_badge"    as const, ph: "على الهواء الآن" },
            ].map(({ label, field, ph }) => (
              <div key={field}>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">{label}</label>
                <input value={form[field]} onChange={e => f(field, e.target.value)} placeholder={ph}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            ))}

            {/* لون الخلفية */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">لون الخلفية</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "blue",  label: "أزرق", bg: "linear-gradient(135deg,#0a1628,#2563eb)" },
                  { val: "dark",  label: "داكن", bg: "linear-gradient(135deg,#0f172a,#334155)" },
                  { val: "green", label: "أخضر", bg: "linear-gradient(135deg,#064e3b,#047857)" },
                  { val: "red",   label: "أحمر", bg: "linear-gradient(135deg,#7f1d1d,#b91c1c)" },
                ].map(c => (
                  <button key={c.val} type="button" onClick={() => f("hero_bg", c.val)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${form.hero_bg === c.val ? "border-blue-500 shadow-md" : "border-slate-200"}`}>
                    <span className="w-5 h-5 rounded-full" style={{ background: c.bg }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* وسائط الخلفية */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-slate-700 text-sm font-medium mb-2">🎬 وسائط خلفية الهيرو</label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { val: "none",  label: "بدون",    icon: "🎨" },
                  { val: "image", label: "صورة",    icon: "🖼" },
                  { val: "gif",   label: "GIF",      icon: "✨" },
                  { val: "video", label: "فيديو",   icon: "🎥" },
                ].map(t => (
                  <button key={t.val} type="button" onClick={() => f("hero_media_type", t.val)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.hero_media_type === t.val ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {form.hero_media_type !== "none" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="url" value={form.hero_media_url} onChange={e => f("hero_media_url", e.target.value)}
                      placeholder={form.hero_media_type === "video" ? "https://.../video.mp4" : "https://.../image.jpg"}
                      dir="ltr"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 font-mono" />
                    {form.hero_media_type !== "video" && (
                      <button type="button"
                        onClick={() => uploadFile(form.hero_media_type === "gif" ? "image/gif" : "image/*", "hero_media_url")}
                        className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        رفع ↑
                      </button>
                    )}
                  </div>
                  {form.hero_media_url && form.hero_media_type !== "video" && (
                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.hero_media_url} alt="معاينة" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 text-sm font-medium">درجة التعتيم</span>
                      <span className="text-blue-600 text-sm font-bold">{form.hero_overlay_opacity}%</span>
                    </div>
                    <input type="range" min="0" max="90" step="5" value={form.hero_overlay_opacity}
                      onChange={e => f("hero_overlay_opacity", e.target.value)}
                      className="w-full accent-blue-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* سوشال ميديا */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1"><span>📱</span><h2 className="text-slate-900 font-bold">حسابات السوشال ميديا</h2></div>
          <p className="text-slate-400 text-xs mb-4">تظهر في الـ Header والـ Footer — اتركها فارغة لإخفائها</p>
          <div className="space-y-3">
            {([
              { field: "social_facebook"  as const, label: "🔵 فيسبوك",   ph: "https://facebook.com/..." },
              { field: "social_twitter"   as const, label: "⬛ تويتر X",  ph: "https://x.com/..." },
              { field: "social_youtube"   as const, label: "🔴 يوتيوب",   ph: "https://youtube.com/..." },
              { field: "social_telegram"  as const, label: "🔷 تيليغرام", ph: "https://t.me/..." },
              { field: "social_instagram" as const, label: "🟣 انستغرام", ph: "https://instagram.com/..." },
              { field: "social_tiktok"    as const, label: "⬛ تيك توك",  ph: "https://tiktok.com/@..." },
            ]).map(soc => (
              <div key={soc.field}>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">{soc.label}</label>
                <input type="url" value={form[soc.field]} onChange={e => f(soc.field, e.target.value)}
                  placeholder={soc.ph} dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
        </div>

        {/* أقسام الموقع */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">أقسام الموقع</h2>
          <Toggle label="قسم البرامج" field="section_programs" />
          <Toggle label="قسم الجدول" field="section_schedule" />
          <Toggle label="قسم الأخبار" field="section_news" />
          <Toggle label="قسم عبر القمر" field="section_satellite" />
          <Toggle label="قسم التواصل / واتساب" field="section_contact" />
          <Toggle label="زر الاستماع للأرشيف" field="show_listen_btn" />
        </div>

        {/* الشريط الإخباري */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">الشريط الإخباري العاجل</h2>
          <Toggle label="إظهار الشريط" field="ticker_visible" />
          <div className="mt-4">
            <label className="block text-slate-700 text-sm font-medium mb-1.5">نص الشريط</label>
            <textarea value={form.ticker} onChange={e => f("ticker", e.target.value)} rows={3}
              placeholder="إذاعة الجمهورية اليمنية — البرنامج العام..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>

        {/* التواصل */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">التواصل</h2>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">رقم واتساب</label>
            <input value={form.whatsapp} onChange={e => f("whatsapp", e.target.value)}
              placeholder="9671234567" dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        {/* القمر */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 font-bold mb-4">بيانات القمر الصناعي</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              { label: "تردد (MHz)",       field: "satellite_freq"         as const, dir: "ltr" as const },
              { label: "اسم القمر",        field: "satellite_name"         as const, dir: "rtl" as const },
              { label: "الموضع المداري",   field: "satellite_position"     as const, dir: "rtl" as const },
              { label: "الاستقطاب",        field: "satellite_polarization" as const, dir: "rtl" as const },
              { label: "موجة قصيرة (kHz)", field: "shortwave"              as const, dir: "ltr" as const },
            ]).map(item => (
              <div key={item.field}>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">{item.label}</label>
                <input value={form[item.field]} onChange={e => f(item.field, e.target.value)} dir={item.dir}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
        </div>

        {/* رئيس القطاع */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1"><span>👤</span><h2 className="text-slate-900 font-bold">رئيس القطاع</h2></div>
          <p className="text-slate-400 text-xs mb-4">محتوى صفحة رئيس قطاع إذاعة صنعاء</p>
          <div className="space-y-3">
            <div><label className="block text-slate-700 text-sm font-medium mb-1.5">الاسم الكامل</label><input value={form.director_name} onChange={e => f("director_name", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="block text-slate-700 text-sm font-medium mb-1.5">المسمى الوظيفي</label><input value={form.director_title} onChange={e => f("director_title", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="block text-slate-700 text-sm font-medium mb-1.5">رابط الصورة الشخصية</label><div className="flex gap-2"><input type="url" value={form.director_photo} onChange={e => f("director_photo", e.target.value)} dir="ltr" placeholder="https://..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" /><button type="button" onClick={() => uploadFile("image/*", "director_photo")} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">رفع ↑</button></div></div>
            {["director_bio1","director_bio2","director_bio3","director_bio4"].map((k,i) => (<div key={k}><label className="block text-slate-700 text-sm font-medium mb-1.5">الفقرة {i+1}</label><textarea value={form[k as keyof typeof form]} onChange={e => f(k as keyof typeof form, e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 resize-none" /></div>))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
        </button>
      </form>
    </div>
  );
}
