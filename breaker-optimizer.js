/* Candidate base target search; never uses reference-scenario cap breaker gains. */
(function(root){'use strict';
function index(){return {method:'native-formula-21-weight-proxy'}}
function options(_idx,id,goal,cap,limit=5){
 const out=[];if(!Number.isFinite(cap))return out;
 const max=Math.min(goal,cap);
 // Search every potential base rating. Actual breaker eligibility is checked
 // against the FULL generated base build after attribute fill.
 for(let base=Math.max(25,goal-45);base<=max;base++){
  for(let n=0;n<=Math.min(5,limit);n++){
   if(n===0&&base<goal)continue;
   if(n>0&&base>=goal)continue;
   out.push({base,used:n,confidence:n?'native-formula-pending':'no-breakers'});
  }
 }
 return out;
}
function allocations(_idx,targets,caps,available){
 let states=[{base:{},plans:{},used:0}];
 for(const t of targets){
  let choices=options(null,t.id,t.rating,caps[t.id],t.breaker==='none'?0:available)
    .filter(o=>t.breaker!=='require'||o.used===Number(t.requiredBreakers||5));
  if(!choices.length)return {status:'no_options',reason:'No legal base rating for '+t.id};
  // Candidate pruning is a search heuristic, not a feasibility proof.
  // For final targets, explore multiple base ratings and all legal breaker counts.
  choices.sort((a,b)=>a.used===b.used?b.base-a.base:b.used-a.used);
  if(choices.length>100)choices=choices.filter(o=>o.used===0||o.used===5||o.used===4||o.used===3||o.base>=t.rating-10);
  let next=[];for(const s of states)for(const o of choices){if(s.used+o.used>available)continue;
   next.push({base:{...s.base,[t.id]:o.base},plans:{...s.plans,[t.id]:o},used:s.used+o.used});}
  next.sort((a,b)=>{
    const score=s=>Object.values(s.base).reduce((x,y)=>x+y,0)+s.used*1.6;
    return score(b)-score(a);
  });
  // Spread the search over base ratings instead of selecting only the highest.
  if(next.length>140){const picks=[];for(let i=0;i<140;i++){const j=Math.floor(i*(next.length-1)/139);picks.push(next[j]);}next=picks;}
  states=next;if(!states.length)return {status:'no_budget',reason:'Not enough cap breakers'};
 }
 return {status:'candidates',states};
}
root.HattyBreakerOptimizer={index,options,allocations};if(typeof module!=='undefined')module.exports={index,options,allocations};
})(typeof window!=='undefined'?window:globalThis);
