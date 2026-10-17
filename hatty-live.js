(function(){'use strict';const $=id=>document.getElementById(id),engine=window.HattyBuild;const output=$('hattyResults');let data;let badgeDataPromise;let breakerPromise;function breakerData(){return Promise.resolve(window.HattyBreakerOptimizer.index());}function badgeData(){return badgeDataPromise||(badgeDataPromise=fetch("./data/badge-research.json").then(r=>{if(!r.ok)throw Error("Badge research data unavailable");return r.json()}));}
function show(msg){output.textContent=msg;const status=$('status');if(status)status.textContent=msg;const secondary=$('result');if(secondary)secondary.textContent=msg}
async function load(){if(data)return data;show('Loading NBA 2K27 measured rules…');const files=['physical-caps.json','linked-rules.json','ovr-model.json'];const [physical,links,ovr]=await Promise.all(files.map(async f=>{const r=await fetch('./data/'+f);if(!r.ok)throw Error('Cannot load '+f);return r.json()}));data={physical,links,ovr};return data}
function getTargets(){return engine.names.flatMap((name,i)=>{const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_$/,'');if(!$('on_'+id)?.checked)return[];return [{id:engine.ids[i],rating:Number($('val_'+id).value),mode:$('mode_'+id).value,breaker:$('cb_'+id).value,requiredBreakers:Number($('cbn_'+id)?.value||5)}]})}
function heightLabel(inches){return `${Math.floor(inches/12)}'${inches%12}"`}
async function run(){try{const d=await load(),pos=$('pos').value,height=Number($('height').value),bodiesDoc=await (await fetch('./data/legal_bodies.json')).json();const row=bodiesDoc.data.find(p=>p.position===pos)?.bodies.find(b=>b.height_inches===height);if(!row)throw Error('Invalid position/height');const targets=getTargets(),finalPhase=$('phase').value==='final',breakerCount=Math.min(30,Math.max(0,Number($('projected').value)||0)),breakerIdx=finalPhase&&targets.length?await breakerData():null,manualWeight=$('weightMode').value==='manual',manualWing=$('wingMode').value==='manual';const weights=manualWeight?[Number($('weight').value)]:Array.from({length:row.weight_lb[1]-row.weight_lb[0]+1},(_,i)=>row.weight_lb[0]+i);const wings=manualWing?[Number($('wing').value)]:Array.from({length:row.wingspan_inches[1]-row.wingspan_inches[0]+1},(_,i)=>row.wingspan_inches[0]+i);let checked=0,feasible=[],over=0,unknown=0;
show('Calculating body caps, linked attributes and 99 OVR affordability…');for(const weight of weights)for(const wing of wings){if(weight<row.weight_lb[0]||weight>row.weight_lb[1]||wing<row.wingspan_inches[0]||wing>row.wingspan_inches[1])continue;checked++;const body={position:pos,height,weight,wing};let targetVariants=[{targets,plans:{},used:0}];if(breakerIdx){const caps=window.HattyPhysical.caps(d.physical,height,weight,wing);const planned=window.HattyBreakerOptimizer.allocations(breakerIdx,targets,caps,breakerCount,body);targetVariants=planned.status==='candidates'?planned.states.slice(0,15).map(x=>({targets:targets.map(t=>({...t,rating:x.base[t.id]})),plans:x.plans,used:x.used})):[];}for(const variant of targetVariants){const result=engine.evaluate(d,body,variant.targets);if(result.status==='candidate'){result.breakerPlans=variant.plans;result.breakersUsed=variant.used;result.baseTargets=variant.targets;feasible.push(result)}else if(result.status==='over_budget')over++;else if(result.status==='unknown')unknown++}}
// Evaluate the recovered formula on the FULL completed base build, not on
// unrelated reference scenarios. Reject any candidate whose predicted final
// rating misses a required target. Formula parity remains beta (21 vs 155 weights).
feasible.sort((a,b)=>a.headroom-b.headroom||a.breakersUsed-b.breakersUsed);
let top=[];let rejectedByFormula=0;let evaluatedByFormula=0;
const pool=breakerIdx?feasible.slice(0,150):feasible.slice(0,5);
for(const candidate of pool){
 const lockedTargets=(candidate.baseTargets||targets).map(t=>({...t,mode:breakerIdx?'exact':t.mode}));
 const r=engine.fill(d,candidate,lockedTargets);
 let valid=true;const projections={};
 if(breakerIdx){
  for(const t of targets){
   const plan=r.breakerPlans?.[t.id];if(!plan){valid=false;break;}
   const projected=window.HattyNativeBreakers.sequence(d.ovr,engine.ids,r.ratings,r.body.height,t.id,plan.used,99);
   projections[t.id]=projected;
   const actual=window.HattyVerifiedBreakers.lookup(r.body,r.ratings,t.id);const observed=actual?window.HattyVerifiedBreakers.project(r.ratings[t.id],actual,plan.used,99):null;
   if((observed!==null?observed:projected.final)<t.rating){valid=false;break;}
  }
  evaluatedByFormula++;
 }
 if(!valid){rejectedByFormula++;continue;}
 r.formulaProjections=projections;top.push(r);
 if(top.length>=5)break;
}
let html=`<p><b>Engine: native-breaker-formula-beta-v6</b></p><p><b>${checked} legal bodies checked · ${feasible.length} base-target candidates · ${over} exceed 99 OVR · ${unknown} unmeasured · ${rejectedByFormula} formula rejections</b></p><p class="warn muted">EXPERIMENTAL, NOT IN-GAME VERIFIED. These are calculated BASE allocations plus recovered sequential cap-breaker formula using build-specific archetype weights (when final phase is selected). The 21-weight maximum is a PROXY for the native 155-weight maximum; cap-breaker results remain unverified. Zero-delta tether export rules are provisionally enforced except where contradicted by the measured 6'5 SG body. These rules may be too restrictive; verify builds in 2K HQ. Confirm every rating in the game's builder before spending VC. Data captured Aug 22, 2026.</p>`;

if(!top.length)html+='<p>No candidate passed the current search and cap-breaker formula proxy. This is NOT proof the request is impossible; try other measurements or lower targets. No unverified success will be claimed.</p>';
for(const r of top){if(r.body.position==='SG'&&r.body.height===77&&r.body.weight===233&&r.body.wing===82&&r.ratings.speed_with_ball>=80&&r.ratings.speed<76)throw Error('SAFETY CHECK: invalid Speed tether escaped optimizer');}
const categories=[
 ['Finishing','#4b9eff',['close_shot','driving_layup','driving_dunk','standing_dunk','post_control']],
 ['Shooting','#50b982',['mid_range','three_point','free_throw']],
 ['Playmaking','#f0a14a',['pass_accuracy','ball_handle','speed_with_ball']],
 ['Defense','#ed6969',['interior_defense','perimeter_defense','steal','block']],
 ['Rebounding','#aa81ef',['offensive_rebound','defensive_rebound']],
 ['Physicals','#edbf54',['speed','agility','strength','vertical']]
];
function buildCard(r,i){
 const plans=r.breakerPlans||{}, projections=r.formulaProjections||{};
 const categoryHTML=categories.map(([title,color,ids])=>{
  const rows=ids.map(id=>{const j=engine.ids.indexOf(id);if(j<0)throw Error('Results UI missing attribute identifier: '+id);const base=r.ratings[id],cap=r.caps[id]??99,plan=plans[id],projection=projections[id],steps=projection?.steps||[],used=plan?.used||0;
   const pct=Math.max(0,Math.min(100,(base-25)/74*100)),capPct=Math.max(0,Math.min(100,(cap-25)/74*100));
   const label=engine.names[j].replace('Three-Point Shot','Three-Point').replace('Mid-Range Shot','Mid-Range').replace('Offensive Rebound','Off. Rebound').replace('Defensive Rebound','Def. Rebound');
   const end=projection?.final??base;
   const breakerInfo=used?`<div class="wizard-steps">${steps.slice(0,used).map(n=>`<span class="wizard-step">+${n}</span>`).join('')}<span class="wizard-final">→ ${end} projected</span></div>`:'<div class="wizard-steps wizard-none">No breakers allocated</div>';
   return `<div class="wizard-attribute"><div class="wizard-attr-label"><span>${label}</span><strong>${base}</strong></div><div class="wizard-track"><span style="width:${pct}%;background:${color}"></span><i style="left:${capPct}%"></i></div><div class="wizard-cap">${breakerInfo}<small>cap ${cap}</small></div></div>`;
  }).join('');return `<section class="wizard-category" style="--category-color:${color}"><h4>${title}</h4>${rows}</section>`;
 }).join('');
 return `<article class="insight wizard-build"><div class="wizard-build-header"><div><div class="wizard-rank">BUILD #${i+1} · ${r.body.position}</div><h3>${heightLabel(r.body.height)} · ${r.body.weight} lb · ${heightLabel(r.body.wing)} wingspan</h3><p>Calculated base OVR <b>${r.ovr.toFixed(3)} / 99</b> · ${r.breakersUsed||0}/${breakerCount} projected breakers allocated</p></div><span class="wizard-beta">BETA · UNVERIFIED</span></div><div class="wizard-category-grid">${categoryHTML}</div><details class="wizard-full-table"><summary>View exact base ratings and physical caps as a table</summary><div class="scroll"><table><tr><th>Attribute</th><th>Base</th><th>Cap</th></tr>${engine.ids.map((id,j)=>`<tr><td>${engine.names[j]}</td><td>${r.ratings[id]}</td><td>${r.caps[id]}</td></tr>`).join('')}</table></div></details></article>`;
}
for(const [i,r] of top.entries())html+=buildCard(r,i);
output.innerHTML=html;const resultCards=output.querySelectorAll('.insight');for(let i=0;i<top.length;i++){const r=top[i],entries=Object.entries(r.breakerPlans||{}).filter(([id,o])=>o.used>0);if(!entries.length)continue;const box=document.createElement('div');box.className='insight';const h=document.createElement('h4');h.textContent='Cap-breaker allocation — recovered formula (BETA proxy)';box.appendChild(h);
for(const [id,o] of entries){
 const projected=r.formulaProjections?.[id];if(!projected)continue;
 const p=document.createElement('p');p.textContent=`${id.replace(/_/g,' ')}: base ${projected.base} · ${o.used} breakers · steps ${projected.steps.map(n=>'+'+n).join(' / ')} · projected final ${projected.final} · target ${targets.find(t=>t.id===id)?.rating}`;box.appendChild(p);
 const actual=window.HattyVerifiedBreakers.lookup(r.body,r.ratings,id);
 if(actual){const q=document.createElement('p');const observed=window.HattyVerifiedBreakers.project(r.ratings[id],actual,o.used,99);q.className=observed>=Number(targets.find(t=>t.id===id)?.rating)?'good':'warn';q.textContent='Exact full-build observation: '+actual.join(' / ')+' → '+observed+(observed>=Number(targets.find(t=>t.id===id)?.rating)?' (target reached)':' (target MISSED — projection invalid)');box.appendChild(q);}
}
const note=document.createElement('p');note.className='warn small';note.textContent='BETA FORMULA, NOT GAME-VERIFIED: Uses the recovered sequential native arithmetic and the full build\'s OVR archetype, but only the 21 visible attribute weights for maxWeight (game scans 155). A matching verified observation overrides the projection when judging the target. Do not spend VC without checking 2K HQ.';box.appendChild(note);resultCards[i]?.appendChild(box);
const capture=document.createElement('details');capture.innerHTML='<summary>Record five in-game cap-breaker gains for this exact build</summary><p class="muted small">Enter the five +values shown in NBA 2K27 for one attribute. These observations are saved on this device and apply ONLY to this exact 21-attribute base build.</p><label>Attribute <select class="recordAttr"></select></label><label>Five gains, comma-separated <input class="recordGains" placeholder="2,2,2,1,1" style="width:100%;max-width:280px"></label><button class="recordSave" type="button">Save verified observation</button><p class="recordStatus"></p>';const select=capture.querySelector('.recordAttr');engine.ids.forEach((key,j)=>{const opt=document.createElement('option');opt.value=key;opt.textContent=engine.names[j];select.appendChild(opt)});select.value=entries[0][0];capture.querySelector('.recordSave').addEventListener('click',()=>{try{const gains=capture.querySelector('.recordGains').value.split(',').map(x=>Number(x.trim()));window.HattyVerifiedBreakers.record(r.body,r.ratings,select.value,gains);capture.querySelector('.recordStatus').textContent='Saved for this exact build. Run optimization again to see the verified comparison.'}catch(e){capture.querySelector('.recordStatus').textContent=e.message}});resultCards[i]?.appendChild(capture);} 
try{const badgeDoc=await badgeData();for(let i=0;i<top.length;i++){const r=top[i];const report=window.HattyUnlocks.evaluate(badgeDoc,r.ratings,r.body.height);const display=report.badges.map(b=>`${b.name.replace(/_/g,' ')} (${b.tier.replace(/_/g,' ')}, cost ${b.cost??'?'})`).join(' · ');const panel=document.createElement('div');panel.className='insight';panel.innerHTML=`<h4>Badge & token research — calculated BASE ratings</h4><p>${report.badges.length} qualifying badges. Token potential [Finishing / Shooting / Playmaking / Defense / Rebounding / Physicals]: <b>${report.tokenPotential.join(' / ')}</b>.</p><details><summary>Show qualifying badges</summary><p class="small"></p></details><p class="muted small">Badge eligibility and token contributions from the Aug 2026 native dataset. Token potential is not an equipped loadout. Slots, animations, and takeovers are not optimized. Cap-breaker gains depend on the full build and are not assumed.</p>`;panel.querySelector('details p').textContent=display||'None';resultCards[i]?.appendChild(panel);}}catch(badgeError){const warning=document.createElement('p');warning.textContent='Badge research unavailable: '+badgeError.message;output.appendChild(warning)}
const secondary=$('result');if(secondary)secondary.innerHTML=html;const status=$('status');if(status)status.textContent=`Optimization complete: ${checked} legal bodies checked, ${feasible.length} candidates. Results below.`;output.scrollIntoView({behavior:'smooth',block:'start'});
}catch(e){show('Unable to calculate: '+e.message);console.error(e)}}
$('hattyRun').addEventListener('click',run);
})();
