import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {restartDraft,createChallenge,createDraft,configureDraft,draftChoices,pickPlayer,rerollDraft,restoreDraft,setLineup,optimizeLineup,buildDailyTeams,SLOTS} from '../h5/daily.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../h5/data/league.json',import.meta.url))),c=createChallenge(data,'2026-11-19');
test('franchise setup controls star slot and persists safely',()=>{let d=configureDraft(createDraft(c),{name:'上海先锋',abbreviation:'先锋',starPosition:'C'});assert.equal(d.franchise.name,'上海先锋');assert.equal(d.starPosition,'C');assert.ok(draftChoices(data,c,d).every(p=>/中锋/.test(p.position)||p.height>=2.08));assert.deepEqual(restoreDraft(JSON.stringify(d),data,c),d);});
test('three total rerolls change choices, persist and cannot be farmed',()=>{let d=createDraft(c);const old=draftChoices(data,c,d).map(p=>p.id);d=rerollDraft(data,c,d);assert.ok(draftChoices(data,c,d).every(p=>!old.includes(p.id)));d=pickPlayer(data,c,d,draftChoices(data,c,d)[0].id);d=rerollDraft(data,c,d);d=rerollDraft(data,c,d);assert.equal(d.rerollsLeft,0);assert.throws(()=>rerollDraft(data,c,d));assert.deepEqual(restoreDraft(JSON.stringify(d),data,c),d);});
test('lineup swapping and auto optimize preserve all drafted players and reach engine',()=>{let d=createDraft(c);for(let i=0;i<10;i++)d=pickPlayer(data,c,d,draftChoices(data,c,d)[0].id);const order=[...d.lineup];[order[0],order[5]]=[order[5],order[0]];d=setLineup(d,order,data);assert.deepEqual(buildDailyTeams(data,c,d).home.startingIds,order.slice(0,5));const opt=optimizeLineup(data,d);assert.deepEqual([...opt.lineup].sort(),[...d.picks].sort());assert.deepEqual(restoreDraft(JSON.stringify(opt),data,c),opt);assert.throws(()=>setLineup(d,Array(10).fill(d.picks[0]),data));});

test('retry starts a fresh persistent draft against the same daily opponent',()=>{
 let d=createDraft(c);const originalChoices=draftChoices(data,c,d).map(p=>p.id);
 d=rerollDraft(data,c,d);for(let i=0;i<10;i++)d=pickPlayer(data,c,d,draftChoices(data,c,d)[0].id);
 const before=buildDailyTeams(data,c,d).away;
 d=restartDraft(c,d);assert.equal(d.attempt,1);assert.equal(d.rerollsLeft,3);assert.deepEqual(d.picks,[]);assert.deepEqual(d.actions,[]);assert.deepEqual(d.lineup,[]);
 assert.notDeepEqual(draftChoices(data,c,d).map(p=>p.id),originalChoices);assert.deepEqual(restoreDraft(JSON.stringify(d),data,c),d);
 for(let i=0;i<10;i++)d=pickPlayer(data,c,d,draftChoices(data,c,d)[0].id);
 assert.deepEqual(buildDailyTeams(data,c,d).away,before);assert.equal(before.abbreviation,'今日之队');
});
