import {balancedOutcome} from './balanced-outcome.mjs';
import {sortRoster} from './model.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const other=s=>s==='home'?'away':'home';
export const tacticOptions={pace:['slow','normal','fast'],focus:['inside','balanced','outside'],defense:['balanced','stay_home','paint','switch','perimeter','pressure','zone'],rotation:['tight','balanced','deep'],offRebound:['get_back','balanced','crash'],defRebound:['push','balanced','boxout'],aggression:['solid','balanced','aggressive'],playbook:['balanced','spread','pick_and_roll','motion','attack_rim','feed_post','isolation']};
const defaults={pace:'normal',focus:'balanced',defense:'balanced',rotation:'balanced',offRebound:'balanced',defRebound:'balanced',aggression:'balanced',playbook:'balanced',initiator:'auto'};
function random(g){g.rng=(g.rng+0x6D2B79F5)>>>0;let t=g.rng;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
function outcome(g,side,key,p){if(!g.dailyOutcomes)return random(g)<p;const id=side+':'+key;return balancedOutcome(g.dailyOutcomes,id,p,g.dailyOutcomes[id]?0:random(g));}
function pick(g,items,weight=()=>1){let weights=items.map(p=>Math.max(.01,weight(p))),n=random(g)*weights.reduce((a,b)=>a+b,0);for(let i=0;i<items.length;i++){n-=weights[i];if(n<=0)return items[i];}return items.at(-1);}
function makeSide(team){
 const sorted=sortRoster(structuredClone(team.players));
 const order=[...new Set([...(team.startingIds||[]),...(team.rotationIds||[]),...sorted.map(p=>p.id)])];
 const players=order.map(id=>sorted.find(p=>p.id===id));
 return{team:{...team,players:undefined},players,score:0,possessionSeconds:0,paintPoints:0,fastPoints:0,quarters:[0],tactics:{...defaults},autoCoach:false,nextCoach:0,lineup:[0,1,2,3,4],nextRotation:0,box:players.map(p=>({id:p.id,name:p.name,position:p.position,seconds:0,pts:0,reb:0,oreb:0,asts:0,stl:0,blk:0,to:0,pf:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,plusMinus:0,stint:0}))};
}
export function createGame(home,away,seed=1){
 if(home.id===away.id)throw Error('请选择不同球队');
 for(const t of [home,away])if(!Array.isArray(t.players)||t.players.length<5||new Set(t.players.map(p=>p.id)).size!==t.players.length)throw Error('球队需要至少5名不重复球员');
 for(const t of [home,away]){if(t.startingIds&&(t.startingIds.length!==5||new Set(t.startingIds).size!==5||t.startingIds.some(id=>!t.players.some(p=>p.id===id))))throw Error('无效首发阵容');if(t.rotationIds&&(new Set(t.rotationIds).size!==t.rotationIds.length||t.rotationIds.some(id=>!t.players.some(p=>p.id===id))))throw Error('无效轮换阵容');}
 if(!Number.isFinite(Number(seed)))throw Error('种子必须是数字');
 return{...(home.id==='daily-player'&&away.id==='daily-opponent'?{dailyOutcomes:{}}:{}),seed:Number(seed)>>>0,rng:Number(seed)>>>0,status:'ready',period:1,remaining:720,elapsed:0,possession:'home',sides:{home:makeSide(home),away:makeSide(away)},events:[],history:[{elapsed:0,home:0,away:0,probability:.5}],tacticHistory:[]};
}
export function setTactics(g,side,patch){
 if(!g.sides[side])throw Error('无效球队');
 for(const[k,v]of Object.entries(patch)){
  if(k==='initiator'){if(v!=='auto'&&!g.sides[side].players.slice(0,rotationDepth(patch.rotation||g.sides[side].tactics.rotation)).some(p=>p.id===v))throw Error('无效主控球员');}
  else if(!tacticOptions[k]?.includes(v))throw Error('无效战术');
 }
 if(g.status==='final')return;
 Object.assign(g.sides[side].tactics,patch);
 const s=g.sides[side];if(!s.players.slice(0,rotationDepth(s.tactics.rotation)).some(p=>p.id===s.tactics.initiator))s.tactics.initiator='auto';
 g.sides[side].nextRotation=0;
 g.tacticHistory.push({elapsed:g.elapsed,side,patch:{...patch}});
}
export function setAutoCoach(g,side,enabled){if(!g.sides[side]||typeof enabled!=='boolean')throw Error('无效教练设置');if(g.status==='final')return;g.sides[side].autoCoach=enabled;g.sides[side].nextCoach=0;}
function coach(g,side){const s=g.sides[side],opponent=g.sides[other(side)];if(!s.autoCoach||g.elapsed<s.nextCoach)return;const mean=(ps,k)=>ps.slice(0,5).reduce((a,p)=>a+p.ratings[k],0)/Math.min(5,ps.length);const outside=mean(s.players,'shooting')>mean(s.players,'scoring');const behind=s.score<opponent.score-5;setTactics(g,side,{pace:g.period>=4&&g.remaining<180?(behind?'fast':'slow'):'normal',focus:outside?'outside':'inside',playbook:outside?'spread':'pick_and_roll',defense:mean(opponent.players,'shooting')>mean(opponent.players,'scoring')?'perimeter':'paint',initiator:'auto'});s.nextCoach=g.elapsed+120;}
function shotDefense(s,three){return s.lineup.reduce((a,i)=>a+(s.players[i].skills?.[three?'perimeterDefense':'interiorDefense']??s.players[i].ratings.defense),0)/5;}
function rotate(g,s){
 if(g.elapsed<s.nextRotation)return;
 const depth=Math.min(s.players.length,rotationDepth(s.tactics.rotation));
 let eligible=s.players.map((p,i)=>i).filter(i=>i<depth&&s.box[i].pf<6);
 // A fouled-out player is never returned unless fewer than five remain on the entire roster.
 if(eligible.length<5)eligible=s.players.map((p,i)=>i).filter(i=>s.box[i].pf<6);
 if(eligible.length<5)eligible=s.players.map((p,i)=>i);
 const benchWeight=.52;
 const total=eligible.reduce((sum,i)=>sum+(i<5?1:benchWeight),0);
 const ranked=eligible.sort((a,b)=>{
  const priority=i=>(g.elapsed+90)*5*(i<5?1:benchWeight)/total-s.box[i].seconds+(s.players[i].overall-65)*.8;
  return priority(b)-priority(a);
 });
 s.lineup=ranked.slice(0,5);s.nextRotation=g.elapsed+(g.dailyOutcomes&&s.team.id==='daily-opponent'?45:90);
}
function avg(s,key){return s.lineup.reduce((sum,i)=>sum+s.players[i].ratings[key],0)/5;}
function log(g,side,text,kind='play'){g.events.push({period:g.period,remaining:g.remaining,elapsed:g.elapsed,side,text,kind,home:g.sides.home.score,away:g.sides.away.score});}
function addPoints(g,side,i,pts){const s=g.sides[side];s.score+=pts;s.quarters[g.period-1]+=pts;s.box[i].pts+=pts;for(const key of ['home','away'])for(const j of g.sides[key].lineup)g.sides[key].box[j].plusMinus+=(key===side?pts:-pts);}
function rebound(g,off,def){
 const o=g.sides[off],d=g.sides[def];const offensive=outcome(g,off,'rebound',clamp(.22+(o.tactics.offRebound==='crash'?.04:o.tactics.offRebound==='get_back'?-.04:0)+(avg(o,'rebounding')-avg(d,'rebounding'))*.002+(d.tactics.defRebound==='boxout'?-.04:d.tactics.defRebound==='push'?.035:0),.09,.4));
 const s=offensive?o:d;const idx=pick(g,s.lineup,i=>s.players[i].ratings.rebounding**2);s.box[idx].reb++;if(offensive)s.box[idx].oreb++;
 log(g,offensive?off:def,`${s.players[idx].name} 抢下${offensive?'前场':'后场'}篮板`,'rebound');return offensive?off:def;
}
function periodEnd(g){
 if(g.remaining>0)return;
 log(g,null,`${g.period<=4?'第 '+g.period+' 节':'加时 '+(g.period-4)}结束`,'period');
 if(g.period>=4&&g.sides.home.score!==g.sides.away.score){g.status='final';log(g,null,'全场结束','final');return;}
 g.period++;g.remaining=g.period<=4?720:300;g.possession=g.period%2?'home':'away';
 for(const s of Object.values(g.sides)){s.quarters.push(0);s.nextRotation=0;s.box.forEach(b=>b.stint=0);}
 if(g.period>4)log(g,null,'比分持平，进入加时赛','period');
}
export function step(g){
 if(g.status==='final')return g;
 g.status='live';
 for(const side of ['home','away'])coach(g,side);
 for(const s of Object.values(g.sides))rotate(g,s);
 const off=g.possession,def=other(off),o=g.sides[off],d=g.sides[def],t=o.tactics;
 const pace={slow:19,normal:14,fast:10}[t.pace];
 const dt=Math.min(g.remaining,Math.max(4,Math.round(pace+(random(g)-.5)*10)));
 for(const s of Object.values(g.sides))for(let i=0;i<s.box.length;i++){
  if(s.lineup.includes(i)){s.box[i].seconds+=dt;s.box[i].stint+=dt;}else s.box[i].stint=Math.max(0,s.box[i].stint-dt*1.8);
 }
 g.elapsed+=dt;g.remaining-=dt;o.possessionSeconds+=dt;
 const shooter=pick(g,o.lineup,i=>Math.max(10,o.players[i].ratings.scoring-25)**1.7*(t.initiator===o.players[i].id?1.65:1)*(t.playbook==='feed_post'&&/中锋|C/.test(o.players[i].position)?1.5:1));
 const p=o.players[shooter],b=o.box[shooter];
 const defender=pick(g,d.lineup,i=>d.players[i].ratings.defense);const db=d.box[defender];
 const pressure=d.tactics.defense==='pressure',aggression=d.tactics.aggression;
 const aggressionBonus=aggression==='aggressive'?.02:aggression==='solid'?-.01:0;
 const turnover=clamp(.12+(avg(d,'defense')-avg(o,'playmaking'))*.001+(pressure?.035:0)+aggressionBonus+(t.pace==='fast'?.015:0)-(t.playbook==='motion'?.01:0),.05,.24);
 let next=def;
 if(outcome(g,off,'turnover',turnover)){b.to++;const stolen=random(g)<.65;if(stolen)db.stl++;log(g,def,`${p.name} 失误${stolen?'，'+d.players[defender].name+' 抢断':''}`,'turnover');}
 else{
  let threeRate={inside:.19,balanced:.38,outside:.59}[t.focus]+(t.playbook==='spread'?.12:0)-(t.playbook==='attack_rim'||t.playbook==='feed_post'?.10:0);
  const three=outcome(g,off,'three',clamp(threeRate+(p.ratings.shooting-70)*.004,.06,.78));
  const fatigue=clamp((b.stint-140)/700,0,.20)*(1.2-p.ratings.stamina/150);
  if(outcome(g,off,'foul',.105+(pressure?.035:0)+aggressionBonus+(t.focus==='inside'?.035:0))){
   db.pf++;if(db.pf>=6)d.nextRotation=0;
   const shots=three?3:2;let made=0,lastMiss=false;
   const ftp=p.stats?.ftp==null ? .75 : p.stats.ftp/100;
   for(let n=0;n<shots;n++){b.fta++;const hit=outcome(g,off,'free',clamp(ftp-fatigue,.45,.96));if(hit){b.ftm++;made++;addPoints(g,off,shooter,1);}if(n===shots-1&&!hit)lastMiss=true;}
   log(g,off,`${p.name} 造成犯规，${shots} 罚 ${made} 中`,'free');
   if(db.pf>=6)rotate(g,d);
   if(lastMiss)next=rebound(g,off,def);
  }else{
   b.fga++;if(three)b.tpa++;
   let chance=(three?.35:.52)+(p.ratings[three?'shooting':'scoring']-70)*.0035-(shotDefense(d,three)-70)*.002-fatigue;
   if(d.tactics.defense==='paint')chance+=three?.045:-.055;
   if(d.tactics.defense==='perimeter')chance+=three?-.05:.04;
   if(d.tactics.defense==='stay_home')chance+=t.playbook==='spread'?-.02:.008;
   if(d.tactics.defense==='switch')chance+=t.playbook==='pick_and_roll'?-.025:.008;
   if(d.tactics.defense==='zone')chance+=three?.025:-.025;
   if(d.tactics.offRebound==='crash'&&t.pace==='fast')chance+=.015;
   if(d.tactics.offRebound==='get_back'&&t.pace==='fast')chance-=.015;
   if(pressure)chance+=.015;
   if(t.playbook==='pick_and_roll')chance+=(avg(o,'playmaking')-60)*.0007;
   if(t.playbook==='motion')chance+=.012;
   if(t.playbook==='isolation')chance+=(p.ratings.scoring-75)*.0012;
   if(t.pace==='fast')chance-=.012;
   if(t.defRebound==='push'&&t.pace==='fast')chance+=.012;
   if(off==='home')chance+=.008;
   const blocked=outcome(g,off,'block',(three?.012:.035)+(avg(d,'defense')-60)*.0004);
   const hit=!blocked&&outcome(g,off,three?'hit-three':'hit-two',clamp(chance,.17,.78));
   if(hit){b.fgm++;if(three)b.tpm++;addPoints(g,off,shooter,three?3:2);
    if(!three&&(t.focus==='inside'||['attack_rim','feed_post','pick_and_roll'].includes(t.playbook)))o.paintPoints+=2;
    if(t.pace==='fast'&&dt<=8)o.fastPoints+=three?3:2;
    if(random(g)<(t.playbook==='isolation'?.28:.60)){const helper=pick(g,o.lineup.filter(i=>i!==shooter),i=>o.players[i].ratings.playmaking**2);o.box[helper].asts++;}
    log(g,off,`${p.name} ${three?'三分命中':'两分命中'}`,'score');
   }else{if(blocked)db.blk++;log(g,off,`${p.name} ${three?'三分':'投篮'}${blocked?'被 '+d.players[defender].name+' 封盖':'未中'}`,'miss');next=rebound(g,off,def);}
  }
 }
 g.possession=next;
 const diff=g.sides.home.score-g.sides.away.score;
 g.history.push({elapsed:g.elapsed,home:g.sides.home.score,away:g.sides.away.score,probability:1/(1+Math.exp(-diff/(3+12*Math.sqrt(Math.max(0,2880-g.elapsed)/2880))))});
 periodEnd(g);return g;
}
export function finish(g){let count=0;while(g.status!=='final'){step(g);if(++count>20000)throw Error('模拟超过安全回合上限');}return g;}

export function rotationDepth(value){return {tight:8,balanced:10,deep:12}[value]||10;}
