/* NBA 2K27 OVR calculator, user-provided Aug 2026 tuning. Not a full build legality validator. */
(function(root){
'use strict';
function calculateOVR(model,ratings,heightInches){
 if(!Array.isArray(ratings)||ratings.length!==21||!ratings.every(v=>Number.isInteger(v)&&v>=25&&v<=99))throw Error('21 integer ratings 25..99 required');
 const h=model.heights[String(heightInches)];if(!h)throw Error('No measured height model for '+heightInches);
 const [x0,x1,y0,y1]=h.bounds;let best=-Infinity,archetype=-1;
 for(let p=0;p<15;p++){
  let num=0,den=0;
  for(let a=0;a<21;a++){
   const r=ratings[a],w=h.weights[p][a],s=model.scales[a][r-25];
   num+=w*s*r;den+=w*s;
  }
  if(!den)continue;
  const raw=num/den,ovr=y0+(raw-x0)/(x1-x0)*(y1-y0);
  if(ovr>best){best=ovr;archetype=p;}
 }
 return {uncappedOVR:best,archetype};
}
root.HattyRealOVR={calculateOVR};
if(typeof module!=='undefined')module.exports={calculateOVR};
})(typeof window!=='undefined'?window:globalThis);
