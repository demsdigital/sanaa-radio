import { db } from "@/db";
import { programs, episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

function formatDuration(seconds: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getYouTubeId(url: string | null) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match?.[1] || null;
}

function getYouTubeThumbnail(url: string | null) {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.slug, slug));

  if (!program) {
    return {
      title: "برنامج غير موجود | إذاعة الجمهورية اليمنية",
    };
  }

  const description =
    program.description ||
    `استمع إلى حلقات برنامج ${program.name} على إذاعة الجمهورية اليمنية — البرنامج العام.`;

  return {
    title: `${program.name} | إذاعة الجمهورية اليمنية`,
    description,

    alternates: {
      canonical: `https://www.sanaaradio.org/programs/${slug}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "website",
      locale: "ar_YE",
      url: `https://www.sanaaradio.org/programs/${slug}`,
      siteName: "إذاعة الجمهورية اليمنية",
      title: program.name,
      description,
      ...(program.imageUrl
        ? {
            images: [
              {
                url: program.imageUrl,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: program.name,
      description,
      ...(program.imageUrl
        ? {
            images: [program.imageUrl],
          }
        : {}),
    },
  };
}

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
            {allEpisodes.map((ep) => {
              const youtubeThumbnail = getYouTubeThumbnail(ep.youtubeUrl);

              return (
                <div key={ep.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {youtubeThumbnail && (
                      <div className="w-full md:w-36 h-44 md:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <img
                          src={youtubeThumbnail}
                          alt={`غلاف حلقة ${ep.title}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 font-bold mb-1">{ep.title}</div>
                      {ep.description && <div className="text-slate-500 text-sm mb-2">{ep.description}</div>}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span>{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</span>
                        {ep.duration && <span>⏱ {formatDuration(ep.duration)}</span>}
                      </div>
                    </div>

                    {ep.audioUrl ? (
                      <div className="w-full md:w-auto md:flex-shrink-0">
                        <audio controls className="w-full md:w-[280px] h-10" src={ep.audioUrl}>
                          متصفحك لا يدعم تشغيل الصوت
                        </audio>
                      </div>
                    ) : ep.youtubeUrl && getYouTubeId(ep.youtubeUrl) ? (
                      <div className="w-full md:w-[320px] md:flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-black">
                        <iframe
                          className="w-full aspect-video"
                          src={`https://www.youtube.com/embed/${getYouTubeId(ep.youtubeUrl)}`}
                          title={`تشغيل حلقة ${ep.title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
