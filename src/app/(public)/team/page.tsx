import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { db } from "@/db";
import { team } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "فريق الإذاعة | إذاعة الجمهورية اليمنية",
  description: "تعرّف على فريق إذاعة الجمهورية اليمنية — البرنامج العام.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await db.select().from(team)
    .where(eq(team.active, true))
    .orderBy(asc(team.sortOrder), asc(team.createdAt));

  const leader = members[0];
  const restMembers = members.slice(1);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero */}
      <PageHero badge="👥 من نحن" title="فريق الإذاعة" subtitle={"إذاعة الجمهورية اليمنية — " + members.length + " عضو"} />

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 px-6 py-3 flex items-center gap-3 bg-white">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 text-sm">فريق الإذاعة</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-slate-400">لا يوجد أعضاء بعد</div>
          </div>
        ) : (
          <div className="space-y-12">
            {leader && (
              <div className="max-w-xl mx-auto">
                <LeaderCard member={leader} />
              </div>
            )}

            {restMembers.length > 0 && (
              <section>
                <div className="text-center mb-8">
                  <h2 className="text-slate-900 text-2xl font-black">فريق الإذاعة</h2>
                  <p className="text-slate-500 text-sm mt-2">
                    كوادر إذاعة الجمهورية اليمنية — البرنامج العام
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {restMembers.map(m => <MemberCard key={m.id} member={m} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function LeaderCard({ member }: { member: { name: string; jobTitle: string; department: string; imageUrl: string | null } }) {
  return (
    <div className="bg-white border border-blue-200 rounded-3xl p-8 text-center shadow-sm">
      <div className="mb-5 flex justify-center">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-4xl">
            👤
          </div>
        )}
      </div>
      <h2 className="text-slate-900 font-black text-2xl mb-2">{member.name}</h2>
      <div className="text-blue-600 text-sm font-bold mb-1">{member.jobTitle}</div>
    </div>
  );
}

function MemberCard({ member }: { member: { name: string; jobTitle: string; department: string; imageUrl: string | null } }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-md transition-all group">
      {/* صورة */}
      <div className="mb-4 flex justify-center">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 group-hover:border-blue-200 transition-colors shadow-sm" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-slate-100 flex items-center justify-center text-3xl group-hover:border-blue-200 transition-colors">
            👤
          </div>
        )}
      </div>
      {/* معلومات */}
      <div className="text-slate-900 font-bold text-sm mb-1 leading-snug">{member.name}</div>
      <div className="text-blue-600 text-xs font-medium mb-1">{member.jobTitle}</div>
    </div>
  );
}
