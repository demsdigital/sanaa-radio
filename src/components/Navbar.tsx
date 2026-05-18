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
