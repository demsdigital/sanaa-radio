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
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo.png" alt="شعار إذاعة الجمهورية اليمنية" className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-xl" />
          <h1 className="text-3xl font-black mb-2">إذاعة الجمهورية اليمنية</h1>
          <p className="text-blue-200 text-lg">البرنامج العام • Yemen Radio</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10">

          <div>
            <h2 className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">من نحن</h2>
            <h3 className="text-slate-900 text-xl font-black mb-4">صوت اليمن الحقيقي</h3>
            <p className="text-slate-600 leading-relaxed">
              إذاعة الجمهورية اليمنية — البرنامج العام، هي إذاعة رسمية تبث من صنعاء لتغطية كافة أرجاء الجمهورية اليمنية والمهجر العربي والعالمي. تأسست الإذاعة منذ عقود لتكون صوت المواطن اليمني وحاملة رسالة الكلمة الصادقة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📻", title: "البث الفضائي", desc: "نبث عبر القمر الصناعي عرب سات بدر 4 لتغطية كاملة في الوطن العربي" },
              { icon: "📡", title: "الموجة القصيرة", desc: "نصل إليك أينما كنت عبر الموجة القصيرة على تردد 11860 كيلو هيرتز" },
              { icon: "🌐", title: "الأرشيف الرقمي", desc: "أرشيف كامل للبرامج والحلقات متاح للاستماع في أي وقت" },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-slate-900 font-bold mb-2">{item.title}</div>
                <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-3">رسالتنا</h2>
            <h3 className="text-slate-900 text-xl font-black mb-4">الكلمة أمانة والأثير رسالة</h3>
            <p className="text-slate-600 leading-relaxed">
              نؤمن بأن الإذاعة ليست مجرد وسيلة إعلام، بل هي رسالة تحمل قيم الصدق والأمانة وخدمة المجتمع. نسعى دائماً لتقديم محتوى إذاعي متميز يعكس هوية اليمن الحضارية ويخدم المستمع أينما كان.
            </p>
          </div>

          <div className="bg-blue-600 text-white rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black mb-2">استمع إلينا الآن</h3>
            <p className="text-blue-100 text-sm mb-6">تابع برامجنا وحلقاتنا المتنوعة</p>
            <Link href="/programs" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              🎧 البرامج والحلقات
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
