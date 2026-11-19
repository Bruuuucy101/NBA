import {dailyPool} from './daily-pool.mjs';
export const SLOTS=['PG','SG','SF','PF','C','PG','SG','SF','PF','C'];
export function dayKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function validDay(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function previousDay(date){return new Date(Date.parse(date+'T00:00:00Z')-86400000).toISOString().slice(0,10);}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function generator(seed){let n=seed;return()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function eligibleSlots(p){
 if(p.primaryPosition)return [p.primaryPosition];
 const pos=p.position||'',height=Number(p.height)||2.01;
 if(/中锋|C/.test(pos))return ['PF','C'];
 if(/后卫|PG|SG/.test(pos))return ['PG','SG'];
 if(/锋卫/.test(pos))return (p.stats?.asts||0)>=4?['PG','SG','SF']:['SG','SF'];
 return height>=2.08?['SF','PF','C']:['SF','PF'];
}
function sample(pool,n,rng){const bag=[...pool],out=[];while(out.length<n&&bag.length){out.push(bag.splice(Math.floor(rng()*bag.length),1)[0]);}return out;}
export function createChallenge(data,date=dayKey()){
 if(!validDay(date))throw Error('Invalid daily date');
 const referenceMode=data.players.some(p=>p.ratingSource?.kind==='screenshot');
 const players=referenceMode?dailyPool:[...data.players].filter(p=>!p.leaveTeam);
 if(referenceMode){const ids=new Set(data.players.map(p=>p.id));if(dailyPool.some(p=>!ids.has(p.id)))throw Error('今日之队资料不完整，请重新加载');}
 const key=`daily-v4-fixed:${date}`,seed=hash(key),rng=generator(seed);
 const used=new Set(),opponentIds=[];
 // Strong positional starters; backups are also selected from the upper rotation tier.
 for(let i=0;i<10;i++){
  const pool=players.filter(p=>!used.has(p.id)&&eligibleSlots(p).includes(SLOTS[i])).sort((a,b)=>b.overall-a.overall||a.id.localeCompare(b.id)).slice(0,i<5?3:6);
  if(!pool.length)throw Error('该位置可用球员不足');
  const p=sample(pool,1,rng)[0];used.add(p.id);opponentIds.push(p.id);
 }
 return {date,key,seed,opponentIds,slots:[...SLOTS],modelVersion:data.modelVersion||'v1'};
}
export function createDraft(challenge,attempt=0){return {version:3,attempt,date:challenge.date,key:challenge.key,franchise:{name:'我的球队',abbreviation:'我的队'},starPosition:'PG',picks:[],lineup:[],actions:[],rerollsLeft:3,roll:0,excluded:[]};}
export function configureDraft(draft,config){
 if(draft.actions.length)throw Error('选秀开始后不能修改球队设置');
 const name=String(config.name||'').trim(),abbreviation=String(config.abbreviation||'').trim();
 if(!name||name.length>24||!abbreviation||abbreviation.length>6||!SLOTS.slice(0,5).includes(config.starPosition))throw Error('球队名称限1–24字，简称限1–6字，请选择球星位置');
 return {...draft,franchise:{name,abbreviation},starPosition:config.starPosition};
}
export function draftChoices(data,challenge,draft){
 if(draft.key!==challenge.key||draft.date!==challenge.date||!Array.isArray(draft.picks))throw Error('选秀已过期');
 const round=draft.picks.length;if(round>=10)return [];
 const used=new Set([...challenge.opponentIds,...draft.picks,...draft.excluded]);
 const slot=draftSlot(draft);
 const rng=generator(hash(`${challenge.key}:star:${draft.starPosition}:round:${round}:roll:${draft.roll}:${draft.picks.join(',')}${draft.attempt?':attempt:'+draft.attempt:''}`));
 let pool=data.players.filter(p=>!p.leaveTeam&&!used.has(p.id)&&eligibleSlots(p).includes(slot));
 if(round===0){pool=pool.filter(p=>eligibleSlots(p).includes(draft.starPosition)).sort((a,b)=>b.overall-a.overall||a.id.localeCompare(b.id)).slice(0,12);}
 else{
  // Draw each candidate independently: ordinary rotation players are common, stars rare.
  pool.sort((a,b)=>a.id.localeCompare(b.id));
  const bands=[[0,74,.35],[75,79,.25],[80,85,.32],[86,89,.07],[90,99,.01]],out=[];
  for(let n=0;n<3;n++){
   const available=bands.map(([min,max,weight])=>({weight,players:pool.filter(p=>p.overall>=min&&p.overall<=max&&!out.some(x=>x.id===p.id))})).filter(b=>b.players.length);
   if(!available.length)throw Error('候选球员不足');
   let roll=rng()*available.reduce((sum,b)=>sum+b.weight,0),selected=available.at(-1);
   for(const band of available){roll-=band.weight;if(roll<0){selected=band;break;}}
   out.push(sample(selected.players,1,rng)[0]);
  }
  return out;
 }
 if(pool.length<3)throw Error('候选球员不足');
 return sample(pool,3,rng);
}
function initialLineup(picks,starPosition){const order=Array(5).fill(null);order[SLOTS.indexOf(starPosition)]=picks[0];let n=1;for(let i=0;i<5;i++)if(!order[i])order[i]=picks[n++];return [...order,...picks.slice(5)];}
export function pickPlayer(data,challenge,draft,id){
 const shown=draftChoices(data,challenge,draft);
 if(!shown.some(p=>p.id===id))throw Error('该球员不在当前轮次候选名单中');
 const picks=[...draft.picks,id];
 return {...draft,picks,lineup:picks.length===10?initialLineup(picks,draft.starPosition):[],actions:[...draft.actions,{type:'pick',id}],roll:0,excluded:[...draft.excluded,...shown.map(p=>p.id)]};
}
export function rerollDraft(data,challenge,draft){
 if(draft.picks.length>=10||draft.rerollsLeft<=0)throw Error('重抽次数已用完');
 const excluded=[...draft.excluded,...draftChoices(data,challenge,draft).map(p=>p.id)];
 return {...draft,rerollsLeft:draft.rerollsLeft-1,roll:draft.roll+1,excluded,actions:[...draft.actions,{type:'reroll'}]};
}
export function setLineup(draft,order,data){
 if(draft.picks.length!==10||!Array.isArray(order)||order.length!==10||new Set(order).size!==10||order.some(id=>!draft.picks.includes(id)))throw Error('阵容必须包含全部十名已选球员且不能重复');
 const map=new Map(data.players.map(p=>[p.id,p]));
 if(order.some((id,i)=>!eligibleSlots(map.get(id)).includes(SLOTS[i])))throw Error('只能将球员安排在其适配位置，请交换相同位置的首发与替补');
 return {...draft,lineup:[...order]};
}
export function optimizeLineup(data,draft){
 if(draft.picks.length!==10)throw Error('请先完成选秀');
 const map=new Map(data.players.map(p=>[p.id,p])),players=draft.picks.map(id=>map.get(id)),slots=SLOTS;
 // Exact position-compatible assignment across all ten slots (bitmask DP).
 const memo=new Map();
 function solve(slot,mask){if(slot===10)return {score:0,ids:[]};const key=slot+':'+mask;if(memo.has(key))return memo.get(key);let best={score:-Infinity,ids:[]};
  for(let i=0;i<10;i++)if(!(mask&(1<<i))){const p=players[i];if(!eligibleSlots(p).includes(slots[slot]))continue;const next=solve(slot+1,mask|(1<<i));const score=p.overall*(slot<5?2:1)+next.score;if(score>best.score)best={score,ids:[p.id,...next.ids]};}
  memo.set(key,best);return best;
 }
 return setLineup(draft,solve(0,0).ids,data);
}
export function restoreDraft(raw,data,challenge){
 let draft=createDraft(challenge);
 try{const saved=typeof raw==='string'?JSON.parse(raw):raw;if(saved?.version!==3||saved.date!==challenge.date||saved.key!==challenge.key||!Array.isArray(saved.actions)||saved.actions.length>13)return draft;
  if(!Number.isSafeInteger(saved.attempt??0)||(saved.attempt??0)<0)throw Error('Invalid attempt');
  draft=createDraft(challenge,saved.attempt??0);
  draft=configureDraft(draft,{...saved.franchise,starPosition:saved.starPosition});
  for(const action of saved.actions){if(action.type==='pick')draft=pickPlayer(data,challenge,draft,action.id);else if(action.type==='reroll')draft=rerollDraft(data,challenge,draft);else throw Error('Invalid action');}
  if(JSON.stringify(draft.picks)!==JSON.stringify(saved.picks)||draft.rerollsLeft!==saved.rerollsLeft)throw Error('Invalid replay');
  if(draft.picks.length===10)draft=setLineup(draft,saved.lineup,data);
  return draft;
 }catch{return createDraft(challenge);}
}
export function cleanRecord(raw,today=dayKey()){
 try{const saved=typeof raw==='string'?JSON.parse(raw):raw;return {version:1,wins:[...new Set((Array.isArray(saved?.wins)?saved.wins:[]).filter(d=>validDay(d)&&d<=today))].sort()};}catch{return {version:1,wins:[]};}
}
export function recordResult(raw,date,won,today=dayKey()){
 const record=cleanRecord(raw,today);
 if(!won||!validDay(date)||date>today||record.wins.includes(date))return record;
 return {version:1,wins:[...record.wins,date].sort()};
}
export function streakForDay(raw,today=dayKey()){
 if(!validDay(today))return 0;
 const wins=new Set(cleanRecord(raw,today).wins);let date=wins.has(today)?today:previousDay(today),count=0;
 while(wins.has(date)){count++;date=previousDay(date);}return count;
}
export function buildDailyTeams(data,challenge,draft){
 if(draft.picks.length!==10||JSON.stringify(restoreDraft(draft,data,challenge))!==JSON.stringify(draft))throw Error('请完成十轮选秀');
 const players=new Map(data.players.map(p=>[p.id,p]));
 const make=(id,name,ids,color,abbreviation)=>({id,name,abbreviation,fullName:name,color,logo:'',players:ids.map(id=>players.get(id)),startingIds:ids.slice(0,5),rotationIds:ids});
 return {home:make('daily-player',draft.franchise.name,draft.lineup,'#e91850',draft.franchise.abbreviation),away:make('daily-opponent','今日之队',challenge.opponentIds,'#3684ff','今日之队')};
}
export function mergeRecords(first,second,today=dayKey()){
 return {version:1,wins:[...new Set([...cleanRecord(first,today).wins,...cleanRecord(second,today).wins])].sort()};
}

export function restartDraft(challenge,draft){
 if(draft.key!==challenge.key||draft.date!==challenge.date)throw Error("选秀已过期");
 return configureDraft(createDraft(challenge,(draft.attempt??0)+1),{...draft.franchise,starPosition:draft.starPosition});
}

export function draftSlot(draft){return [draft.starPosition,...SLOTS.slice(0,5).filter(s=>s!==draft.starPosition),...SLOTS.slice(5)][draft.picks.length];}
