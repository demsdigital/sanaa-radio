import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import ReportsGallery from "@/components/exchange/ReportsGallery";
import ExchangeStatsCounter from "@/components/exchange/ExchangeStatsCounter";
import {
  exchangeAchievements,
  exchangeStats,
  exchangeReports,
  exchangePartners,
  settings,
} from "@/db/schema";

export const metadata: Metadata = {
  title: "التبادل البرامجي والإخباري العربي",
  description:
    "منصة إذاعة الجمهورية اليمنية للتبادل البرامجي والإخباري مع الهيئات والإذاعات العربية، وتوثيق الإنجازات والمشاركات ضمن اتحاد إذاعات الدول العربية.",
};

export default async function ProgramExchangePage() {
  const stats = await db
    .select()
    .from(exchangeStats)
    .where(eq(exchangeStats.active, true))
    .orderBy(asc(exchangeStats.sortOrder));

  const achievements = await db
    .select()
    .from(exchangeAchievements)
    .where(eq(exchangeAchievements.active, true))
    .orderBy(asc(exchangeAchievements.sortOrder));

  const reports = await db
    .select()
    .from(exchangeReports)
    .where(eq(exchangeReports.active, true))
    .orderBy(asc(exchangeReports.sortOrder))
    .limit(6);

  const partners = await db
    .select()
    .from(exchangePartners)
    .where(eq(exchangePartners.active, true))
    .orderBy(asc(exchangePartners.sortOrder));

  const settingRows = await db.select().from(settings);

  const settingMap = Object.fromEntries(
    settingRows.map((row) => [row.key, row.value])
  );

  const showStats = settingMap.exchange_show_stats !== "false";
  const showAchievements = settingMap.exchange_show_achievements !== "false";
  const showReports = settingMap.exchange_show_reports !== "false";
  const showCloud = settingMap.exchange_show_cloud !== "false";
  const showPartners = settingMap.exchange_show_partners !== "false";
  const showFuture = settingMap.exchange_show_future !== "false";

  return (
    <main className="bg-slate-50 text-slate-900" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,#60a5fa,transparent_35%),radial-gradient(circle_at_bottom_right,#facc15,transparent_25%)]" />

        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3">
              <span className="inline-flex mb-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                🏆 المركز الأول عربيًا في التبادلات البرامجية
              </span>

              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                التبادل البرامجي والإخباري العربي
              </h1>

              <p className="mt-6 text-lg md:text-xl text-blue-100 leading-9">
                منصة إذاعة الجمهورية اليمنية للتبادل البرامجي والإخباري مع الهيئات
                والإذاعات العربية، وتوثيق حضورها الفاعل ضمن اتحاد إذاعات الدول العربية.
              </p>

              <div className="flex gap-3 mt-8 flex-wrap">
                <a
                  href="/program-exchange/items"
                  className="px-6 py-3 rounded-2xl bg-white text-blue-900 font-black hover:bg-blue-50 transition-colors"
                >
                  مواد التبادل
                </a>

                <a
                  href="/program-exchange/reports"
                  className="px-6 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur font-black hover:bg-white/20 transition-colors"
                >
                  استعراض التقارير
                </a>

                <a
                  href="#achievements"
                  className="px-6 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur font-black hover:bg-white/20 transition-colors"
                >
                  الإنجازات والتكريمات
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-blue-400/20 rounded-full" />

                <div className="relative rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-8 overflow-hidden">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-blue-100 text-sm">
                          Arab States Broadcasting Union
                        </div>

                        <div className="text-2xl font-black mt-2">
                          ASBU Exchange
                        </div>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                        📡
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                        <div className="text-3xl font-black">720</div>
                        <div className="text-blue-100 text-sm mt-2">
                          مادة برامجية
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                        <div className="text-3xl font-black">45</div>
                        <div className="text-blue-100 text-sm mt-2">
                          مادة إخبارية
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4 border border-white/10 col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-black">
                              Cloud Exchange
                            </div>

                            <div className="text-blue-100 text-sm mt-2">
                              منظومة التبادل البرامجي السحابية
                            </div>
                          </div>

                          <div className="text-4xl">☁️</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />

                      <div className="text-sm text-blue-100">
                        Active Arab Broadcasting Participation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showStats && stats.length > 0 && (
        <ExchangeStatsCounter stats={stats} />
      )}

      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-3xl font-black mb-5">
            منصة قابلة للنمو والتحديث
          </h2>

          <p className="text-slate-600 leading-9 text-lg">
            تأتي هذه الصفحة لتوثيق مسيرة إذاعة الجمهورية اليمنية في التبادل
            البرامجي والإخباري العربي، مع بناء أساس مرن يسمح لاحقًا بإضافة
            الإحصائيات الحديثة، التقارير، المواد الصوتية، الجهات المشاركة،
            وصور التكريم والاجتماعات.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
          <h3 className="text-xl font-black mb-4">محاور المنصة</h3>

          <div className="grid gap-3 text-slate-700">
            <div className="rounded-xl bg-slate-50 p-4">
              أرشيف الإنجازات والتكريمات
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              الإحصائيات السنوية القابلة للتعديل
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              التقارير والصور الرسمية
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              المواد البرامجية والإخبارية المتبادلة
            </div>
          </div>
        </div>
      </section>

      {showAchievements && achievements.length > 0 && (
        <section id="achievements" className="bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-black mb-8">محطات بارزة</h2>

            <div className="relative">
              <div className="absolute right-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-400 to-transparent hidden md:block" />

              <div className="space-y-8">
                {achievements.map((item, index) => (
                  <article
                    key={item.id}
                    className="relative md:pr-20"
                  >
                    <div className="hidden md:flex absolute right-0 top-8 w-12 h-12 rounded-full bg-blue-600 text-white items-center justify-center font-black shadow-lg border-4 border-white">
                      {item.year || index + 1}
                    </div>

                    <div className="rounded-[2rem] border border-slate-100 bg-slate-50 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="grid md:grid-cols-5">
                        {item.imageUrl && (
                          <div className="md:col-span-2">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full min-h-[260px] object-cover bg-slate-100"
                            />
                          </div>
                        )}

                        <div className={`${item.imageUrl ? "md:col-span-3" : "md:col-span-5"} p-8`}>
                          {item.year && (
                            <div className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-black text-sm">
                              {item.year}
                            </div>
                          )}

                          <h3 className="mt-5 text-2xl md:text-3xl font-black leading-tight">
                            {item.title}
                          </h3>

                          {item.organization && (
                            <div className="mt-3 text-sm text-slate-500 font-medium">
                              {item.organization}
                            </div>
                          )}

                          {item.description && (
                            <p className="mt-5 text-slate-600 leading-9 text-lg">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {showCloud && (
        <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 md:p-12">
              <span className="inline-flex px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-black mb-5">
                التبادل الرقمي السحابي
              </span>

              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                حضور يمني فاعل عبر الشبكة السحابية العربية
              </h2>

              <p className="mt-6 text-slate-600 leading-9 text-lg">
                ساهمت إذاعة الجمهورية اليمنية في التبادل البرامجي والإخباري عبر
                الشبكة السحابية للمركز العربي للتبادل البرامجي والإخباري، بمواد
                مكتملة الشروط الفنية ومستخدمة من قبل عدد من الهيئات الإذاعية العربية.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-8">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-blue-700 font-black">مواد برامجية</div>
                  <div className="text-slate-500 text-sm mt-1">قابلة للأرشفة والتحديث</div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-blue-700 font-black">مواد إخبارية</div>
                  <div className="text-slate-500 text-sm mt-1">ضمن منظومة تبادل عربية</div>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white p-8 md:p-12 flex items-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,#60a5fa,transparent_35%),radial-gradient(circle_at_bottom_left,#facc15,transparent_25%)]" />

              <div className="relative w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-white/10 border border-white/10 p-5 backdrop-blur">
                    <div className="text-4xl mb-3">☁️</div>
                    <div className="font-black">Cloud Exchange</div>
                    <div className="text-blue-100 text-sm mt-2">شبكة تبادل سحابية</div>
                  </div>

                  <div className="rounded-3xl bg-white/10 border border-white/10 p-5 backdrop-blur mt-8">
                    <div className="text-4xl mb-3">📡</div>
                    <div className="font-black">Arab Broadcast</div>
                    <div className="text-blue-100 text-sm mt-2">حضور عربي مشترك</div>
                  </div>

                  <div className="rounded-3xl bg-white/10 border border-white/10 p-5 backdrop-blur">
                    <div className="text-4xl mb-3">🎙️</div>
                    <div className="font-black">Radio Content</div>
                    <div className="text-blue-100 text-sm mt-2">برامج ومواد إذاعية</div>
                  </div>

                  <div className="rounded-3xl bg-white/10 border border-white/10 p-5 backdrop-blur mt-8">
                    <div className="text-4xl mb-3">📰</div>
                    <div className="font-black">News Exchange</div>
                    <div className="text-blue-100 text-sm mt-2">تبادل إخباري منظم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {showPartners && partners.length > 0 && (
        <section className="bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 py-14">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black">
                الهيئات والجهات المشاركة
              </h2>

              <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                تعاون وتنسيق إعلامي ضمن منظومة التبادل البرامجي والإخباري العربي.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
              {partners.map((item) => (
                <a
                  key={item.id}
                  href={item.websiteUrl || "#"}
                  target="_blank"
                  className="group bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="aspect-square flex items-center justify-center">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        className="max-h-24 object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-5xl">🏛️</div>
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <h3 className="font-black text-slate-900 leading-7">
                      {item.name}
                    </h3>

                    {item.country && (
                      <div className="text-sm text-slate-500 mt-2">
                        {item.country}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {showReports && reports.length > 0 && (
        <section id="reports" className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <div>
              <h2 className="text-3xl font-black">التقارير والصور الرسمية</h2>
              <p className="text-slate-500 mt-2">
                أحدث التقارير والتكريمات والاجتماعات الرسمية.
              </p>
            </div>

            <a
              href="/program-exchange/reports"
              className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors"
            >
              عرض كل التقارير
            </a>
          </div>

          <ReportsGallery reports={reports} />
        </section>
      )}

      {showFuture && (
        <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-l from-blue-900 to-slate-950 text-white p-8 md:p-12">
          <h2 className="text-3xl font-black mb-4">رؤية مستقبلية</h2>

          <p className="text-blue-100 leading-9 text-lg max-w-4xl">
            تسعى إذاعة الجمهورية اليمنية إلى تطوير حضورها في منظومة التبادل
            العربي عبر منصة رقمية حديثة تحفظ الأرشيف، وتعرض الإنجازات، وتتيح
            إدارة المحتوى والمواد والإحصائيات من لوحة التحكم بشكل مرن وقابل
            للتحديث المستمر.
          </p>
        </div>
      </section>
      )}
    </main>
  );
}
