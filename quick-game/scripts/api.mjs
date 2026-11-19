export function validResponse(body,endpoint){
 if(body.success===false||body.errorMsg||(body.errorCode&&body.errorCode!=='0'))return false;
 if(body.success===true||body.status===200)return body.result!=null;
 if(endpoint==='teamPlayerList')return Array.isArray(body.result?.list)&&body.result.list.every(p=>p.playerId!=null);
 if(endpoint==='playerPageHeadInfo')return !!body.result?.player?.name;
 return false;
}
export function cacheUsable(envelope,now=Date.now()){const age=now-Date.parse(envelope.fetchedAt);return Number.isFinite(age)&&age>=0&&age<24*60*60*1000;}
export function fetchWindow(times){const sorted=times.filter(t=>Number.isFinite(Date.parse(t))).sort();return {from:sorted[0]||null,to:sorted.at(-1)||null};}
