export default function NewsArticleTemplate({
  article,
}: {
  article: {
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    category?: string;
    publishedAt?: string;
  };
}) {
  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Top Bar */}
      <section className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/news"
            className="flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-900"
          >
            العودة للأخبار
            <span>←</span>
          </a>

          <div className="text-sm text-slate-500">
            {article.publishedAt}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#10284a] to-[#2563eb]">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Content */}
            <div className="order-2 text-center lg:order-1 lg:text-right">
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
                {article.category || "أخبار الإذاعة"}
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                {article.title}
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-blue-100 lg:mx-0">
                {article.excerpt}
              </p>
            </div>

            {/* Featured Image */}
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
                <div className="aspect-[4/3] overflow-hidden bg-white/95 p-6">
                  <img
                    src={article.image || "/logo.png"}
                    alt={article.title}
                    className="h-full w-full rounded-2xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="relative mx-auto max-w-5xl px-6 py-14 lg:-mt-16">
        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          {/* Meta */}
          <div className="border-b border-slate-100 px-8 py-6 md:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">إذاعة الجمهورية اليمنية</div>
                <div className="font-bold text-slate-900">البرنامج العام</div>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {article.category || "أخبار الإذاعة"}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-10 md:px-12 md:py-14">
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-9 prose-li:text-slate-700 rtl:prose-p:text-right rtl:prose-headings:text-right rtl:prose-li:text-right"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-6 md:px-12">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <div className="text-sm text-slate-500">
                  الموقع الرسمي لإذاعة الجمهورية اليمنية
                </div>
                <div className="font-semibold text-slate-900">
                  Yemen Radio • البرنامج العام
                </div>
              </div>

              <a
                href="/news"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                العودة إلى الأخبار
              </a>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
