import { db } from "@/db";
import { settings } from "@/db/schema";

type Props = {
  badge?: string;
  title: string;
  subtitle?: string;
};

export default async function PageHero({ badge, title, subtitle }: Props) {
  const rows = await db.select().from(settings);
  const s: Record<string, string> = {};
  rows.forEach(r => (s[r.key] = r.value));

  const bgMap: Record<string, string> = {
    blue:  "linear-gradient(135deg,#0a1628 0%,#1a3a7c 50%,#2563eb 100%)",
    dark:  "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
    green: "linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)",
    red:   "linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
  };

  const heroBg = bgMap[s.programs_hero_bg || s.hero_bg || "blue"] || bgMap.blue;
  const mt = s.programs_hero_media_type || "none";
  const mu = s.programs_hero_media_url || "";
  const op = Number(s.programs_hero_overlay_opacity ?? s.hero_overlay_opacity ?? 55) / 100;

  return (
    <div className="relative py-14 px-6 text-white text-center overflow-hidden"
      style={{ background: heroBg, minHeight: "200px" }}>
      {(mt === "image" || mt === "gif") && mu && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mu})` }} />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${op})` }} />
        </>
      )}
      {mt === "video" && mu && (
        <>
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={mu} />
          </video>
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${op})` }} />
        </>
      )}
      {mt === "none" && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-5 right-10 w-48 h-48 rounded-full border border-white" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white" />
        </div>
      )}
      <div className="relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            {badge}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-black mb-2">{title}</h1>
        {subtitle && <p className="text-blue-200 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
