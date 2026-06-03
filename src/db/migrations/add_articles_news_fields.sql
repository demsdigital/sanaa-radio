-- Migration: add new fields to articles and news tables
-- Run this once against the production database (Neon PostgreSQL)
-- All columns use IF NOT EXISTS so it's safe to re-run

-- articles: new columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- news: new columns
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'عام';
ALTER TABLE news ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE news ADD COLUMN IF NOT EXISTS breaking BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE news ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS editor_name TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS news_date TIMESTAMPTZ;
ALTER TABLE news ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE news ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS gallery_images TEXT;
