type Article = {
  title: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  category?: string | null;
  publishedAt?: string | Date | null;
  author?: string | null;
};

function formatDate(date?: string | Date | null) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("ar-YE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return String(date);
  }
}

export default function NewsArticleTemplate({
  article,
}: {
  article: Article;
}) {
  const publishedDate = formatDate(article?.publishedAt);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a
            href="/news"
            className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            ← العودة للأخبار
          </a>

          <span className="text-sm text-slate-500">
            إذاعة الجمهورية اليمنية
          </span>
        </div>
      </section>

      {/* Article */}
      <article className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        {/* Category */}
        <div className="mb-5">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            {article?.category || "أخبار الإذاعة"}
          </span>
        </div>

        {/* Title */}
        <header className="max-w-3xl">
          <h1 className="text-3xl font-black leading-[1.35] tracking-tight text-slate-950 md:text-5xl">
            {article?.title || "عنوان الخبر"}
          </h1>

          {article?.excerpt ? (
            <p className="mt-5 text-lg leading-9 text-slate-600 md:text-xl">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-slate-200 py-4 text-sm text-slate-500">
            <span>{article?.author || "فريق التحرير"}</span>
            {publishedDate ? <span>•</span> : null}
            {publishedDate ? <time>{publishedDate}</time> : null}
          </div>
        </header>

        {/* Featured Image */}
        {article?.image ? (
          <figure className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-100">
              <img
                src={article.image}
                alt={article?.title || "صورة الخبر"}
                className="h-auto max-h-[460px] w-full object-contain"
              />
            </div>
          </figure>
        ) : null}

        {/* Content */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-950 prose-p:leading-9 prose-p:text-slate-700 prose-li:leading-8 prose-li:text-slate-700 prose-a:font-semibold prose-a:text-blue-700 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:text-slate-700 rtl:prose-headings:text-right rtl:prose-p:text-right rtl:prose-li:text-right"
              dangerouslySetInnerHTML={{ __html: article?.content || "" }}
            />
          </div>

          {/* Side Info */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <img
                    src="/logo.png"
                    alt="إذاعة الجمهورية اليمنية"
                    className="h-9 w-9 object-contain"
                  />
                </div>

                <div>
                  <div className="font-black text-slate-950">
                    إذاعة الجمهورية اليمنية
                  </div>
                  <div className="text-sm text-slate-500">البرنامج العام</div>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                تابع آخر الأخبار والبرامج عبر الموقع الرسمي لإذاعة الجمهورية اليمنية.
              </p>

              <a
                href="/programs"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                تصفح البرامج
              </a>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
