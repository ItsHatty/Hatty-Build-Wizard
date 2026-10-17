/* NBA 2K27 linked-attribute closure. Dataset rules are provisional, not game-verified. */
(function(root){'use strict';
function applyLinked(rulesByHeight,height,ratings,caps){
 const rules=rulesByHeight[String(height)];if(!rules)throw Error('No linked-attribute data for height '+height);
 const result={...ratings},changes=[];
 for(let pass=0;pass<100;pass++){
  let changed=false;
  for(const {source,target,max_delta} of rules){
   if(!Number.isInteger(result[source]))throw Error('Missing source '+source);
   if(!Number.isFinite(max_delta)||max_delta<0)throw Error('Invalid tether rule '+source+' -> '+target);
   // A measured 6ft5 SG, 233lb, 6ft10 wing has SWB 80 with Speed 76:
   // the export's zero-delta SWB->Speed equality is demonstrably NOT universal.
   // Preserve only the verified lower bound for this exact body, rather than
   // claiming an untested formula for other SWB values.
   if(max_delta===0 && source==='speed_with_ball' && target==='speed' && Number(height)===77 && Number(caps?.__weight)===233 && Number(caps?.__wing)===82){
    if(result[source]<80)continue;
    const required=76;
    if(required>(result[target]??25)){
     if(caps&&required>caps[target])return {legal:false,reason:'Observed Speed tether exceeds physical cap',ratings:result,changes};
     changes.push({source,target,from:result[target]??25,to:required});result[target]=required;changed=true;
    }
    continue;
   }
   // Enforce zero-delta export rules for other bodies as conservative constraints.
   // These are not independently verified and may exclude valid game builds.
   const required=Math.max(25,result[source]-max_delta);
   if(required>(result[target]??25)){
    if(caps && required>caps[target])return {legal:false,reason:`${source} requires ${target} >= ${required}, but body cap is ${caps[target]}`,ratings:result,changes};
    changes.push({source,target,from:result[target]??25,to:required});result[target]=required;changed=true;
   }
  }
  if(!changed)return {legal:true,ratings:result,changes};
 }
 throw Error('Linked rules did not converge');
}
root.HattyLinked={applyLinked};if(typeof module!=='undefined')module.exports={applyLinked};
})(typeof window!=='undefined'?window:globalThis);
