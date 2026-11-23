CREATE TABLE IF NOT EXISTS public.basketball_daily_lineups (
 challenge_date date PRIMARY KEY,
 starter_ids jsonb NOT NULL CHECK (jsonb_typeof(starter_ids)='array' AND jsonb_array_length(starter_ids)=5),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_daily_lineups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.basketball_daily_lineups FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.basketball_daily_lineups TO service_role;
CREATE OR REPLACE FUNCTION public.basketball_read() RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT payload || jsonb_build_object('dailyLineups',COALESCE((
  SELECT jsonb_object_agg(challenge_date::text,starter_ids) FROM basketball_daily_lineups
  WHERE challenge_date BETWEEN (now() AT TIME ZONE 'Asia/Shanghai')::date-1 AND (now() AT TIME ZONE 'Asia/Shanghai')::date+90
 ),'{}'::jsonb)) FROM basketball_snapshot WHERE id='nba';
$$;
REVOKE ALL ON FUNCTION public.basketball_read() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.basketball_read() TO service_role;
INSERT INTO public.basketball_daily_lineups(challenge_date,starter_ids) VALUES ('2026-11-21','["1901000000473221","1901000000443393","1901000000443105","1901000000470803","1901000000448416"]') ON CONFLICT DO NOTHING;
