import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createChallenge,createDraft} from '../h5/daily.mjs';
import {dailyLobby} from '../h5/daily-view.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../h5/data/league.json',import.meta.url)));
test('shared daily opponent survives live statistics and roster updates',()=>{
 const a=createChallenge(data,'2026-11-19'),updated=structuredClone(data);
 updated.modelVersion='updated';updated.players.reverse();
 for(const p of updated.players){p.stats.asts=99;p.leaveTeam=true;if(p.ratingSource?.kind!=='screenshot')p.overall=99;}
 const b=createChallenge(updated,'2026-11-19');assert.deepEqual(b.opponentIds,a.opponentIds);assert.equal(b.key,a.key);
 assert.notDeepEqual(createChallenge(updated,'2026-11-20').opponentIds,a.opponentIds);
});
test('today team badges use one style including elite ratings',()=>{
 const c=createChallenge(data,'2026-11-19'),html=dailyLobby(data,c,createDraft(c),{});
 assert.equal((html.match(/class="daily-rating"/g)||[]).length,5);assert.ok(!html.includes('elite-rating'));
});
