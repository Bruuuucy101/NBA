import fs from 'node:fs';
import assert from 'node:assert/strict';
const [beforePath,afterPath]=process.argv.slice(2);
assert.ok(beforePath&&afterPath,'需要更新前、后的数据文件');
const before=JSON.parse(fs.readFileSync(beforePath)),after=JSON.parse(fs.readFileSync(afterPath));
const map=new Map(after.players.map(p=>[p.id,p]));
let count=0;
for(const old of before.players.filter(p=>p.ratingSource?.kind==='screenshot')){
 const next=map.get(old.id);assert.ok(next,`截图球员缺失：${old.name}`);
 for(const key of ['overall','ratings','skills','ratingSource','primaryPosition','position'])assert.deepEqual(next[key],old[key],`${old.name}: ${key} 被改变`);
 count++;
}
assert.ok(count>0,'未找到截图评分，停止发布');
assert.equal(after.teams.length,30);assert.ok(after.report.complete);assert.equal(after.report.failures.length,0);
console.log(`已独立核验 ${count} 名截图球员，评分完全一致`);
