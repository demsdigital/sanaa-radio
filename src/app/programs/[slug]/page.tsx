import { db } from "@/db";
import { programs, episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center text-white" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">📻</div>
          <h1 className="text-2xl font-bold mb-2">البرنامج غير موجود</h1>
          <a href="/programs" className="text-[#1a4fd6] hover:underline">← العودة للبرامج</a>
        </div>
      </div>
    );
  }

  const allEpisodes = await db.select().from(episodes)
    .where(eq(episodes.programId, program.id))
    .orderBy(desc(episodes.publishedAt));

  return (
    <div className="min-h-screen bg-[#07070d] text-white" dir="rtl">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">الرئيسية</a>
        <span className="text-gray-700">/</span>
        <a href="/programs" className="text-gray-400 hover:text-white text-sm transition-colors">البرامج</a>
        <span className="text-gray-700">/</span>
        <span className="text-white text-sm">{program.name}</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start gap-6 mb-12">
          <div className="w-20 h-20 rounded-2xl bg-[#1a4fd6]/10 border border-[#1a4fd6]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">📻</span>
          </div>
          <div>
            <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-2">{program.category}</div>
            <h1 className="text-white text-3xl font-black mb-2">{program.name}</h1>
            {program.description && <p className="text-gray-400">{program.description}</p>}
            <div className="text-gray-600 text-sm mt-2">{allEpisodes.length} حلقة</div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-4">الحلقات</h2>
          {allEpisodes.length === 0 ? (
            <div className="text-gray-500 text-center py-16 bg-[#0e0e18] border border-white/10 rounded-xl">
              لا توجد حلقات بعد
            </div>
          ) : (
            <div className="space-y-3">
              {allEpisodes.map((ep) => (
                <div key={ep.id} className="bg-[#0e0e18] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-white font-bold mb-1">{ep.title}</div>
                      {ep.description && <div className="text-gray-500 text-sm mb-2">{ep.description}</div>}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</span>
                        {ep.duration && <span>{formatDuration(ep.duration)}</span>}
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
      </div>
    </div>
  );
}
