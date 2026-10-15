(function(root){'use strict';
function caps(data,height,weight,wing){const h=String(height),hm=data.height[h],e=data.endpoints[h];if(!hm||!e)throw Error('Missing body tuning for height '+h);
function blend(rows,value,attr){if(rows.length<2)throw Error('Incomplete endpoint data');const lo=rows[0],hi=rows[rows.length-1];if(value<lo.value||value>hi.value)throw Error('Measurement outside legal endpoints');const a=lo.mult[attr],b=hi.mult[attr];if(!Number.isFinite(a)||!Number.isFinite(b))throw Error('Missing multiplier '+attr);return a+(b-a)*(value-lo.value)/(hi.value-lo.value)}
const result={};for(const a of data.attributes){if(!Number.isFinite(hm[a])){result[a]=null;continue}const raw=25+74*hm[a]*blend(e.weight,weight,a)*blend(e.wing,wing,a);result[a]=Math.max(25,Math.min(99,Math.floor(raw+0.5)))}return result}
root.HattyPhysical={caps};if(typeof module!=='undefined')module.exports={caps};})(typeof window!=='undefined'?window:globalThis);
