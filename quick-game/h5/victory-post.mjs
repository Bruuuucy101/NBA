// AI工坊专区：https://bbs.hupu.com/871
export function matchReport(game,challenge){
 if(game?.status!=='final')throw Error('比赛结束后才可分享战绩');
 const home=game.sides.home,away=game.sides.away,won=home.score>away.score;
 const roster=side=>{
  const ps=side.players||[];const ids=side.team.startingIds||ps.slice(0,5).map(p=>p.id);
  const ordered=[...ids.map(id=>ps.find(p=>p.id===id)).filter(Boolean),...ps.filter(p=>!ids.includes(p.id))];
  return ordered.map(p=>{const b=side.box.find(b=>b.id===p.id)||{};return {id:p.id,name:String(p.shortName||p.name||'球员').slice(0,40),rating:p.overall,starter:ids.includes(p.id),pts:b.pts||0,reb:b.reb||0,ast:b.asts||0,stl:b.stl||0,blk:b.blk||0,fgm:b.fgm||0,fga:b.fga||0,tpm:b.tpm||0,tpa:b.tpa||0,plusMinus:b.plusMinus??null};});
 };
 return {mode:challenge?'每日挑战':'快速比赛',date:challenge?.date||new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date()),outcome:challenge?(won?'挑战成功':'挑战失败'):(won?'主队获胜':'客队获胜'),won,home:{name:String(home.team.name).slice(0,40),score:home.score,players:roster(home)},away:{name:challenge?'今日之队':String(away.team.name).slice(0,40),score:away.score,players:roster(away)}};
}
function postFromReport(r){
 const lineup=t=>[t.name,'首发阵容：'+t.players.filter(p=>p.starter).map(p=>p.name).join('、')];
 const lines=[`${r.date} · 74-8${r.mode}`,r.outcome+(r.won?'！':'，再接再厉！'),`${r.home.name} ${r.home.score} : ${r.away.score} ${r.away.name}`,...lineup(r.home),...lineup(r.away),'来74-8组建阵容，一起体验篮球对决！'];
 return {tagName:'74-8每日挑战',title:`74-8${r.mode}｜${r.outcome} ${r.home.score}比${r.away.score}`,content:lines.map(text=>({type:'paragraph',content:[{type:'text',text}]}))};
}
export function victoryPost(game,challenge){return postFromReport(matchReport(game,challenge));}
export function renderResultPoster(r){
 // Show only the five confirmed starters on each side of the share poster.
 r={...r,home:{...r.home,players:r.home.players.filter(p=>p.starter).slice(0,5)},away:{...r.away,players:r.away.players.filter(p=>p.starter).slice(0,5)}};
 const canvas=document.createElement('canvas');canvas.width=1200;
 const rows=Math.max(r.home.players.length,r.away.players.length);canvas.height=Math.max(960,690+rows*48);
 const c=canvas.getContext('2d');if(!c)throw Error('无法生成海报，请重试');
 const w=canvas.width,h=canvas.height;
 c.fillStyle='#090d14';c.fillRect(0,0,w,h);
 const rainbow=c.createLinearGradient(0,0,w,h);[['#42ecf5',0],['#c994fa',.32],['#f451ad',.65],['#f4d745',1]].forEach(([color,stop])=>rainbow.addColorStop(stop,color));c.strokeStyle=rainbow;c.lineWidth=4;c.strokeRect(2,2,w-4,h-4);
 function text(value,x,y,size=20,color='#f5f6fb',max=500,align='left'){
  c.font=`700 ${size}px sans-serif`;c.fillStyle=color;c.textAlign=align;let s=String(value);while(s.length&&c.measureText(s).width>max)s=s.slice(0,-1);if(s!==String(value))s=s.slice(0,-1)+'…';c.fillText(s,x,y);
 }
 function panel(x,y,width,height){c.fillStyle='#0c121c';c.strokeStyle='#253044';c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,width,height,28);c.fill();c.stroke();}
 text('74-8',600,67,30,rainbow,400,'center');text(r.mode==='每日挑战'?'今日之队挑战':'快速比赛战报',600,118,30,'#f5f6fb',1000,'center');text(`比赛日期：${r.date}`,600,149,18,'#96a4bb',1000,'center');
 text(r.outcome,600,191,22,r.won?'#11c99b':'#ff4c6a',1000,'center');text(`${r.home.score} - ${r.away.score}`,600,273,78,'#f5f6fb',1000,'center');
 const y=309,tableHeight=116+rows*48;
 for(const [index,t]of [r.home,r.away].entries()){
  const x=38+index*571;panel(x,y,553,tableHeight);
  text(`${index?'客队':'主队'}首发 · ${t.name}`,x+276,y+43,22,'#f5f6fb',510,'center');
  const columns=[['球员',18],['得分',250],['投篮',304],['三分',364],['篮板',414],['助攻',463],['正负',515]];
  columns.forEach(([label,dx],i)=>text(label,x+dx,y+83,15,'#96a4bb',i?55:220,i?'center':'left'));
  t.players.forEach((p,i)=>{
   const row=y+121+i*48;c.strokeStyle='#202b3c';c.setLineDash(i===5?[]:[3,5]);c.beginPath();c.moveTo(x+18,row-26);c.lineTo(x+535,row-26);c.stroke();c.setLineDash([]);
   text(p.name,x+18,row,18,'#f5f6fb',196);text(p.starter?'首发':'替补',x+18,row+15,11,'#7f8da4',180);
   const nums=[p.pts,`${p.fgm}-${p.fga}`,`${p.tpm}-${p.tpa}`,p.reb,p.ast,p.plusMinus==null?'—':p.plusMinus>0?`+${p.plusMinus}`:p.plusMinus];
   nums.forEach((n,j)=>text(n,x+columns[j+1][1],row,17,j===5?(p.plusMinus>0?'#11c99b':p.plusMinus<0?'#ff4c6a':'#96a4bb'):'#f5f6fb',55,'center'));
  });
 }
 const mvp=[...r.home.players,...r.away.players].sort((a,b)=>(b.pts+b.reb*1.2+b.ast*1.5+b.stl*2+b.blk*2)-(a.pts+a.reb*1.2+a.ast*1.5+a.stl*2+a.blk*2))[0];
 const my=y+tableHeight+22;panel(38,my,1124,174);text('首发最佳球员',600,my+29,16,'#96a4bb',1000,'center');text(mvp?.name||'—',600,my+67,34,'#f5f6fb',1000,'center');
 if(mvp){const cells=[['得分',mvp.pts],['篮板',mvp.reb],['助攻',mvp.ast],['抢断',mvp.stl],['盖帽',mvp.blk],['投篮',`${mvp.fgm}-${mvp.fga}`],['三分',`${mvp.tpm}-${mvp.tpa}`],['正负值',mvp.plusMinus==null?'—':mvp.plusMinus>0?`+${mvp.plusMinus}`:mvp.plusMinus]];cells.forEach(([label,value],i)=>{const x=110+i*140;text(label,x,my+110,16,'#96a4bb',120,'center');text(value,x,my+147,26,'#f5f6fb',120,'center');});}
 text('74-8 · 招募球星，挑战今日之队',600,h-24,16,'#96a4bb',1000,'center');return canvas;
}
export function createVictoryPoster(){
 let busy=false,cached;
 return async (game,challenge,onPreview)=>{
  if(busy)return false;
  const report=matchReport(game,challenge),key=JSON.stringify(report),params=postFromReport(report);
  busy=true;
  try{
   if(cached?.key!==key){
    const canvas=renderResultPoster(report);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob||!blob.size||blob.size>10*1024*1024)throw Error('海报生成失败，请重试');
    if(cached?.preview)URL.revokeObjectURL(cached.preview);
    cached={key,blob,preview:URL.createObjectURL(blob)};
   }
   onPreview?.(cached.preview);
   const sdk=globalThis.window?.ColorboxAI;
   if(typeof sdk?.request?.bbs?.openPostEditor!=='function'||typeof sdk?.oss?.uploadFile!=='function')throw Error('海报已生成，请在虎扑 App 内发帖分享');
   if(!cached.imageUrl){
    const result=await sdk.oss.uploadFile({file:cached.blob,filename:`74-8-result-${Date.now()}.png`});
    if(result?.code!==undefined&&result.code!==200)throw Error(result.message||'海报上传失败，请重试');
    let url;try{url=new URL(result?.downloadUrl);}catch{throw Error('海报上传失败：未返回有效图片地址');}
    if(url.protocol!=='https:'||!url.hostname)throw Error('海报上传失败：图片地址无效');
    cached.imageUrl=url.href;
   }
   Object.assign(params,{imageUrl:cached.imageUrl,topicId:'871',topicName:'AI工坊'});
   const result=await sdk.request.bbs.openPostEditor(params);
   if(result?.code!==200)throw Error(result?.message||'无法打开发帖编辑器，请稍后再试');
   return true;
  }finally{busy=false;}
 };
}
