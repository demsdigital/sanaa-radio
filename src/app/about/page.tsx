import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-12 h-12 object-contain" />
          <div>
            <div className="text-slate-900 text-sm font-black">إذاعة الجمهورية اليمنية</div>
            <div className="text-blue-600 text-xs font-semibold">البرنامج العام</div>
          </div>
        </div>
        <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">← الرئيسية</Link>
      </nav>

      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden pt-24 pb-32 px-6" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3a7c 50%, #2563eb 100%)", minHeight: "70vh" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full border border-white/5" style={{ width: 500, height: 500, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="absolute rounded-full border border-white/5" style={{ width: 750, height: 750, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto w-full">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl bg-blue-400/30 scale-125" />
              <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="relative w-36 h-36 object-contain rounded-full p-3 bg-white shadow-2xl" />
            </div>
          </div>
          <div className="flex-1 text-right">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full mb-5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              صوت الشرعية اليمنية
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">إذاعة الجمهورية اليمنية</h1>
            <p className="text-blue-200 text-lg font-semibold mb-2">البرنامج العام • Yemen Radio</p>
            <p className="text-blue-300/80">صوت اليمن الجمهوري… وذاكرة الوطن الحية</p>
          </div>
        </div>
      </section>

      {/* Stats — overlapping */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "+70", label: "عاماً من البث", icon: "📡" },
              { value: "1947", label: "سنة التأسيس", icon: "🏛️" },
              { value: "24/7", label: "بث مستمر", icon: "🔴" },
              { value: "عربي", label: "تغطية واسعة", icon: "🌍" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 text-center shadow-2xl border border-slate-100"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-blue-600 text-3xl font-black mb-1">{s.value}</div>
                <div className="text-slate-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">من نحن</div>
              <h2 className="text-slate-900 text-3xl font-black mb-6 leading-tight">أعرق المؤسسات الإعلامية في اليمن والمنطقة العربية</h2>
              <p className="text-slate-600 leading-loose mb-4">
                تُعد إذاعة الجمهورية اليمنية واحدة من أعرق المؤسسات الإعلامية في اليمن، ارتبط اسمها بصوت الدولة اليمنية الحديثة وبالتحولات الوطنية منذ منتصف القرن العشرين.
              </p>
              <p className="text-slate-600 leading-loose">
                واليوم، تواصل رسالتها باعتبارها صوت الشرعية اليمنية، ومنصة وطنية جامعة تنقل الحقيقة وتحافظ على الإرث الإعلامي الوطني.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: "📻", title: "البث الفضائي", desc: "عبر القمر الصناعي عرب سات بدر 4 لتغطية كاملة في الوطن العربي" },
                { icon: "📡", title: "الموجة القصيرة", desc: "نصل إليك أينما كنت على تردد 11860 كيلو هيرتز" },
                { icon: "🌐", title: "الأرشيف الرقمي", desc: "أرشيف كامل للبرامج والحلقات متاح للاستماع في أي وقت" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-slate-900 font-bold mb-1">{item.title}</div>
                    <div className="text-slate-600 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">التاريخ</div>
            <h2 className="text-slate-900 text-3xl font-black">رحلة عبر الزمن</h2>
          </div>
          <div className="relative">
            <div className="absolute right-6 top-0 bottom-0 w-px bg-blue-100 hidden md:block" />
            <div className="space-y-8">
              {[
                { year: "1947", title: "البدايات الأولى", desc: "بدأت المحاولات الأولى للبث الإذاعي من العاصمة صنعاء باستخدام أجهزة إرسال بسيطة، وتركزت على تلاوة القرآن الكريم والأخبار الرسمية." },
                { year: "1962", title: "إذاعة الثورة والجمهورية", desc: "مع قيام ثورة السادس والعشرين من سبتمبر، تحولت الإذاعة إلى منبر وطني رئيسي يدافع عن الجمهورية وينقل بيانات الثورة." },
                { year: "1990", title: "مرحلة الوحدة اليمنية", desc: "أصبحت الإذاعة جزءاً من المؤسسة العامة اليمنية للإذاعة والتلفزيون، وواصلت دورها إذاعة وطنية جامعة." },
                { year: "اليوم", title: "صوت الشرعية اليمنية", desc: "تواصل الإذاعة رسالتها الوطنية وتعمل على تطوير حضورها الرقمي لمواكبة التحولات الإعلامية الحديثة." },
              
                ].map((item, i) => (
  <ScrollReveal key={i} delay={i * 150} direction="left">
    <div className="flex items-start gap-6 md:pr-16 relative">
      <div className="hidden md:flex absolute right-0 w-12 h-12 rounded-full bg-blue-600 text-white items-center justify-center font-black text-xs flex-shrink-0 shadow-lg z-10"
        style={{ transform: "translateX(50%)" }}>
        {item.year === "اليوم" ? "📍" : item.year.slice(2)}
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all w-full">
        <div className="text-blue-600 text-xs font-bold mb-1">{item.year}</div>
        <div className="text-slate-900 font-black text-lg mb-2">{item.title}</div>
        <div className="text-slate-600 leading-relaxed text-sm">{item.desc}</div>
      </div>
    </div>
  </ScrollReveal>
))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">المحتوى</div>
            <h2 className="text-slate-900 text-4xl font-black">خارطة برامجية متنوعة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "📰", title: "الإخبارية والسياسية", desc: "تغطيات، نشرات، تقارير ولقاءات تتابع الشأن اليمني والعربي والدولي" },
              { icon: "📚", title: "الثقافية والفكرية", desc: "برامج تهتم بالأدب والفكر والتاريخ والهوية اليمنية" },
              { icon: "👨‍👩‍👧", title: "الاجتماعية", desc: "قضايا الأسرة والشباب والمرأة والتعليم والصحة والتنمية" },
              { icon: "🕌", title: "الدينية", desc: "مواد وبرامج دينية تعزز قيم الوسطية والاعتدال والتسامح" },
              { icon: "🎵", title: "التراثية والفنية", desc: "الغناء اليمني الأصيل والتراث الشعبي والذاكرة الثقافية" },
              { icon: "🇾🇪", title: "المناسبات الوطنية", desc: "تغطيات خاصة بالمناسبات الثورية والدينية والفعاليات الرسمية" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <div className="text-slate-900 font-bold mb-1">{item.title}</div>
                  <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — dramatic */}
      <section className="relative py-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a8a 60%, #1d4ed8 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 blur-3xl -top-20 -right-20" />
          <div className="absolute w-96 h-96 rounded-full bg-blue-400/10 blur-3xl -bottom-20 -left-20" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-4">رسالتنا</div>
          <h2 className="text-white text-4xl font-black mb-4">الكلمة أمانة والأثير رسالة</h2>
          <p className="text-blue-200 mb-12 max-w-2xl mx-auto">على امتداد أكثر من سبعة عقود، بقينا حاضرين في وجدان اليمنيين — شاهدين على التاريخ، وناقلين لصوت الوطن.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            {[
              "الدفاع عن الجمهورية والهوية الوطنية اليمنية",
              "نقل الحقيقة بمهنية ومسؤولية كاملة",
              "الحفاظ على التراث الثقافي والإذاعي اليمني",
              "تعزيز قيم الوحدة الوطنية والتعايش",
              "دعم مؤسسات الدولة الشرعية",
              "مواكبة التطورات الإعلامية والتقنية الحديثة",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <span className="text-blue-400 font-black mt-0.5">✓</span>
                <span className="text-blue-100 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">بيانات</div>
            <h2 className="text-slate-900 text-2xl font-black">معلومات مختصرة</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {[
                { label: "الاسم الرسمي", value: "إذاعة الجمهورية اليمنية – البرنامج العام" },
                { label: "النوع", value: "إذاعة رسمية وطنية" },
                { label: "الدولة", value: "الجمهورية اليمنية" },
                { label: "اللغة", value: "العربية" },
                { label: "التغطية", value: "اليمن والعالم العربي" },
                { label: "البث الفضائي", value: "عرب سات بدر 4 — 12182 MHz" },
                { label: "الموجة القصيرة", value: "11860 كيلو هيرتز" },
                { label: "الهوية الحالية", value: "صوت الشرعية اليمنية" },
              ].map((item, i) => (
                <div key={item.label} className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${i % 2 === 0 ? "md:border-l border-slate-100" : ""}`}>
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-slate-900 font-semibold text-sm text-left">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">📻</div>
          <h3 className="text-slate-900 text-3xl font-black mb-3">هنا اليمن… هنا صوت الجمهورية</h3>
          <p className="text-slate-500 mb-8">استمع إلى برامجنا وحلقاتنا المتنوعة</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/programs"
              className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-200 text-sm">
              🎧 البرامج والحلقات
            </Link>
            <Link href="/#satellite"
              className="border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:border-blue-300 hover:text-blue-600 transition-all text-sm">
              📡 كيف تستمع
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="شعار" className="w-12 h-12 object-contain opacity-80" />
            <div>
              <div className="text-white font-black">إذاعة الجمهورية اليمنية</div>
              <div className="text-slate-400 text-sm">البرنامج العام • Yemen Radio</div>
            </div>
          </div>
          <div className="text-slate-600 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}
