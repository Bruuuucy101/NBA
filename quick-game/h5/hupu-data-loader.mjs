import {validLineups} from './daily-config.mjs';
// Optional prepared snapshot from the application's approved cloud gateway.
// Startup always uses bundled data. Never fetch league-wide raw APIs in H5.
const key='74-8-hupu-snapshot-v2';
export function mergeSnapshot(base,fresh){
 if(fresh?.version!==1||fresh.season!==base.season||fresh.teams?.length!==30||!Array.isArray(fresh.players)||!fresh.report?.complete)throw Error('更新资料不完整');
 const players=new Map(fresh.players.map(p=>[p.id,p]));
 const ids=new Set(base.players.map(p=>p.id));
 const teams=new Map(fresh.teams.map(t=>[t.id,t]));
 if(teams.size!==30||base.teams.some(t=>!teams.has(t.id)))throw Error('球队资料不完整');
 // Existing abilities, positions and rating sources remain exactly as shipped.
 const merged=base.players.map(p=>{const q=players.get(p.id);if(!q)return p;
 const stats={...p.stats};for(const k of Object.keys(stats))if(Number.isFinite(q.stats?.[k])&&q.stats[k]>=0)stats[k]=q.stats[k];
 return {...p,stats};});
 for(const p of fresh.players)if(!ids.has(p.id)){
  if(typeof p.id!=='string'||!['PG','SG','SF','PF','C'].includes(p.primaryPosition)||!Number.isInteger(p.overall)||p.overall<40||p.overall>99||!p.name||!p.ratings||!p.skills||!p.stats)throw Error('新增球员资料不完整');
  for(const v of [...Object.values(p.ratings),...Object.values(p.skills)])if(!Number.isFinite(v)||v<0||v>100)throw Error('新增评分无效');
  merged.push({...p,ratingSource:{...p.ratingSource,kind:'estimated'}});ids.add(p.id);
 }
 const nextTeams=base.teams.map(t=>{const q=teams.get(t.id);
 if(!Array.isArray(q.playerIds)||q.playerIds.length<5||q.playerIds.some(id=>!ids.has(id)))throw Error('名单包含未建模球员，保留完整内置资料');
 return {...t,playerIds:[...new Set(q.playerIds)],won:Number.isInteger(q.won)&&q.won>=0?q.won:t.won,lost:Number.isInteger(q.lost)&&q.lost>=0?q.lost:t.lost};});
 return {...base,players:merged,teams:nextTeams,dailyLineups:validLineups(fresh.dailyLineups)};
}
export async function loadLeague(){
 const base=JSON.parse(document.getElementById('bundled-league').textContent);
 if(base.version!==1||base.teams?.length!==30||!base.players?.length||!base.report?.complete)throw Error('内置资料不完整');
 let storage;try{storage=globalThis.localStorage;}catch{}
 let current=base;try{const cached=JSON.parse(storage?.getItem(key)||'null');if(cached)current=mergeSnapshot(base,cached);}catch{}
 // No waiting, countdown or startup timeout. An unavailable SDK leaves play intact.
 const url='https://app-cc42df721e-d3gre7iet325800bf-1252166086.ap-shanghai.app.tcloudbase.com/api';
 let attempts=0;
 const refresh=()=>{
  const cloud=globalThis.ColorboxAI?.cloud;
  if(!cloud?.request){if(++attempts<20)setTimeout(refresh,500);return;}
  Promise.resolve().then(()=>cloud.request({url:url+'/league/snapshot',method:'GET'})).then(res=>{
   if(res.statusCode!==200||![0,200].includes(res.code))return;
   mergeSnapshot(base,res.data);
   current.dailyLineups=validLineups(res.data.dailyLineups);
   globalThis.dispatchEvent?.(new Event('daily-config-updated'));
   try{storage?.setItem(key,JSON.stringify(res.data));}catch{}
  }).catch(()=>{});
 };
 refresh();
 setInterval(refresh,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 return current;
}
