// Error-diffusion sampling: total outcomes stay within one of accumulated
// probability. Both sides use the same rule; no score or winner is consulted.
export function balancedOutcome(ledger,key,probability,initial){
 const p=Math.max(0,Math.min(1,probability));
 const entry=ledger[key]??(ledger[key]={credit:initial,expected:0,hits:0});
 entry.expected+=p;entry.credit+=p;
 const hit=entry.credit>=1;
 if(hit){entry.credit-=1;entry.hits++;}
 return hit;
}
