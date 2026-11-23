// Run from workspace root. Produces an authenticated MCP migration request; never shipped in H5.
// node .../prepare-daily-lineup.mjs YYYY-MM-DD PG_ID SG_ID SF_ID PF_ID C_ID > work/cloud-sync/lineup-update.json
import {validLineups} from '../../h5/daily-config.mjs';
const [date,...ids]=process.argv.slice(2);
if(!validLineups({[date]:ids})[date])throw Error('日期或五个位置的球员 ID 无效（顺序：控卫、分卫、小前、大前、中锋）');
const sql=`INSERT INTO public.basketball_daily_lineups(challenge_date,starter_ids) VALUES ('${date}','${JSON.stringify(ids)}'::jsonb) ON CONFLICT(challenge_date) DO UPDATE SET starter_ids=EXCLUDED.starter_ids,updated_at=now();`;
const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
console.log(JSON.stringify({name:'managePgDatabase',arguments:{action:'applyMigration',sql,confirm:true,migrationName:'daily_lineup_'+date.replaceAll('-',''),migrationVersion:stamp,waitForTask:true}}));
