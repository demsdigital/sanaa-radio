#!/bin/bash
# شغّل من جذر مشروع sanaa-radio
set -e
echo "🚀 تطبيق كل التحديثات..."

# ===== 1. Navbar مشترك =====
mkdir -p src/components
cat > src/components/Navbar.tsx << 'EOF'
import { db } from "@/db";
import { settings } from "@/db/schema";
import Link from "next/link";

export default async function Navbar() {
  const rows = await db.select().from(settings);
  const s: Record<string, string> = {};
  rows.forEach((r) => (s[r.key] = r.value));

  const socials = [
    { key: "social_facebook",  icon: "f",  label: "فيسبوك",   bg: "#1877F2" },
    { key: "social_twitter",   icon: "𝕏",  label: "تويتر",    bg: "#000000" },
    { key: "social_youtube",   icon: "▶",  label: "يوتيوب",   bg: "#FF0000" },
    { key: "social_telegram",  icon: "✈",  label: "تيليغرام", bg: "#229ED9" },
    { key: "social_instagram", icon: "◉",  label: "انستغرام", bg: "#E1306C" },
    { key: "social_tiktok",    icon: "♪",  label: "تيك توك",  bg: "#000000" },
  ].filter((soc) => s[soc.key]);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200"
      style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="إذاعة الجمهورية اليمنية" className="w-9 h-9 object-contain" />
          </div>
          <div className="hidden sm:block">
            <div className="text-slate-900 text-sm font-black leading-tight">إذاعة الجمهورية اليمنية</div>
            <div className="text-blue-600 text-xs font-semibold">البرنامج العام</div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-1 text-sm">
          {s.section_programs !== "false" && <Link href="/programs" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">البرامج</Link>}
          {s.section_schedule !== "false" && <Link href="/#schedule" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">الجدول</Link>}
          {s.section_news !== "false" && <Link href="/#news" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">الأخبار</Link>}
          {s.section_satellite !== "false" && <Link href="/#satellite" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">عبر القمر</Link>}
          <Link href="/about" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">عن الإذاعة</Link>
          {s.section_contact !== "false" && s.whatsapp && <Link href="/#contact" className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">تواصل</Link>}
        </div>
        {socials.length > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {socials.map((soc) => (
              <a key={soc.key} href={s[soc.key]} target="_blank" rel="noopener noreferrer" title={soc.label}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80"
                style={{ background: soc.bg }}>
                {soc.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
EOF
echo "✅ Navbar.tsx"

# ===== 2. Footer مشترك =====
cat > src/components/Footer.tsx << 'EOF'
import { db } from "@/db";
import { settings } from "@/db/schema";
import Link from "next/link";

export default async function Footer() {
  const rows = await db.select().from(settings);
  const s: Record<string, string> = {};
  rows.forEach((r) => (s[r.key] = r.value));

  const socials = [
    { key: "social_facebook",  label: "فيسبوك",   svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { key: "social_twitter",   label: "تويتر X",  svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { key: "social_youtube",   label: "يوتيوب",   svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
    { key: "social_telegram",  label: "تيليغرام", svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { key: "social_instagram", label: "انستغرام", svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
    { key: "social_tiktok",    label: "تيك توك",  svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  ].filter((soc) => s[soc.key]);

  return (
    <footer className="bg-slate-900 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <img src="/logo.png" alt="شعار" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <div className="text-white font-black text-base">إذاعة الجمهورية اليمنية</div>
                <div className="text-slate-400 text-sm">البرنامج العام • Yemen Radio</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">صوت الشرعية اليمنية منذ ١٩٤٧ — نقل الحقيقة وحفظ الهوية الوطنية.</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                {socials.map((soc) => (
                  <a key={soc.key} href={s[soc.key]} target="_blank" rel="noopener noreferrer" title={soc.label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors text-slate-300 hover:text-white">
                    {soc.svg}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-bold mb-4 text-sm uppercase tracking-widest">روابط سريعة</div>
            <div className="space-y-2.5">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/programs", label: "البرامج والحلقات" },
                { href: "/about", label: "عن الإذاعة" },
                { href: "/#schedule", label: "جدول البث" },
                { href: "/#news", label: "الأخبار" },
                { href: "/#satellite", label: "الاستماع عبر القمر" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
                  <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white font-bold mb-4 text-sm uppercase tracking-widest">بيانات البث</div>
            <div className="space-y-2.5">
              {[
                { label: "القمر الصناعي", value: s.satellite_name || "عرب سات بدر 4" },
                { label: "التردد الفضائي", value: `${s.satellite_freq || "12182"} MHz` },
                { label: "الموضع المداري", value: s.satellite_position || "16° شرقاً" },
                { label: "الاستقطاب", value: s.satellite_polarization || "أفقي (H)" },
                { label: "الموجة القصيرة", value: `${s.shortwave || "11860"} كيلو هيرتز` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-300 font-medium" dir="ltr">{item.value}</span>
                </div>
              ))}
              {s.whatsapp && (
                <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  📱 تواصل عبر واتساب
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} إذاعة الجمهورية اليمنية — جميع الحقوق محفوظة</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Yemen Radio — Broadcasting Since 1947</span>
        </div>
      </div>
    </footer>
  );
}
EOF
echo "✅ Footer.tsx"

# ===== 3. تحديث Hero في page.tsx =====
python3 - << 'PYEOF'
with open("src/app/page.tsx", "r") as f:
    c = f.read()

old = '''      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full border border-white" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full border border-white" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-48 h-48 object-contain drop-shadow-2xl" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                على الهواء الآن
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">إذاعة الجمهورية اليمنية</h1>
              <p className="text-blue-100 text-xl font-semibold mb-1">البرنامج العام</p>
              <p className="text-blue-200 text-sm mb-8">Yemen Radio • الصوت الحقيقي منذ عقود</p>
              {s.on_air_label && (
                <div className="bg-white/15 backdrop-blur border border-white/25 rounded-2xl p-5 max-w-sm">
                  <div className="text-blue-100 text-xs uppercase tracking-widest mb-1 font-medium">البرنامج الحالي</div>
                  <div className="text-white font-bold text-lg mb-3">{s.on_air_label}</div>
                  <div className="flex gap-1 mb-4 h-7 items-end">
                    {[8,16,24,12,20,28,10,22,18,14,26,8].map((h, i) => (
                      <div key={i} className="w-1 bg-white rounded-full animate-pulse opacity-80"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  {s.show_listen_btn !== "false" && latestEpisodes.length > 0 && (
                    <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">
                      🎧 استمع للأرشيف
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>'''

new = '''      {/* Hero */}
      {(() => {
        const bgColors: Record<string, string> = {
          blue:  "linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)",
          dark:  "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
          green: "linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)",
          red:   "linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
        };
        const bgStyle   = bgColors[s.hero_bg || "blue"] || bgColors.blue;
        const mediaType = s.hero_media_type || "none";
        const mediaUrl  = s.hero_media_url  || "";
        const overlayOp = s.hero_overlay_opacity ? Number(s.hero_overlay_opacity) / 100 : 0.55;
        return (
          <section className="relative text-white py-20 px-6 overflow-hidden" style={{ minHeight: "520px", background: bgStyle }}>
            {/* وسائط الخلفية */}
            {(mediaType === "image" || mediaType === "gif") && mediaUrl && (
              <>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mediaUrl})` }} />
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOp})` }} />
              </>
            )}
            {mediaType === "video" && mediaUrl && (
              <>
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={mediaUrl} />
                </video>
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOp})` }} />
              </>
            )}
            {mediaType === "none" && (
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-2 border-white" />
                <div className="absolute top-20 right-20 w-48 h-48 rounded-full border border-white" />
                <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full border border-white" />
              </div>
            )}
            {/* المحتوى */}
            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* الشعار بإطار أبيض واضح */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl scale-110" />
                    <div className="relative w-44 h-44 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white/40">
                      <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-36 h-36 object-contain" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {s.hero_badge || "على الهواء الآن"}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight drop-shadow-lg">
                    {s.hero_title || "إذاعة الجمهورية اليمنية"}
                  </h1>
                  <p className="text-blue-100 text-xl font-semibold mb-1 drop-shadow">
                    {s.hero_subtitle || "البرنامج العام"}
                  </p>
                  <p className="text-blue-200 text-sm mb-8 drop-shadow">
                    Yemen Radio • {s.hero_tagline || "الصوت الحقيقي منذ عقود"}
                  </p>
                  {s.on_air_label && (
                    <div className="bg-white/15 backdrop-blur border border-white/25 rounded-2xl p-5 max-w-sm shadow-xl">
                      <div className="text-blue-100 text-xs uppercase tracking-widest mb-1 font-medium">البرنامج الحالي</div>
                      <div className="text-white font-bold text-lg mb-3">{s.on_air_label}</div>
                      <div className="flex gap-1 mb-4 h-7 items-end">
                        {[8,16,24,12,20,28,10,22,18,14,26,8].map((h, i) => (
                          <div key={i} className="w-1 bg-white rounded-full animate-pulse opacity-80"
                            style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      {s.show_listen_btn !== "false" && latestEpisodes.length > 0 && (
                        <Link href="/programs" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">
                          🎧 استمع للأرشيف
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}'''

if old in c:
    c = c.replace(old, new)
    with open("src/app/page.tsx", "w") as f:
        f.write(c)
    print("✅ Hero محدّث")
else:
    print("❌ Hero لم يُعثر عليه")
PYEOF

# ===== 4. settings/page.tsx =====
cat > src/app/admin/settings/page.tsx << 'SETTINGSEOF'
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
    show_player: "false", stream_url: "",
    hero_title: "إذاعة الجمهورية اليمنية", hero_subtitle: "البرنامج العام",
    hero_tagline: "الصوت الحقيقي منذ عقود", hero_badge: "على الهواء الآن",
    hero_bg: "blue", hero_media_type: "none", hero_media_url: "", hero_overlay_opacity: "55",
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

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
        </button>
      </form>
    </div>
  );
}
SETTINGSEOF
echo "✅ settings/page.tsx"

echo ""
echo "✅ كل شيء جاهز! الآن:"
echo "git add . && git commit -m 'feat: Navbar+Footer مشتركان + هيرو ديناميكي + سوشال ميديا' && git push origin main"
