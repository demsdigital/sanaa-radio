import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="border-b border-slate-200 px-8 py-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-40">
        <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-12 h-12 object-contain" />
        <div className="flex-1">
          <Link href="/" className="text-slate-900 text-sm font-black">إذاعة الجمهورية اليمنية</Link>
          <div className="text-blue-600 text-xs font-medium">البرنامج العام</div>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">← الرئيسية</Link>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-32 h-32 object-contain mx-auto mb-6 bg-white rounded-full p-3 shadow-2xl" />
          <h1 className="text-4xl font-black mb-3">إذاعة الجمهورية اليمنية</h1>
          <p className="text-blue-200 text-xl font-semibold mb-2">البرنامج العام • Yemen Radio</p>
          <p className="text-blue-100 text-lg mt-4 font-medium">صوت اليمن الجمهوري… وذاكرة الوطن الحية</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-900 text-white px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "+70", label: "عاماً من البث" },
            { value: "1947", label: "سنة التأسيس" },
            { value: "24/7", label: "بث مستمر" },
            { value: "عربي", label: "تغطية واسعة" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-blue-400 text-3xl font-black mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">

        {/* Intro */}
        <div>
          <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">من نحن</div>
          <h2 className="text-slate-900 text-2xl font-black mb-4">أعرق المؤسسات الإعلامية في اليمن</h2>
          <p className="text-slate-600 leading-loose text-base">
            تُعد إذاعة الجمهورية اليمنية – البرنامج العام واحدة من أعرق المؤسسات الإعلامية في اليمن والمنطقة العربية، وهي الإذاعة الرسمية التاريخية التي ارتبط اسمها بصوت الدولة اليمنية الحديثة، وبالتحولات الوطنية والسياسية والثقافية التي شهدها اليمن منذ منتصف القرن العشرين.
          </p>
          <p className="text-slate-600 leading-loose text-base mt-4">
            واليوم، تواصل إذاعة الجمهورية اليمنية رسالتها الإعلامية باعتبارها صوت الشرعية اليمنية، ومنصة وطنية جامعة تنقل الحقيقة، وتحافظ على الإرث الإعلامي الوطني.
          </p>
        </div>

        {/* Timeline */}
        <div>
          <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-6">التاريخ</div>
          <div className="space-y-6">
            {[
              { year: "1947", title: "البدايات الأولى", desc: "بدأت المحاولات الأولى للبث الإذاعي من العاصمة صنعاء باستخدام أجهزة إرسال بسيطة، وتركزت على تلاوة القرآن الكريم والأخبار الرسمية." },
              { year: "1962", title: "إذاعة الثورة والجمهورية", desc: "مع قيام ثورة السادس والعشرين من سبتمبر، تحولت الإذاعة إلى منبر وطني رئيسي يدافع عن الجمهورية وينقل بيانات الثورة." },
              { year: "1990", title: "مرحلة الوحدة اليمنية", desc: "أصبحت الإذاعة جزءاً من المؤسسة العامة اليمنية للإذاعة والتلفزيون، وواصلت دورها باعتبارها إذاعة وطنية جامعة." },
              { year: "اليوم", title: "صوت الشرعية", desc: "تواصل الإذاعة رسالتها الوطنية، وتعمل على تطوير حضورها الرقمي لمواكبة التحولات الإعلامية الحديثة." },
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">{item.year}</div>
                  {i < 3 && <div className="w-0.5 h-full bg-blue-100 mt-2" />}
                </div>
                <div className="pb-6">
                  <div className="text-slate-900 font-bold text-lg mb-2">{item.title}</div>
                  <div className="text-slate-600 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div>
          <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-4">المحتوى البرامجي</div>
          <h2 className="text-slate-900 text-2xl font-black mb-6">خارطة برامجية متنوعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "📰", title: "الإخبارية والسياسية", desc: "تغطيات، نشرات، تقارير، لقاءات وبرامج تحليلية تتابع الشأن اليمني والعربي والدولي" },
              { icon: "📚", title: "الثقافية والفكرية", desc: "برامج تهتم بالأدب والفكر والتاريخ والهوية اليمنية ونشر الوعي المعرفي" },
              { icon: "👨‍👩‍👧", title: "الاجتماعية", desc: "قضايا الأسرة والشباب والمرأة والتعليم والصحة والتنمية والمجتمع" },
              { icon: "🕌", title: "الدينية", desc: "مواد وبرامج دينية وتوعوية تعزز قيم الوسطية والاعتدال والتسامح" },
              { icon: "🎵", title: "التراثية والفنية", desc: "برامج تهتم بالغناء اليمني الأصيل والتراث الشعبي والذاكرة الثقافية" },
              { icon: "🇾🇪", title: "المناسبات الوطنية", desc: "تغطيات خاصة بالمناسبات الوطنية والثورية والدينية والفعاليات الرسمية" },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-slate-900 font-bold mb-1">{item.title}</div>
                <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-blue-600 text-white rounded-2xl p-8">
          <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-4">رسالتنا</div>
          <h2 className="text-2xl font-black mb-6">الكلمة أمانة والأثير رسالة</h2>
          <ul className="space-y-3">
            {[
              "الدفاع عن الجمهورية والهوية الوطنية اليمنية",
              "دعم مؤسسات الدولة الشرعية",
              "نقل الحقيقة بمهنية ومسؤولية",
              "الحفاظ على التراث الثقافي والإذاعي اليمني",
              "تعزيز قيم الوحدة الوطنية والتعايش",
              "مواكبة التطورات الإعلامية والتقنية الحديثة",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-blue-100">
                <span className="text-white font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="text-slate-900 font-black text-lg mb-4">معلومات مختصرة</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "الاسم الرسمي", value: "إذاعة الجمهورية اليمنية – البرنامج العام" },
              { label: "النوع", value: "إذاعة رسمية وطنية" },
              { label: "الدولة", value: "الجمهورية اليمنية" },
              { label: "اللغة", value: "العربية" },
              { label: "التغطية", value: "اليمن والعالم العربي" },
              { label: "البث الفضائي", value: "عرب سات بدر 4 — 12182 MHz" },
              { label: "الموجة القصيرة", value: "11860 كيلو هيرتز" },
              { label: "الهوية الحالية", value: "صوت الشرعية اليمنية" },
            ].map((item) => (
              <div key={item.label} className="py-2 border-b border-slate-200 last:border-0">
                <div className="text-slate-400 text-xs mb-0.5">{item.label}</div>
                <div className="text-slate-900 text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-slate-900 text-xl font-black mb-2">هنا اليمن… هنا صوت الجمهورية</h3>
          <p className="text-slate-500 text-sm mb-6">استمع إلى برامجنا وحلقاتنا المتنوعة</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/programs" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              🎧 البرامج والحلقات
            </Link>
            <Link href="/#satellite" className="border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors">
              📡 كيف تستمع
            </Link>
          </div>
        </div>

      </div>

      <footer className="bg-slate-900 text-white px-8 py-8 text-center">
        <div className="text-slate-400 text-xs">© {new Date().getFullYear()} إذاعة الجمهورية اليمنية — البرنامج العام</div>
      </footer>
    </div>
  );
}
