import { db } from "@/db";
import { news, articles, programs } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap() {
  const baseUrl = "https://www.sanaaradio.org";

  const allNews = await db.select({ id: news.id, publishedAt: news.publishedAt }).from(news);
  const allArticles = await db.select({ slug: articles.slug, publishedAt: articles.publishedAt }).from(articles).where(eq(articles.published, true));
  const allPrograms = await db.select({ slug: programs.slug }).from(programs).where(eq(programs.active, true));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/programs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/schedule`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/team`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    ...allNews.map(n => ({
      url: `${baseUrl}/news/${n.id}`,
      lastModified: n.publishedAt,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    ...allArticles.map(a => ({
      url: `${baseUrl}/articles/${a.slug}`,
      lastModified: a.publishedAt,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    ...allPrograms.map(p => ({
      url: `${baseUrl}/programs/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
