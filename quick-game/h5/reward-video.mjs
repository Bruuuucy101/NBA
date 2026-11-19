// Only the platform's final reward confirmation authorizes a paid reroll.
export function createRewardVideo(getAPI=()=>globalThis.window?.ColorboxAI?.vatask){
 let pending=false;
 return async function watch(){
  if(pending)throw Error('广告正在进行，请稍候');
  const api=getAPI();
  if(!api?.completeRewardVideo)throw Error('请在虎扑 App 内打开已开通激励广告的游戏，登录后观看广告');
  pending=true;
  try{
   const result=await api.completeRewardVideo();
   if(result?.code!==200||result?.data?.rewarded!==true)throw Error(result?.message||'未获得广告奖励，请完整观看后再试');
   let warning='';
   try{const state=await api.getActivityTaskState();if(state?.code!==200)warning=state?.message||'任务状态刷新失败';}catch{warning='任务状态暂未刷新，广告奖励已确认';}
   return {result,warning};
  }finally{pending=false;}
 };
}
