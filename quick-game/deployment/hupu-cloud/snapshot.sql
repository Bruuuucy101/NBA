CREATE TABLE IF NOT EXISTS public.basketball_snapshot (id text PRIMARY KEY, payload jsonb, last_success timestamptz, lease_until timestamptz, lease_owner text);
ALTER TABLE public.basketball_snapshot ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.basketball_snapshot FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.basketball_read() RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT payload FROM basketball_snapshot WHERE id='nba'; $$;
CREATE OR REPLACE FUNCTION public.basketball_lock(p_owner text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r basketball_snapshot;
BEGIN
 INSERT INTO basketball_snapshot(id) VALUES('nba') ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM basketball_snapshot WHERE id='nba' FOR UPDATE;
 IF (r.last_success AT TIME ZONE 'Asia/Shanghai')::date = (now() AT TIME ZONE 'Asia/Shanghai')::date OR r.lease_until>now() THEN RETURN jsonb_build_object('skip',true); END IF;
 UPDATE basketball_snapshot SET lease_owner=p_owner,lease_until=now()+interval '10 minutes' WHERE id='nba';
 RETURN jsonb_build_object('skip',false,'payload',r.payload);
END $$;
CREATE OR REPLACE FUNCTION public.basketball_publish(p_owner text,p_payload jsonb,p_seed boolean DEFAULT false) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF jsonb_array_length(p_payload->'teams')<>30 OR jsonb_array_length(p_payload->'players')<300 OR p_payload#>>'{report,complete}'<>'true' THEN RAISE EXCEPTION 'incomplete snapshot'; END IF;
 UPDATE basketball_snapshot SET payload=p_payload,last_success=CASE WHEN p_seed THEN last_success ELSE now() END,lease_owner=null,lease_until=null WHERE id='nba' AND lease_owner=p_owner;
 RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION public.basketball_unlock(p_owner text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE basketball_snapshot SET lease_owner=null,lease_until=null WHERE id='nba' AND lease_owner=p_owner; $$;
REVOKE ALL ON FUNCTION public.basketball_read(),public.basketball_lock(text),public.basketball_publish(text,jsonb,boolean),public.basketball_unlock(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.basketball_read(),public.basketball_lock(text),public.basketball_publish(text,jsonb,boolean),public.basketball_unlock(text) TO service_role;
