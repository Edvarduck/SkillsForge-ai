-- SkillForge AI – path engine cache (weekly plan + analysis persist)
-- Run in Supabase Dashboard → SQL Editor (after 001 + 002)

CREATE TABLE public.path_engine_cache (
  user_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  weekly_plan_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  path_analysis_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  career_path_steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.path_engine_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "path_cache_select_own"
  ON public.path_engine_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "path_cache_insert_own"
  ON public.path_engine_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "path_cache_update_own"
  ON public.path_engine_cache FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "path_cache_delete_own"
  ON public.path_engine_cache FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.path_engine_cache TO authenticated;
