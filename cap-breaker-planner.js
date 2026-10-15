/* Strict confirmed-sequence planner. Never extrapolate reference-body gains to arbitrary builds. */
(function(root){'use strict';
function plan(base,goal,sequence,available=5){if(!Number.isInteger(base)||!Number.isInteger(goal)||base<25||goal>99||goal<base)return {status:'invalid'};if(!Array.isArray(sequence)||!sequence.length||sequence.length>5||sequence.some(x=>!Number.isInteger(x)||x<=0))return {status:'unknown',reason:'No valid confirmed cap-breaker progression for this exact build'};let rating=base;for(let n=0;n<=Math.min(5,available);n++){if(rating>=goal)return {status:'reached',base,goal,used:n,final:rating,steps:sequence.slice(0,n)};if(n<sequence.length)rating=Math.min(99,rating+sequence[n]);else break;}return {status:'unreachable',base,goal,available};}
root.HattyBreakers={plan};if(typeof module!=='undefined')module.exports={plan};
})(typeof window!=='undefined'?window:globalThis);
