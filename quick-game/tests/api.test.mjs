import test from 'node:test';import assert from 'node:assert/strict';
import {validResponse} from '../scripts/api.mjs';
test('observed roster envelope without success marker is valid only with list',()=>{assert.equal(validResponse({result:{list:[{playerId:'1'}]}},'teamPlayerList'),true);assert.equal(validResponse({result:{}},'teamPlayerList'),false);assert.equal(validResponse({success:false,result:{list:[]}},'teamPlayerList'),false);});
import {cacheUsable,fetchWindow} from '../scripts/api.mjs';
test('cache expires and keeps source fetch time instead of run time',()=>{const old={fetchedAt:'2026-11-18T00:00:00Z'};assert.equal(cacheUsable(old,Date.parse('2026-11-19T01:00:00Z')),false);assert.equal(cacheUsable(old,Date.parse('2026-11-18T01:00:00Z')),true);assert.deepEqual(fetchWindow(['2026-11-18T00:00:00Z','2026-11-18T01:00:00Z']),{from:'2026-11-18T00:00:00Z',to:'2026-11-18T01:00:00Z'});});
