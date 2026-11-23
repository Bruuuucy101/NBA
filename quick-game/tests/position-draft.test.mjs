import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createChallenge,createDraft,configureDraft,draftChoices,pickPlayer,rerollDraft,eligibleSlots,restoreDraft,optimizeLineup,setLineup,SLOTS} from '../h5/daily.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../h5/data/league.json',import.meta.url))),map=new Map(data.players.map(p=>[p.id,p]));
test('all five core positions draft matching starters and bench without repeating any shown candidate',()=>{
 for(const starPosition of SLOTS.slice(0,5))for(let day=1;day<=30;day++){
 const c=createChallenge(data,`2026-11-${String(day).padStart(2,'0')}`);let d=configureDraft(createDraft(c),{name:'测试',abbreviation:'测试',starPosition});const seen=new Set(),order=[starPosition,...SLOTS.slice(0,5).filter(s=>s!==starPosition),...SLOTS.slice(5)];
 for(let round=0;round<10;round++){
 for(let roll=0;roll<(round===0?4:1);roll++){
 const choices=draftChoices(data,c,d);assert.equal(choices.length,3);for(const p of choices){assert.ok(eligibleSlots(p).includes(order[round]),`${p.name} in ${order[round]}`);assert.ok(!seen.has(p.id));seen.add(p.id);}
 d=round===0&&roll<3?rerollDraft(data,c,d,{code:200,data:{rewarded:true}}):pickPlayer(data,c,d,choices[0].id);assert.deepEqual(restoreDraft(d,data,c),d);
 }
 }
 for(const lineup of [d.lineup,optimizeLineup(data,d).lineup])lineup.forEach((id,i)=>assert.ok(eligibleSlots(map.get(id)).includes(SLOTS[i])));
 const invalid=[...d.lineup];[invalid[0],invalid[4]]=[invalid[4],invalid[0]];assert.throws(()=>setLineup(d,invalid,data));
 }
});

test('three free rerolls persist across picks; further rerolls require confirmed reward',()=>{
 const c=createChallenge(data,'2026-11-21');let d=createDraft(c);
 assert.equal(d.rerollsLeft,3);
 for(let remaining=2;remaining>=0;remaining--){
  d=rerollDraft(data,c,d);assert.equal(d.rerollsLeft,remaining);
  d=pickPlayer(data,c,d,draftChoices(data,c,d)[0].id);
  assert.equal(d.rerollsLeft,remaining);assert.deepEqual(restoreDraft(d,data,c),d);
 }
 assert.throws(()=>rerollDraft(data,c,d),/观看广告/);
 assert.throws(()=>rerollDraft(data,c,d,{code:200,data:{rewarded:false}}),/观看广告/);
 d=rerollDraft(data,c,d,{code:200,data:{rewarded:true}});
 assert.equal(d.rerollsLeft,0);assert.equal(d.actions.at(-1).type,'reward-reroll');
 assert.deepEqual(restoreDraft(d,data,c),d);
});
