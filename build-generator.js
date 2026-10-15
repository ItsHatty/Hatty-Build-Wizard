/* Experimental complete BASE attribute candidates. No guessed cap-breaker outcomes. */
(function(root){'use strict';
const names=['Close Shot','Driving Layup','Driving Dunk','Standing Dunk','Post Control','Mid-Range Shot','Three-Point Shot','Free Throw','Pass Accuracy','Ball Handle','Speed With Ball','Interior Defense','Perimeter Defense','Steal','Block','Offensive Rebound','Defensive Rebound','Speed','Agility','Strength','Vertical'];
const ids=['close_shot','driving_layup','driving_dunk','standing_dunk','post_control','mid_range','three_point','free_throw','pass_accuracy','ball_handle','speed_with_ball','interior_defense','perimeter_defense','steal','block','offensive_rebound','defensive_rebound','speed','agility','strength','vertical'];
function enforceObservedTether(body,ratings,caps){
 // Measured in-game for this exact SG body only; no extrapolation to other bodies.
 if(body.position==='SG' && body.height===77 && body.weight===233 && body.wing===82 && ratings.speed_with_ball>=80 && ratings.speed<76){
  if(caps.speed<76)return {legal:false,reason:'Speed physical cap below observed minimum of 76'};
  return {legal:true,ratings:{...ratings,speed:76}};
 }
 return {legal:true,ratings};
}
function evaluate(data,body,targets){const caps=root.HattyPhysical.caps(data.physical,body.height,body.weight,body.wing);caps.__weight=body.weight;caps.__wing=body.wing;const ratings=Object.fromEntries(ids.map(a=>[a,25]));for(const t of targets){if(caps[t.id]===null)return {status:'unknown',reason:'Physical cap unavailable for '+t.id};if(t.rating>caps[t.id])return {status:'impossible',reason:t.id+' cap '+caps[t.id]};ratings[t.id]=t.rating}
let linked=root.HattyLinked.applyLinked(data.links.rules,body.height,ratings,caps);if(!linked.legal)return {status:'impossible',reason:linked.reason};const tether=enforceObservedTether(body,linked.ratings,caps);if(!tether.legal)return {status:'impossible',reason:tether.reason};linked.ratings=tether.ratings;
for(const a of ids)if(caps[a]===null)return {status:'unknown',reason:'Unknown physical cap for '+a};const score=()=>root.HattyRealOVR.calculateOVR(data.ovr,ids.map(a=>linked.ratings[a]),body.height).uncappedOVR;
const initial=score();if(initial>99.00001)return {status:'over_budget',ovr:initial,reason:'Required base ratings exceed 99 OVR'};
return {status:'candidate',body,caps,ratings:linked.ratings,ovr:initial,headroom:99-initial,changes:linked.changes};}
function fill(data,candidate,targets){const caps=candidate.caps,locked=new Set(targets.filter(t=>t.mode==='exact').map(t=>t.id));let ratings={...candidate.ratings};const calc=r=>root.HattyRealOVR.calculateOVR(data.ovr,ids.map(a=>r[a]),candidate.body.height).uncappedOVR;let current=calc(ratings);
// Iteratively spend unused builder budget on low-cost attribute increments, respecting link rules.
for(let step=0;step<1500;step++){let best=null;for(const a of ids){if(locked.has(a)||ratings[a]>=caps[a])continue;const tryRatings={...ratings,[a]:ratings[a]+1};const linked=root.HattyLinked.applyLinked(data.links.rules,candidate.body.height,tryRatings,caps);if(!linked.legal)continue;
const tether=enforceObservedTether(candidate.body,linked.ratings,caps);if(!tether.legal)continue;linked.ratings=tether.ratings;if([...locked].some(k=>linked.ratings[k]!==ratings[k]))continue;const next=calc(linked.ratings);if(next>99.00001)continue;const delta=next-current;const benefit=ids.reduce((sum,k)=>sum+Math.max(0,linked.ratings[k]-ratings[k]),0);const priority={free_throw:0.03,post_control:0.12,close_shot:0.18,driving_layup:0.45,driving_dunk:1.5,three_point:1.2,mid_range:0.7,ball_handle:1.3,speed_with_ball:1.3,perimeter_defense:1.0,steal:0.9,speed:1.2,agility:0.8,vertical:1.2,strength:0.9};const weighted=ids.reduce((sum,k)=>sum+Math.max(0,linked.ratings[k]-ratings[k])*(priority[k]??0.35),0);const value=weighted/(Math.max(0.0001,delta));if(!best||value>best.value)best={ratings:linked.ratings,ovr:next,value}}
if(!best)break;ratings=best.ratings;current=best.ovr;if(current>=98.9999)break;}
return {...candidate,ratings,ovr:current,headroom:99-current}}
root.HattyBuild={names,ids,evaluate,fill,enforceObservedTether,version:"tether-integration-2"};if(typeof module!=='undefined')module.exports={names,ids,evaluate,fill,enforceObservedTether};})(typeof window!=='undefined'?window:globalThis);
