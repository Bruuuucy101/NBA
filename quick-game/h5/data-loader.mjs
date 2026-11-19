export const cloudDataURL='https://raw.githubusercontent.com/Bruuuucy101/NBA/main/quick-game/h5/data/league.json';
export async function loadLeague(fetcher=globalThis.fetch){
 for(const url of [cloudDataURL,'data/league.json']){
  try{
   const response=await fetcher(url,{cache:'no-cache',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('数据文件不可用');
   const league=await response.json();
   if(league.version!==1||league.teams?.length!==30||!league.players?.length||!league.report?.complete)throw Error('数据文件不完整');
   return league;
  }catch(error){if(url==='data/league.json')throw error;}
 }
}
