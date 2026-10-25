CREATE TABLE public.user_calendars (
  user_id uuid PRIMARY KEY,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  calendar_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_calendars TO authenticated;
GRANT ALL ON public.user_calendars TO service_role;

ALTER TABLE public.user_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar" ON public.user_calendars
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own calendar" ON public.user_calendars
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar" ON public.user_calendars
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_calendars_updated_at
  BEFORE UPDATE ON public.user_calendars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();