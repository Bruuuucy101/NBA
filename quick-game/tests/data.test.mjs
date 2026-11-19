import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDataset, ratePlayer} from '../h5/model.mjs';
test('missing stats remain null and estimates are explicit',()=>{const p=ratePlayer({playerId:'p',roster:{player_name:'测试'},profile:null}); assert.equal(p.stats.pts,null); assert.ok(p.estimates.includes('scoring')); assert.ok(Number.isFinite(p.overall));});
test('ratings deterministic, zero is not missing and salary does not affect ability',()=>{const p={playerId:'p',roster:{pts:'0',min:'10',salary:'1'}}; assert.deepEqual(ratePlayer(p),ratePlayer(p)); assert.equal(ratePlayer(p).stats.pts,0); assert.deepEqual(ratePlayer(p).ratings,ratePlayer({...p,roster:{...p.roster,salary:'9999999'}}).ratings);});
test('wrong season is rejected',()=>assert.throws(()=>buildDataset({season:'2025-2026',teams:[]}),/season/i));
test('duplicate memberships are reported and do not duplicate player entity',()=>{const p={playerId:'p',roster:{player_name:'测试'}}; const d=buildDataset({season:'2026-2027',teams:[{teamId:'a',standing:{teamName:'A'},players:[p,p]},{teamId:'b',standing:{teamName:'B'},players:[p]}]}); assert.equal(d.players.length,1);assert.ok(d.report.membershipConflicts.length);assert.equal(d.report.complete,false);});
