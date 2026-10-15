/* Linked-attribute propagation for NBA 2K27. Zero-delta SpeedWithBall->Speed is intentionally excluded: known retail counterexample. */
(function(root){'use strict';
function applyLinked(rulesByHeight,height,ratings,caps){
 const rules=rulesByHeight[String(height)];if(!rules)throw Error('No linked-attribute data for height '+height);
 const result={...ratings};const changes=[];
 for(let pass=0;pass<22;pass++){
  let changed=false;
  for(const {source,target,max_delta} of rules){
   if(max_delta===0)continue; // Dataset's zero delta is NOT a verified equality rule.
   if(!Number.isInteger(result[source]))throw Error('Missing source '+source);
   const required=Math.max(25,result[source]-max_delta);
   if(required>(result[target]??25)){
    if(caps && required>caps[target])return {legal:false,reason:`${source} requires ${target} >= ${required}, but body cap is ${caps[target]}`,ratings:result,changes};
    changes.push({source,target,from:result[target]??25,to:required});result[target]=required;changed=true;
   }
  }
  // IN-GAME REGRESSION (user-tested): SG 6'5", 233 lb, 6'10" wingspan,
  // Speed With Ball 80 forces Speed >= 76. Only apply to this observed
  // body and at/above the observed rating; do NOT assume a global formula.
  if(Number(height)===77 && Number(caps?.__weight)===233 && Number(caps?.__wing)===82 && result.speed_with_ball>=80 && result.speed<76){
   if(caps.speed<76)return {legal:false,reason:'Observed Speed tether exceeds physical cap',ratings:result,changes};
   changes.push({source:'speed_with_ball',target:'speed',from:result.speed,to:76,evidence:'in-game 6ft5 SG test'});
   result.speed=76;changed=true;
  }
  if(!changed)return {legal:true,ratings:result,changes};
 }
 throw Error('Linked rules did not converge');
}
root.HattyLinked={applyLinked};if(typeof module!=='undefined')module.exports={applyLinked};
})(typeof window!=='undefined'?window:globalThis);
