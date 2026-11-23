import test from 'node:test';
import assert from 'node:assert/strict';
import {loadLeague,cloudDataURL} from '../h5/data-loader.mjs';
const league={version:1,teams:Array.from({length:30},()=>({})),players:[{}],report:{complete:true}};
test('local data starts game while cloud request remains pending',async()=>{
 let finish;const urls=[];
 const result=await loadLeague(async url=>{urls.push(url);if(url===cloudDataURL)return new Promise(resolve=>{finish=resolve;});return {ok:true,json:async()=>league};},null);
 assert.deepEqual(result,league);assert.deepEqual(urls,['data/league.json',cloudDataURL]);
 finish({ok:false});
});
test('background update is saved and used on the next entry',async()=>{
 let saved;const storage={getItem:()=>saved,setItem:(_,v)=>{saved=v;}};
 const updated={...league,players:[{id:'updated'}]};
 const fetcher=async url=>({ok:true,json:async()=>url===cloudDataURL?updated:league});
 assert.deepEqual(await loadLeague(fetcher,storage),league);
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(await loadLeague(fetcher,storage),updated);
});
test('invalid cache and unavailable cloud still allow bundled data',async()=>{
 const result=await loadLeague(async url=>{if(url===cloudDataURL)throw Error('offline');return {ok:true,json:async()=>league};},{getItem:()=>'{broken'});
 assert.deepEqual(result,league);
});
test('missing bundled data produces an error',async()=>{
 await assert.rejects(loadLeague(async()=>({ok:false}),null),/数据文件不可用/);
});
