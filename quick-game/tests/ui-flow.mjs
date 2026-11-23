// Optional DOM integration check: npm install --no-save happy-dom; node tests/ui-flow.mjs
import fs from 'node:fs';import assert from 'node:assert/strict';
const {Window}=await import(process.env.UI_TEST_MODULE||'happy-dom');
const window=new Window({url:'http://127.0.0.1:8478/#quick',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableJavaScriptEvaluation:true}});
window.document.write(fs.readFileSync(new URL('../h5/index.html',import.meta.url),'utf8'));
Object.assign(globalThis,{window,document:window.document,localStorage:window.localStorage});
const fetchOriginal=globalThis.fetch;globalThis.fetch=(url,options)=>fetchOriginal(new URL(url,'http://127.0.0.1:8478'),options);
const errors=[];window.addEventListener('error',e=>errors.push(e.message));
const $=s=>document.querySelector(s);const wait=ms=>new Promise(r=>setTimeout(r,ms));
function click(s){const el=$(s);assert.ok(el,'element exists: '+s);el.click();}
function change(s,v){const el=$(s);assert.ok(el);el.value=v;el.dispatchEvent(new window.Event('change',{bubbles:true}));}
localStorage.setItem('courtside-v1','broken-json');
await import('../h5/app.mjs');
for(let i=0;i<100&&!$('#start-game');i++)await wait(50);
assert.ok($('#start-game'),'data loads successfully');
assert.equal($('#home-select').options.length,30);assert.equal($('#away-select').options.length,30);
assert.notEqual($('#home-select').value,$('#away-select').value);
assert.equal(document.querySelectorAll('.quick-player').length,10);assert.equal(document.querySelectorAll('.quick-team').length,2);
assert.equal($('.topbar'),null);assert.equal($('#data-button'),null);click('[data-player]');assert.ok($('#dialog').open);click('#close-dialog');
$('#seed').value='0';change('#seed','0');click('#start-game');click('#back-setup');assert.equal($('#seed').value,'0');click('#start-game');assert.ok($('#home-score'));assert.equal($('#home-score').textContent,'0');
change('#home-playbook','pick_and_roll');click('[data-side="home"][data-tactic="defRebound"][data-value="boxout"]');click('[data-side="home"][data-tactic="aggression"][data-value="solid"]');click('[data-side="home"][data-tactic="pace"][data-value="fast"]');
click('#play-pause');await wait(550);assert.notEqual($('#clock').textContent,'12:00');assert.equal($('#home-playbook').disabled,true);
click('#play-pause');const paused=$('#clock').textContent;await wait(550);assert.equal($('#clock').textContent,paused);assert.equal($('#home-playbook').disabled,false);
click('[data-speed="4"]');assert.ok($('[data-speed="4"]').classList.contains('selected'));
click('#finish-game');assert.match($('#result').textContent,/拿下比赛/);assert.equal($('#play-pause').disabled,true);
assert.ok($('.comparison-table'));click('[data-box="home"]');const score=Number($('#home-score').textContent);assert.equal(Number(document.querySelector('.box-table tfoot td:nth-child(3)').textContent),score);
click('[data-box="away"]');assert.equal(Number(document.querySelector('.box-table tfoot td:nth-child(3)').textContent),Number($('#away-score').textContent));
click('#rematch');assert.equal($('#home-score').textContent,'0');click('#play-pause');await wait(500);
click('#back-setup');assert.ok($('#confirm-back'));click('#confirm-back');assert.ok($('#start-game'));
const previous=$('#home-select').value;const next=[...$('#home-select').options].find(o=>!o.disabled&&o.value!==previous).value;change('#home-select',next);assert.equal($('#home-select').value,next);assert.equal(JSON.parse(localStorage.getItem('courtside-v1')).homeId,next);
click('#start-game');click('#finish-game');assert.match($('#result').textContent,/拿下比赛/);
assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,checks:['real dataset loads','30-team selection','two team panels and ten starters','database removed and player details retained','corrupt preferences','start','tactics','pause/resume','speed','finish','boxscore','rematch','leave confirmation','change teams','preferences'],visualLayoutVerified:false},null,2));
window.dispatchEvent(new window.Event('pagehide'));await window.happyDOM.close();
