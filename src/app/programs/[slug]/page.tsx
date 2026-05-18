import { db } from "@/db";
import { programs, episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

function formatDuration(seconds: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const [program] = await db.select().from(programs).where(eq(programs.slug, slug));

  if (!program) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">📻</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">البرنامج غير موجود</h1>
          <Link href="/programs" className="text-blue-600 hover:underline">← العودة للبرامج</Link>
        </div>
      </div>
    );
  }

  const allEpisodes = await db.select().from(episodes)
    .where(eq(episodes.programId, program.id))
    .orderBy(desc(episodes.publishedAt));

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-white shadow-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <Link href="/programs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">البرامج</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">{program.name}</span>
      </nav>

      {/* Program Header */}
      <div className="bg-blue-600 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">📻</span>
          </div>
          <div>
            <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-2">{program.category}</div>
            <h1 className="text-white text-3xl font-black mb-2">{program.name}</h1>
            {program.description && <p className="text-blue-100 text-sm">{program.description}</p>}
            <div className="text-blue-200 text-sm mt-2">{allEpisodes.length} حلقة</div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-slate-900 font-bold text-lg mb-6">الحلقات</h2>
        {allEpisodes.length === 0 ? (
          <div className="text-slate-400 text-center py-16 bg-slate-50 border border-slate-200 rounded-xl">
            لا توجد حلقات بعد
          </div>
        ) : (
          <div className="space-y-3">
            {allEpisodes.map((ep) => (
              <div key={ep.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold mb-1">{ep.title}</div>
                    {ep.description && <div className="text-slate-500 text-sm mb-2">{ep.description}</div>}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</span>
                      {ep.duration && <span>⏱ {formatDuration(ep.duration)}</span>}
                    </div>
                  </div>
                  {ep.audioUrl && (
                    <div className="flex-shrink-0">
                      <audio controls className="h-10" src={ep.audioUrl}>
                        متصفحك لا يدعم تشغيل الصوت
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-slate-900 text-white px-6 py-8 text-center">
        <div className="text-slate-400 text-xs">© {new Date().getFullYear()} إذاعة الجمهورية اليمنية — البرنامج العام</div>
      </footer>
    </div>
  );
}
