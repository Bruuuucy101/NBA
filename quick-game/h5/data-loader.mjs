export const cloudDataURL='https://raw.githubusercontent.com/Bruuuucy101/NBA/main/quick-game/h5/data/league.json';
const cacheKey='74-8-league-cache-v1';
function validate(league){
 if(league.version!==1||league.teams?.length!==30||!league.players?.length||!league.report?.complete)throw Error('数据文件不完整');
 return league;
}
async function read(fetcher,url,options={}){
 const response=await fetcher(url,{cache:'no-cache',...options});
 if(!response.ok)throw Error('数据文件不可用');
 return validate(await response.json());
}
async function refresh(fetcher,storage){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const league=await read(fetcher,cloudDataURL,{signal:controller.signal});
  storage?.setItem(cacheKey,JSON.stringify(league));
 }catch{/* Background refresh must never block or interrupt a game. */}
 finally{clearTimeout(timeout);}
}
export async function loadLeague(fetcher=globalThis.fetch,storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 let league;
 try{const cached=storage?.getItem(cacheKey);if(cached)league=validate(JSON.parse(cached));}catch{}
 if(!league){
  const embedded=globalThis.document?.getElementById('bundled-league');
  league=embedded?validate(JSON.parse(embedded.textContent)):await read(fetcher,'data/league.json');
 }
 // Start immediately from the local snapshot; refreshed data is used on next entry.
 void refresh(fetcher,storage);
 return league;
}
