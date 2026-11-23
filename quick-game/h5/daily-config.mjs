import {dailyPool} from './daily-pool.mjs';
const positions=['PG','SG','SF','PF','C'];
export function validLineups(value){
 const result={};
 if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const [date,ids] of Object.entries(value)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)continue;
  if(!Array.isArray(ids)||ids.length!==5||new Set(ids).size!==5)continue;
  if(ids.some((id,i)=>!dailyPool.some(p=>p.id===id&&p.primaryPosition===positions[i])))continue;
  result[date]=[...ids];
 }
 return result;
}
