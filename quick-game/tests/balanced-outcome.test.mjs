import test from 'node:test';import assert from 'node:assert/strict';
import {balancedOutcome} from '../h5/balanced-outcome.mjs';
test('balanced draws track changing probabilities without inflating them',()=>{const ledger={};for(let i=0;i<1000;i++){balancedOutcome(ledger,'shot',[.17,.78,.35,.52][i%4],.43);assert.ok(Math.abs(ledger.shot.hits-ledger.shot.expected)<1);assert.ok(ledger.shot.credit>=0&&ledger.shot.credit<1);}assert.equal(balancedOutcome({},'zero',0,0),false);assert.equal(balancedOutcome({},'one',1,0),true);});
test('same probabilities produce same outcomes regardless of team identity',()=>{const a={},b={};for(let i=0;i<100;i++)assert.equal(balancedOutcome(a,'home',.43,.19),balancedOutcome(b,'away',.43,.19));});
