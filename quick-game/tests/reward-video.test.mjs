import test from 'node:test';
import assert from 'node:assert/strict';
import {createRewardVideo} from '../h5/reward-video.mjs';
test('outside Hupu cannot grant rewards',async()=>{await assert.rejects(createRewardVideo(()=>undefined)(),/虎扑/);});
test('only exact final confirmation grants reward; failure message preserved',async()=>{
 for(const result of [{code:200,data:{rewarded:false},message:'未看完'},{code:403,data:{rewarded:true},message:'请登录'},{code:200,data:{rewarded:1},message:'无效奖励'}]){
  let refresh=0;const watch=createRewardVideo(()=>({completeRewardVideo:async()=>result,getActivityTaskState:async()=>refresh++}));
  await assert.rejects(watch(),new RegExp(result.message));assert.equal(refresh,0);
 }
});
test('one flow at a time and refresh does not revoke confirmed reward',async()=>{
 let resolve,calls=0;
 const watch=createRewardVideo(()=>({completeRewardVideo:()=>{calls++;return new Promise(r=>resolve=r);},getActivityTaskState:async()=>{throw Error('network');}}));
 const pending=watch();await assert.rejects(watch(),/正在进行/);assert.equal(calls,1);
 resolve({code:200,data:{rewarded:true}});const result=await pending;assert.equal(result.result.data.rewarded,true);assert.match(result.warning,/确认/);
});
