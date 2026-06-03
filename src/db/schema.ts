import { pgTable, serial, text, boolean, timestamp, integer, json } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("team"),
  permissions: json("permissions").$type<string[]>().default([]),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  youtubePlaylistUrl: text("youtube_playlist_url"),
  category: text("category").notNull().default("general"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  audioUrl: text("audio_url"),
  youtubeUrl: text("youtube_url"),
  duration: integer("duration"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scheduleVersions = pgTable("schedule_versions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  active: boolean("active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schedule = pgTable("schedule", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id, { onDelete: "set null" }),
  label: text("label").notNull(),
  day: text("day").notNull(),
  timeStart: text("time_start").notNull(),
  timeEnd: text("time_end").notNull(),
  type: text("type").notNull().default("recorded"),
  color: text("color").default("blue"),
  versionId: integer("version_id").references(() => scheduleVersions.id, { onDelete: "set null" }),
});
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  tweetUrl: text("tweet_url"),
  youtubeUrl: text("youtube_url"),
  sourceLabel: text("source_label"),
  sourceUrl: text("source_url"),
  category: text("category").default("عام"),
  published: boolean("published").notNull().default(true),
  breaking: boolean("breaking").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  editorName: text("editor_name"),
  newsDate: timestamp("news_date"),
  scheduledAt: timestamp("scheduled_at"),
  tags: text("tags"),
  metaDescription: text("meta_description"),
  galleryImages: text("gallery_images"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: text("body").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  authorName: text("author_name"),
  category: text("category").notNull().default("عام"),
  published: boolean("published").notNull().default(true),
  tags: text("tags"),
  scheduledAt: timestamp("scheduled_at"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull().default("عام"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // image | audio | document
  folder: text("folder").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name"),
  url: text("url").notNull(),
  r2Key: text("r2_key").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeAchievements = pgTable("exchange_achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year"),
  organization: text("organization"),
  description: text("description"),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeStats = pgTable("exchange_stats", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  suffix: text("suffix"),
  year: integer("year"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeReports = pgTable("exchange_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year"),
  description: text("description"),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangePartners = pgTable("exchange_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeItems = pgTable("exchange_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  fileUrl: text("file_url"),
  category: text("category").notNull().default("program"),
  producer: text("producer"),
  duration: integer("duration"),
  downloadable: boolean("downloadable").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

