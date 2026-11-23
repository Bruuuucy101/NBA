// Identity is read from the platform only; it never gates league loading.
export async function getPlayerIdentity(){
 const auth=globalThis.window?.ColorboxAI?.auth;
 if(typeof auth?.getUserInfo!=='function')throw Error('请在虎扑 App 中登录后，重新获取昵称');
 let timeout;
 try{
  const result=await Promise.race([auth.getUserInfo(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('读取登录信息超时，请重试')),10000);})]);
  if(result?.code!==200)throw Error(String(result?.message||'无法获取登录信息，请重试'));
  const user=result.data;
  if(user?.islogin!==1||!user.nickname?.trim())throw Error('请先登录虎扑，再重新获取昵称');
  const name=String(user.nickname).trim().slice(0,80);
  const url=user.avatar||user.userHeadUrl||'';
  let avatar='';try{const parsed=new URL(url);if(parsed.protocol==='https:')avatar=parsed.href;}catch{}
  return {name,abbreviation:name,...(avatar?{avatar}:{})};
 }finally{clearTimeout(timeout);}
}
