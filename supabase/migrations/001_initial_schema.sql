-- SkillForge AI – initial schema
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  weekly_hours_goal INTEGER NOT NULL DEFAULT 10 CHECK (weekly_hours_goal > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- career_goals
-- ---------------------------------------------------------------------------
CREATE TABLE public.career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_career_goals_user_id ON public.career_goals (user_id);

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.career_goals (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_goal_id ON public.milestones (goal_id);

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.career_goals (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_user_id ON public.skills (user_id);
CREATE INDEX idx_skills_goal_id ON public.skills (goal_id);

-- ---------------------------------------------------------------------------
-- learning_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills (id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions (user_id);
CREATE INDEX idx_learning_sessions_skill_id ON public.learning_sessions (skill_id);
CREATE INDEX idx_learning_sessions_session_date ON public.learning_sessions (session_date);

-- ---------------------------------------------------------------------------
-- badges (reference / gamification – read-only for users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- user_badges
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges (id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges (user_id);

-- ---------------------------------------------------------------------------
-- github_snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE public.github_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  languages_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  repos_count INTEGER NOT NULL DEFAULT 0,
  top_repos_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_github_snapshots_user_id ON public.github_snapshots (user_id);
CREATE INDEX idx_github_snapshots_fetched_at ON public.github_snapshots (fetched_at DESC);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  reason TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'engine' CHECK (source IN ('engine', 'github', 'manual')),
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_user_id ON public.recommendations (user_id);

-- ---------------------------------------------------------------------------
-- Seed badges (reference data)
-- ---------------------------------------------------------------------------
INSERT INTO public.badges (slug, title, description, icon, criteria_type)
VALUES
  ('first-session', 'Pirmoji sesija', 'Užregistruota pirmoji mokymosi sesija', '🎯', 'sessions_count'),
  ('ten-hours', '10 valandų', 'Iš viso praleista 10 mokymosi valandų', '⏱️', 'total_hours'),
  ('week-champion', 'Savaitės čempionas', 'Pasiektas savaitės valandų tikslas', '🏆', 'weekly_goal'),
  ('git-master', 'Git meistras', 'Aktyviai mokytasi Git įgūdžio', '🔀', 'skill_sessions')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER career_goals_set_updated_at
  BEFORE UPDATE ON public.career_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER skills_set_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- career_goals
CREATE POLICY "career_goals_select_own"
  ON public.career_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "career_goals_insert_own"
  ON public.career_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "career_goals_update_own"
  ON public.career_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "career_goals_delete_own"
  ON public.career_goals FOR DELETE
  USING (auth.uid() = user_id);

-- milestones (ownership via career_goals)
CREATE POLICY "milestones_select_own"
  ON public.milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.career_goals
      WHERE career_goals.id = milestones.goal_id
        AND career_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_insert_own"
  ON public.milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.career_goals
      WHERE career_goals.id = milestones.goal_id
        AND career_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_update_own"
  ON public.milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.career_goals
      WHERE career_goals.id = milestones.goal_id
        AND career_goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.career_goals
      WHERE career_goals.id = milestones.goal_id
        AND career_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_delete_own"
  ON public.milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.career_goals
      WHERE career_goals.id = milestones.goal_id
        AND career_goals.user_id = auth.uid()
    )
  );

-- skills
CREATE POLICY "skills_select_own"
  ON public.skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skills_insert_own"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_update_own"
  ON public.skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_delete_own"
  ON public.skills FOR DELETE
  USING (auth.uid() = user_id);

-- learning_sessions
CREATE POLICY "learning_sessions_select_own"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "learning_sessions_insert_own"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_sessions_update_own"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_sessions_delete_own"
  ON public.learning_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- badges: public read, no user writes
CREATE POLICY "badges_select_all"
  ON public.badges FOR SELECT
  TO authenticated, anon
  USING (true);

-- user_badges
CREATE POLICY "user_badges_select_own"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_own"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_update_own"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_delete_own"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);

-- github_snapshots
CREATE POLICY "github_snapshots_select_own"
  ON public.github_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "github_snapshots_insert_own"
  ON public.github_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_snapshots_update_own"
  ON public.github_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_snapshots_delete_own"
  ON public.github_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- recommendations
CREATE POLICY "recommendations_select_own"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recommendations_insert_own"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recommendations_update_own"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recommendations_delete_own"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- API role grants (required for Supabase REST / JS client)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
