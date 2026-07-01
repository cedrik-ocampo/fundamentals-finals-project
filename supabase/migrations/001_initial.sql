-- ============================================================
-- AniTrack — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTR(NEW.id::TEXT, 1, 4),
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── diary_entries ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diary_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anilist_id      INTEGER NOT NULL,
  anime_title     TEXT NOT NULL,
  anime_cover_url TEXT,
  genres          TEXT[],
  date_started    DATE,
  date_completed  DATE,
  rating          NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  rewatch         BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diary_user_completed ON diary_entries (user_id, date_completed DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_diary_user_anilist   ON diary_entries (user_id, anilist_id);

-- ─── lists ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  list_type   TEXT NOT NULL DEFAULT 'custom'
                CHECK (list_type IN ('watchlist', 'favorites', 'custom')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lists_user ON lists (user_id, created_at DESC);

-- ─── list_items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS list_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  anilist_id      INTEGER NOT NULL,
  anime_title     TEXT NOT NULL,
  anime_cover_url TEXT,
  position        INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, anilist_id)
);

CREATE INDEX IF NOT EXISTS idx_list_items_list ON list_items (list_id, position ASC);

-- ─── reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anilist_id        INTEGER NOT NULL,
  anime_title       TEXT NOT NULL,
  anime_cover_url   TEXT,
  rating            NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  body              TEXT NOT NULL,
  contains_spoilers BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, anilist_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_anilist  ON reviews (anilist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user     ON reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_popular  ON reviews (anilist_id, likes_count DESC);

-- ─── review_likes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_likes (
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

CREATE OR REPLACE FUNCTION sync_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET likes_count = likes_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_likes_count ON review_likes;
CREATE TRIGGER trg_review_likes_count
  AFTER INSERT OR DELETE ON review_likes
  FOR EACH ROW EXECUTE FUNCTION sync_review_likes_count();

-- ─── comments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_review ON comments (review_id, created_at ASC);

-- ─── follows ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows (follower_id);

-- ─── activity ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL
                    CHECK (activity_type IN (
                      'diary_entry', 'review', 'list_created',
                      'list_item_added', 'follow'
                    )),
  reference_id    UUID,
  anilist_id      INTEGER,
  anime_title     TEXT,
  anime_cover_url TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity (created_at DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity      ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- diary_entries
CREATE POLICY "diary_select" ON diary_entries FOR SELECT USING (true);
CREATE POLICY "diary_insert" ON diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diary_update" ON diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diary_delete" ON diary_entries FOR DELETE USING (auth.uid() = user_id);

-- lists
CREATE POLICY "lists_select" ON lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "lists_insert" ON lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lists_update" ON lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "lists_delete" ON lists FOR DELETE USING (auth.uid() = user_id);

-- list_items (visibility follows parent list)
CREATE POLICY "list_items_select" ON list_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lists
    WHERE lists.id = list_items.list_id
      AND (lists.is_public = true OR lists.user_id = auth.uid())
  ));
CREATE POLICY "list_items_insert" ON list_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = list_id AND lists.user_id = auth.uid()
  ));
CREATE POLICY "list_items_delete" ON list_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM lists WHERE lists.id = list_id AND lists.user_id = auth.uid()
  ));

-- reviews
CREATE POLICY "reviews_select"  ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert"  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update"  ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete"  ON reviews FOR DELETE USING (auth.uid() = user_id);

-- review_likes
CREATE POLICY "likes_select" ON review_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON review_likes FOR DELETE USING (auth.uid() = user_id);

-- comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- follows
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- activity
CREATE POLICY "activity_select" ON activity FOR SELECT USING (true);
CREATE POLICY "activity_insert" ON activity FOR INSERT WITH CHECK (auth.uid() = user_id);
