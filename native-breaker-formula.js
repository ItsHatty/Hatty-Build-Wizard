/* NBA 2K27 recovered sequential breaker arithmetic. Archetype weight selection is a
 * 21-direct-attribute proxy: the game's 155-slot max-weight scan is unavailable.
 * This module NEVER claims exact game parity. */
(function(root){'use strict';
function roundGame(x){return Math.floor(x+0.5)}
function archetype(model,ids,ratings,height){
 const h=model.heights[String(height)];if(!h)throw Error('No height weights');
 const result=root.HattyRealOVR.calculateOVR(model,ids.map(k=>ratings[k]),height);
 return result.archetype;
}
function sequence(model,ids,ratings,height,attribute,count=5,ceiling=99){
 const index=ids.indexOf(attribute);if(index<0)throw Error('Unknown attribute: '+attribute);
 const h=model.heights[String(height)];if(!h)throw Error('No height weights');
 const playerType=archetype(model,ids,ratings,height);
 const weights=h.weights[playerType];const selectedWeight=weights[index];
 const maxWeight=Math.max(...weights);
 if(!(maxWeight>0)||!(selectedWeight>=0))throw Error('Invalid archetype weights');
 const start=ratings[attribute];let current=start;const steps=[];
 for(let n=0;n<Math.min(5,count);n++){
  if(current>=ceiling){steps.push(0);continue;}
  const factor=15+Math.trunc((350-14*current)/74);
  const raw=roundGame(((maxWeight-selectedWeight)/maxWeight)*factor);
  const gain=Math.min(ceiling-current,Math.max(1,raw));
  steps.push(gain);current+=gain;
 }
 return {base:start,final:current,steps,playerType,selectedWeight,maxWeight,
   confidence:'archetype-weight-proxy',note:'Recovered sequential formula; max weight uses 21 direct attributes rather than the native 155-slot scan. In-game verification required.'};
}
root.HattyNativeBreakers={sequence,archetype};
if(typeof module!=='undefined')module.exports={sequence,archetype};
})(typeof window!=='undefined'?window:globalThis);
