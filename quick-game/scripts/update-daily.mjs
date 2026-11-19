import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {dayKey} from '../h5/daily.mjs';import {quickLineup} from '../h5/quick-lineup.mjs';
const root=path.resolve(import.meta.dirname,'..');
export function protectRatings(previous,next){
 if(next.teams?.length!==30||!next.report?.complete||next.report.failures?.length)throw Error('更新资料不完整，保留原数据');
 const frozen=new Map(previous.players.filter(p=>p.ratingSource?.kind==='screenshot').map(p=>[p.id,p]));
 for(const p of next.players){const old=frozen.get(p.id);if(old){for(const key of ['overall','ratings','skills','ratingSource','primaryPosition','position'])p[key]=structuredClone(old[key]);frozen.delete(p.id);}}
 if(frozen.size)throw Error('截图球员缺失，取消发布');
 for(const t of next.teams)quickLineup(next.players.filter(p=>t.playerIds.includes(p.id)));
 return next;
}
export function runUpdate(){
 const statusPath=path.join(root,'data/update-status.json');let status={};try{status=JSON.parse(fs.readFileSync(statusPath));}catch{}
 if(status.lastSuccessDay===dayKey()&&!process.argv.includes('--force')){console.log('今日已更新');return;}
 const lock=path.join(root,'data/.daily-update.lock');try{fs.mkdirSync(lock);}catch{throw Error('同步任务正在执行；如上次异常退出，请检查后清理 data/.daily-update.lock');}
 const stage=fs.mkdtempSync(path.join(root,'data/.daily-stage-'));
 try{
  fs.mkdirSync(path.join(stage,'data/reference'),{recursive:true});fs.copyFileSync(path.join(root,'data/reference/ratings.txt'),path.join(stage,'data/reference/ratings.txt'));
  const env={...process.env,GAME_DATA_ROOT:stage};
  execFileSync(process.execPath,[path.join(root,'scripts/sync.mjs'),'--refresh'],{env,stdio:'inherit',timeout:1800000});
  execFileSync(process.execPath,[path.join(root,'scripts/build-data.mjs')],{env,stdio:'inherit',timeout:120000});
  const live=path.join(root,'h5/data/league.json'),previous=JSON.parse(fs.readFileSync(live)),next=protectRatings(previous,JSON.parse(fs.readFileSync(path.join(stage,'h5/data/league.json'))));
  const temp=live+'.next';fs.writeFileSync(temp,JSON.stringify(next));fs.renameSync(temp,live);
  for(const rel of ['h5/data/completeness.json','data/snapshot.json','data/reference/ratings.json','data/reference/coverage.json'])fs.copyFileSync(path.join(stage,rel),path.join(root,rel));
  fs.cpSync(path.join(stage,'data/raw'),path.join(root,'data/raw'),{recursive:true});
  fs.writeFileSync(statusPath,JSON.stringify({lastSuccessDay:dayKey(),lastSuccessAt:new Date().toISOString(),players:next.players.length,status:'success'},null,2));console.log('更新完成，截图评分已锁定');
 }catch(error){fs.writeFileSync(statusPath,JSON.stringify({...status,lastAttemptAt:new Date().toISOString(),status:'failed',error:error.message.slice(0,500)},null,2));throw error;}
 finally{fs.rmSync(stage,{recursive:true,force:true});fs.rmSync(lock,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))runUpdate();
