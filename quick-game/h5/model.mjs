const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function numeric(v){if(v===null||v===undefined||v===''||v==='--'||v==='-')return null;const n=Number(String(v).replace('%',''));return Number.isFinite(n)?n:null;}
const statKeys=['pts','reb','asts','min','fgp','tpp','ftp','stl','blk','to','oreb','dreb','pf'];
export function ratePlayer(raw){
 const r=raw.roster||{},p=raw.profile||{}; const stats=Object.fromEntries(statKeys.map(k=>[k,numeric(r[k])]));
 const gp=numeric(String(r.game_played_start??'').split('/')[0]);stats.games=gp;
 const position=String(p.position||r.position||'未知');
 const role=/中锋|C/.test(position)?'big':/后卫/.test(position)?'guard':'wing';
 const priors={guard:{pts:12,reb:3,asts:3,stl:.8,blk:.2,tpp:35,ftp:79,fgp:44},wing:{pts:12,reb:5,asts:2,stl:.7,blk:.4,tpp:34,ftp:76,fgp:46},big:{pts:11,reb:7,asts:1.8,stl:.6,blk:1,tpp:27,ftp:70,fgp:53}}[role];
 const exposure=Math.max(0,(gp||0)*(stats.min||0));
 const confidence=exposure/(exposure+120);
 const shrink=(key,prior)=>stats[key]===null?prior:prior+(stats[key]-prior)*confidence;
 const min=shrink('min',18);
 const per36=k=>shrink(k,priors[k])*36/Math.max(14,min);
 // Without shot attempts, percentages are deliberately conservative proxies.
 // No attempt counts are invented from minutes or points.
 const shotConfidence=Math.min(.65,exposure/(exposure+400));
 const observedThree=stats.tpp==null||stats.tpp===0?priors.tpp:clamp(stats.tpp,22,44);
 const effectiveThree=priors.tpp+(observedThree-priors.tpp)*shotConfidence;
 const effectiveFree=priors.ftp+((stats.ftp==null||stats.ftp===0?priors.ftp:clamp(stats.ftp,45,96))-priors.ftp)*shotConfidence;
 const ratings={
  scoring:Math.round(clamp(40+(per36('pts')*.7+shrink('pts',priors.pts)*.3)*1.55+(shrink('fgp',priors.fgp)-47)*.22,40,99)),
  shooting:Math.round(clamp(60+(effectiveThree-30)*2.5+(effectiveFree-70)*.45,40,99)),
  playmaking:Math.round(clamp(42+per36('asts')*5.9,40,99)),
  rebounding:Math.round(clamp(38+per36('reb')*4.6,40,99)),
  defense:Math.round(clamp(48+per36('stl')*12+per36('blk')*8+per36('reb')*.4,40,96)),
  stamina:Math.round(clamp(55+min*1.05,45,96))
 };
 const weights=role==='big'?[.30,.08,.12,.22,.22,.06]:role==='guard'?[.33,.22,.22,.04,.13,.06]:[.34,.18,.13,.12,.17,.06];
 const baseScore=Object.values(ratings).reduce((sum,v,i)=>sum+v*weights[i],0);
 const impactScore=+(baseScore+Math.min(stats.min||0,38)*.25+shrink('pts',priors.pts)*.12).toFixed(4);
 const overall=Math.round(clamp(baseScore,60,98));
 const missing=statKeys.filter(k=>stats[k]===null);
 const estimates=['defense','stamina','shooting'];
 if(stats.pts===null||!gp)estimates.push('scoring');if(stats.tpp===null||stats.ftp===null||!gp)estimates.push('shooting');
 if(stats.asts===null||!gp)estimates.push('playmaking');if(stats.reb===null||!gp)estimates.push('rebounding');
 return {id:String(raw.playerId),shortName:p.alias||r.player_name||p.name||'球员',name:p.name||r.player_name||p.alias||'未命名球员',english:p.eng_name||null,position,number:String(p.number??r.number??'—'),photo:r.player_header_big||p.photo||r.player_header||null,height:p.height||null,age:p.age||null,injury:r.is_injured??null,leaveTeam:p.leaveTeam===true,stats,ratings,skills:{interiorDefense:Math.round(clamp(44+per36('blk')*14+per36('reb')*1.7,40,99)),perimeterDefense:Math.round(clamp(48+per36('stl')*17+per36('asts')*.5,40,99))},overall,impactScore,role,shotVolumeKnown:false,modelVersion:'ratings-v2',confidence:+confidence.toFixed(3),estimates:[...new Set(estimates)],missing,profileAvailable:!!raw.profile};
}
export function buildDataset(snapshot){
 if(snapshot.season!=='2026-2027')throw Error('Target season mismatch');
 const players=new Map(),members=new Map(),conflicts=[],duplicateRows=[],teams=[];
 for(const t of snapshot.teams){
  const ids=[]; const info=t.info?.info||t.info||{};
  for(const raw of t.players||[]){const id=String(raw.playerId);if(ids.includes(id)){duplicateRows.push({teamId:t.teamId,playerId:id});continue;}
   ids.push(id);const memberships=members.get(id)||[];memberships.push(String(t.teamId));members.set(id,memberships);
   if(!players.has(id))players.set(id,ratePlayer(raw));
  }
  teams.push({id:String(t.teamId),name:t.standing.teamName,english:info.en_name||null,fullName:info.full_name||t.standing.teamName,logo:(t.standing.logoLink||info.logoLink||'').replace(/^http:/,'https:'),color:/^#?[a-f\d]{6}$/i.test(info.dayColor||'')?'#'+info.dayColor.replace('#',''):'#6786ff',conference:t.standing.rankType,won:t.standing.won,lost:t.standing.lost,playerIds:ids});
 }
 for(const[id,ids]of members){if(ids.length>1)conflicts.push({playerId:id,teamIds:ids});}
 // Ambiguous active membership is excluded from match rosters, not silently assigned.
 for(const t of teams)t.playerIds=t.playerIds.filter(id=>members.get(id).length===1&&!players.get(id).leaveTeam);
 const list=calibrateRatings([...players.values()]);
 const report={targetSeason:'2026-2027',actualSeason:snapshot.season,fetchedAt:snapshot.fetchedAt,fetchWindow:snapshot.fetchWindow||null,completedAt:snapshot.completedAt||null,teamCount:teams.length,playerCount:list.length,profileCount:list.filter(p=>p.profileAvailable).length,profileCoverage:list.length?list.filter(p=>p.profileAvailable).length/list.length:0,teams:teams.map(t=>({id:t.id,name:t.name,players:t.playerIds.length})),membershipConflicts:conflicts,duplicateRows,leaveTeam:list.filter(p=>p.leaveTeam).map(p=>p.id),missingStats:list.filter(p=>p.missing.length).map(p=>({id:p.id,name:p.name,fields:p.missing})),failures:snapshot.failures||[],complete:teams.length===30&&teams.every(t=>t.playerIds.length>=5)&&list.every(p=>p.profileAvailable)&&!conflicts.length&&!(snapshot.failures||[]).length,scope:'抓取时球队当前名单并集；阵容接口不接受 season，名单与统计赛季由接口当前状态决定，无法独立证明每条统计均属于目标赛季。',statSeasonVerified:false};
 return {version:1,modelVersion:'ratings-v2',season:snapshot.season,source:'虎扑 basketball-modeling-dataset',players:list,teams,report};
}

export function sortRoster(players){return [...players].sort((a,b)=>(b.stats?.min??0)-(a.stats?.min??0)||b.overall-a.overall);}

export function calibrateRatings(players){
 const scores=players.map(p=>p.impactScore).sort((a,b)=>a-b);
 const anchors=[[0,60],[.15,67],[.5,74],[.75,80],[.90,85],[.97,91],[.99,95],[1,98]];
 return players.map(p=>{
  const less=scores.filter(s=>s<p.impactScore).length;
  const equal=scores.filter(s=>s===p.impactScore).length;
  const percentile=scores.length<=1?.5:(less+(equal-1)/2)/(scores.length-1);
  let overall=60;
  for(let i=1;i<anchors.length;i++)if(percentile<=anchors[i][0]){const[a,x]=anchors[i-1],[b,y]=anchors[i];overall=Math.round(x+(y-x)*(percentile-a)/(b-a));break;}
  if(p.stats.min==null||p.stats.games==null||p.stats.games===0)overall=Math.min(overall,65);
  return {...p,overall,percentile:+percentile.toFixed(4)};
 });
}
