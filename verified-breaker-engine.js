/* Full-build keyed cap-breaker observations. No extrapolation between builds. */
(function(root){'use strict';
const ids=['close_shot','driving_layup','driving_dunk','standing_dunk','post_control','mid_range','three_point','free_throw','pass_accuracy','ball_handle','speed_with_ball','interior_defense','perimeter_defense','steal','block','offensive_rebound','defensive_rebound','speed','agility','strength','vertical'];
const STORE='hatty-verified-breaker-observations-v1';
function signature(body,ratings){return [body.position,body.height,body.weight,body.wing,...ids.map(k=>ratings[k])].join('|')}
function observations(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}}
function record(body,ratings,attribute,steps){if(!ids.includes(attribute)||!Array.isArray(steps)||steps.length!==5||steps.some(n=>!Number.isInteger(n)||n<0||n>20))throw Error('Enter five valid nonnegative breaker gains');const key=signature(body,ratings);const saved=observations();saved[key]??={};saved[key][attribute]=steps;localStorage.setItem(STORE,JSON.stringify(saved));return key}
function lookup(body,ratings,attribute){return observations()[signature(body,ratings)]?.[attribute]||null}
function project(base,steps,n,cap=99){let value=base;for(let i=0;i<n;i++)value=Math.min(cap,value+(steps[i]||0));return value}
root.HattyVerifiedBreakers={ids,signature,observations,record,lookup,project};if(typeof module!=='undefined')module.exports={ids,signature,record,project};
})(typeof window!=='undefined'?window:globalThis);
