import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validLineups} from '../h5/daily-config.mjs';
import {createChallenge} from '../h5/daily.mjs';
import {mergeSnapshot} from '../h5/hupu-data-loader.mjs';
const base=JSON.parse(fs.readFileSync(new URL('../h5/data/league.json',import.meta.url)));
const ids=['1901000000473221','1901000000443393','1901000000443105','1901000000470803','1901000000448416'];
test('cloud schedule starts on specified Shanghai day and preserves ratings and bench cap',()=>{
 const fresh=structuredClone(base);fresh.dailyLineups={'2026-11-22':ids};fresh.players.forEach(p=>p.overall=1);
 const merged=mergeSnapshot(base,fresh);
 assert.deepEqual(merged.players.map(p=>p.overall),base.players.map(p=>p.overall));
 const c=createChallenge(merged,'2026-11-22');assert.deepEqual(c.opponentIds.slice(0,5),ids);
 assert.equal(new Set(c.opponentIds).size,10);
 assert.ok(c.opponentIds.slice(5).every(id=>base.players.find(p=>p.id===id).overall<=82));
 assert.equal(createChallenge(merged,'2026-11-21').key,createChallenge(base,'2026-11-21').key);
 assert.deepEqual(createChallenge({...merged,players:[...merged.players].reverse()},'2026-11-22').opponentIds,c.opponentIds);
});
test('invalid dates, missing players, duplicates and position mismatches fall back safely',()=>{
 for(const bad of [[...ids.slice(1),ids[0]],['missing',...ids.slice(1)],[ids[0],ids[0],...ids.slice(2)],[]]){
 assert.deepEqual(validLineups({'2026-11-22':bad}),{});
 assert.deepEqual(createChallenge({...base,dailyLineups:{'2026-11-22':bad}},'2026-11-22'),createChallenge(base,'2026-11-22'));
 }
 assert.deepEqual(validLineups({'2026-02-30':ids}),{});
});
