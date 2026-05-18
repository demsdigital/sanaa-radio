import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رئيس القطاع — إذاعة الجمهورية اليمنية",
  description: "الأستاذ صالح علي أمين القادري، رئيس قطاع إذاعة صنعاء – البرنامج العام",
};

export default function DirectorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-3">القيادة</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">رئيس القطاع</h1>
          <p className="text-blue-200 text-base">إذاعة الجمهورية اليمنية — البرنامج العام</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-blue-100 border-4 border-blue-200 flex items-center justify-center shadow-md">
                  <span className="text-5xl">👤</span>
                </div>
              </div>
              {/* Name & Title */}
              <div className="text-center md:text-right">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  الأستاذ صالح علي أمين القادري
                </h2>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  رئيس قطاع إذاعة صنعاء – البرنامج العام
                </div>
              </div>
            </div>

            {/* Bio Paragraphs */}
            <div className="space-y-6 text-slate-700 text-base leading-relaxed text-right">
              <p>
                يقود قطاع إذاعة صنعاء – البرنامج العام الأستاذ صالح علي أمين القادري، أحد الكفاءات الإعلامية
                والإدارية ذات الخبرة الطويلة في العمل الإذاعي والإعلامي في اليمن، حيث يمتلك مسيرة مهنية
                حافلة بالعطاء في مجالات الإدارة الإعلامية والعمل الإذاعي والثقافي.
              </p>
              <p>
                شغل خلال مسيرته العديد من المناصب القيادية والإعلامية، من أبرزها مدير عام إذاعة إب، ووكيل
                محافظة إب لشؤون الإعلام والسياحة والاستثمار، إلى جانب مشاركته في عدد من المؤتمرات والملتقيات
                الإعلامية والثقافية داخل اليمن وخارجها، وإسهامه في تطوير الأداء الإعلامي والإذاعي وتعزيز
                دور الرسالة الإعلامية الوطنية.
              </p>
              <p>
                كما يمتلك خبرة واسعة في مجالات الإدارة الإعلامية والتخطيط والإشراف البرامجي، وشارك في
                العديد من الأنشطة والدورات والبرامج المتخصصة المرتبطة بالعمل الإذاعي والإعلامي، ما أسهم
                في تعزيز حضوره المهني ودوره في تطوير المحتوى الإعلامي والإذاعي.
              </p>
              <p>
                ويواصل قطاع إذاعة صنعاء – البرنامج العام أداء رسالته الإعلامية والوطنية في تقديم البرامج
                والمحتوى الإذاعي المتنوع، بما يلبي تطلعات المستمعين، ويعزز حضور الإذاعة كواحدة من أعرق
                المؤسسات الإعلامية في اليمن، ودورها في نقل الرسالة الإعلامية بمهنية ومسؤولية.
              </p>
            </div>
          </div>
        </div>

        {/* Key Positions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🏛️", title: "مدير عام إذاعة إب", desc: "قيادة وإدارة الإذاعة المحلية" },
            { icon: "🏛️", title: "وكيل محافظة إب", desc: "شؤون الإعلام والسياحة والاستثمار" },
            { icon: "📻", title: "رئيس قطاع صنعاء", desc: "إذاعة الجمهورية — البرنامج العام" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-6 text-right shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-slate-900 font-bold text-sm mb-1">{item.title}</div>
              <div className="text-slate-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}