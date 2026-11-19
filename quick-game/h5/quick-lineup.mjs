import {eligibleSlots,SLOTS} from './daily.mjs';
export function quickLineup(players){
 const memo=new Map();
 function solve(index,mask){if(index===players.length)return mask===31?{score:0,ids:Array(5).fill(null)}:null;const key=index+':'+mask;if(memo.has(key))return memo.get(key);let best=solve(index+1,mask);const p=players[index];for(let slot=0;slot<5;slot++)if(!(mask&(1<<slot))&&eligibleSlots(p).includes(SLOTS[slot])){const next=solve(index+1,mask|(1<<slot));if(next){const score=next.score+(Number(p.stats?.min)||0)*10+p.overall;if(!best||score>best.score){const ids=[...next.ids];ids[slot]=p.id;best={score,ids};}}}memo.set(key,best);return best;}
 const result=solve(0,0);if(!result)throw Error('球队名单缺少适配位置的球员，请更新名单');return result.ids;
}
