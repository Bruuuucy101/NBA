import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createGame,finish,setTactics,tacticOptions} from '../h5/engine.mjs';
import {matchReport,victoryPost} from '../h5/victory-post.mjs';
import {buildDataset,sortRoster} from '../h5/model.mjs';
const data=buildDataset(JSON.parse(fs.readFileSync(new URL('../data/snapshot.json',import.meta.url))));
const teams=data.teams.slice(0,2).map(t=>({...t,players:sortRoster(t.playerIds.map(id=>data.players.find(p=>p.id===id))).slice(0,10)}));
test('share uses actual match roster, retains starting order and separate paragraphs',()=>{
 const home={...teams[0],startingIds:teams[0].players.slice(0,5).reverse().map(p=>p.id)};
 const g=finish(createGame(home,teams[1],42));const r=matchReport(g,{date:'2026-11-20'});
 assert.equal(g.sides.home.team.players,undefined);assert.equal(r.home.players.length,10);
 assert.deepEqual(r.home.players.slice(0,5).map(p=>p.id),home.startingIds);
 assert.equal(r.home.players.reduce((n,p)=>n+p.pts,0),r.home.score);
 assert.equal(r.home.players.reduce((n,p)=>n+p.plusMinus,0),5*(r.home.score-r.away.score));
 const p=victoryPost(g,{date:'2026-11-20'});assert.equal(p.content.length,8);assert.equal(p.tagName,"74-8每日挑战");
 const lines=p.content.map(x=>x.content[0].text);assert.ok(lines[4].startsWith('首发阵容：'));assert.ok(!lines.join('\n').includes('替补阵容')); 
 for(const player of r.home.players.filter(p=>p.starter))assert.ok(lines.join('\n').includes(player.name));
 for(const player of r.home.players.filter(p=>!p.starter))assert.ok(!lines.join('\n').includes(player.name));
 g.sides.home.score=0;assert.match(victoryPost(g,{}).title,/挑战失败/);g.sides.home.score=1000;assert.match(victoryPost(g,{}).title,/挑战成功/);
});
test('seven defense choices and offensive rebounding affect later simulation',()=>{
 assert.equal(tacticOptions.defense.length,7);for(const defense of tacticOptions.defense){const g=createGame(...teams,43);setTactics(g,'home',{defense});finish(g);assert.ok(g.events.length);}
 const a=createGame(...teams,55),b=createGame(...teams,55);setTactics(a,'home',{offRebound:'crash'});setTactics(b,'home',{offRebound:'get_back'});finish(a);finish(b);assert.notDeepEqual(a.history,b.history);
});
