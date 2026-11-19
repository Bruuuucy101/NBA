import fs from 'node:fs';
import {validResponse,cacheUsable,fetchWindow} from './api.mjs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.env.GAME_DATA_ROOT||path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'data/raw');fs.mkdirSync(dir,{recursive:true});
const host='https://games.mobileapi.hupu.com/3/8.2.62/basketballapi/';
const failures=[],sourceTimes=[];const refresh=process.argv.includes('--refresh'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(endpoint,params,key){
 const file=path.join(dir,key+'.json');
 if(fs.existsSync(file)&&!refresh){const cached=JSON.parse(fs.readFileSync(file));if(cacheUsable(cached)){sourceTimes.push(cached.fetchedAt);return cached.result;}}
 const url=host+endpoint+'?'+new URLSearchParams(params);
 for(let attempt=0;attempt<3;attempt++){
  await sleep(200+attempt*700);
  try{const body=JSON.parse(execFileSync('curl',['-fsSL','--max-time','25',url],{encoding:'utf8',maxBuffer:8e6}));
   if(!validResponse(body,endpoint))throw Error(body.errorMsg||body.msg||'API rejected');
   const fetchedAt=new Date().toISOString();sourceTimes.push(fetchedAt);fs.writeFileSync(file,JSON.stringify({url,fetchedAt,...body},null,2));return body.result;
  }catch(e){if(attempt===2){failures.push({key,error:e.message.slice(0,200)});return null;}}
 }
}
const seasons=await get('switchableRankSeasonList',{offline:'json',clientId:'0',rankType:'NBA_PLAYER_RANK'},'seasons');
if(!seasons?.seasonData?.some(s=>s.season==='2026-2027'&&s.seasonType==='REGULAR'))throw Error('Target season 2026-2027 unavailable');
const standing=await get('teamStandingList',{competitionLeagueType:'nba',competitionType:'nba',season:'2026-2027',competitionStageType:'REGULAR'},'standing');
if(!standing?.rankTypeListMap)throw Error('Standing unavailable');
const rows=[...new Map(Object.values(standing.rankTypeListMap).flat().map(t=>[String(t.teamId),t])).values()];
const snapshot={league:'nba',season:'2026-2027',seasonType:'REGULAR',fetchedAt:new Date().toISOString(),teams:[],failures};
for(const [index,row]of rows.entries()){
 const teamId=String(row.teamId),params={teamId,leagueType:'nba'};
 const info=await get('teamPageHeadInfo',params,`team-${teamId}`);
 const roster=await get('teamPlayerList',{...params,competitionType:'nba',competitionLeagueType:'nba'},`roster-${teamId}`);
 const salary=await get('salary/v1/query-team-salary-info',params,`salary-${teamId}`);
 const salaryMap=new Map((salary?.salaryPlayerTable?.items||[]).map(r=>[String(r.playerId),r]));
 const team={teamId,standing:row,info,salaryPlate:salary?.salaryGeneralViewPlate||null,players:[]};
 for(const r of roster?.list||[]){
  const playerId=String(r.playerId);
  const profile=await get('playerPageHeadInfo',{playerId,leagueType:'nba'},`player-${playerId}`);
  team.players.push({playerId,roster:r,profile:profile?.player||profile,salaryRow:salaryMap.get(playerId)||null});
 }
 snapshot.teams.push(team);fs.writeFileSync(path.join(root,'data/snapshot.json'),JSON.stringify(snapshot,null,2));
 console.log(`${index+1}/${rows.length} ${row.teamName}: ${team.players.length} players, failures ${failures.length}`);
}
snapshot.completedAt=new Date().toISOString();snapshot.fetchWindow=fetchWindow(sourceTimes);snapshot.fetchedAt=snapshot.fetchWindow.from;fs.writeFileSync(path.join(root,'data/snapshot.json'),JSON.stringify(snapshot,null,2));
console.log('SYNC COMPLETE');
