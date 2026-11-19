import test from 'node:test';
import assert from 'node:assert/strict';
import {loadLeague,cloudDataURL} from '../h5/data-loader.mjs';
const league={version:1,teams:Array.from({length:30},()=>({})),players:[{id:1}],report:{complete:true}};
test('cloud data is read before the bundled snapshot',async()=>{
 const urls=[];assert.deepEqual(await loadLeague(async url=>{urls.push(url);return {ok:true,json:async()=>league};}),league);
 assert.deepEqual(urls,[cloudDataURL]);
});
test('unavailable or incomplete cloud data falls back to the bundled snapshot',async()=>{
 for(const mode of ['offline','incomplete']){
  const urls=[];const result=await loadLeague(async url=>{urls.push(url);if(url===cloudDataURL){if(mode==='offline')throw Error('offline');return {ok:true,json:async()=>({...league,report:{complete:false}})};}return {ok:true,json:async()=>league};});
  assert.deepEqual(result,league);assert.deepEqual(urls,[cloudDataURL,'data/league.json']);
 }
});
test('invalid fallback reports failure',async()=>{
 await assert.rejects(loadLeague(async()=>({ok:false})),/数据文件不可用/);
});
