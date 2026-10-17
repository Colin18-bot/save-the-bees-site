// Lumen lighting design workspace — application logic.
// Open index.html; this script is loaded automatically.

'use strict';
const $ = s => document.querySelector(s),
  esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [c]));
const KEY = 'lumen-lighting-v01';
const pages = ['Overview', 'Project & scope', 'Road & users', 'Environment', 'Design brief',
  'Design risks', 'Review & reports'
];
let page = 0,
  areaIndex = 0;

function newId() {
  return globalThis.crypto?.randomUUID?.() || 'area-' + Date.now().toString(36) + '-' + Math
    .random().toString(36).slice(2, 12)
}
// Rule set UK-2026-10-v1. Initial selection follows BS 5489-1:2020 Annex A.
// Risk prompts are review aids; they do not apply invented numerical weightings.
const RULESET = 'UK-2026-10-v1';
const CLASS_NAMES = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'P1',
  'P2', 'P3', 'P4', 'P5', 'P6'
];
const BS_SOURCE =
  'https://www.lincolnshire.gov.uk/downloads/file/10050/british-standards-bs-5489-1-2020-design-of-road-lighting';
const ADDITIONAL_AREA_FIELDS = {
  flowBasis: '',
  adt: '',
  capacity: '',
  trafficBand: '',
  junctionDensity: '',
  useIntensity: '',
  townUse: '',
  approach1: '',
  approach2: '',
  conflictConfirmed: '',
  conflictExtent: '',
  visualGuidance: '',
  crime: '',
  collisions: '',
  vandalism: '',
  school: '',
  calming: '',
  recognition: '',
  localEvidence: '',
  lightSource: '',
  decisionMode: '',
  decisionStamp: '',
  reviewer: '',
  reviewDate: ''
};

function recommend(a) {
  const result = {
    className: '',
    reference: '',
    reasons: [],
    gaps: [],
    prompts: [],
    limits: [],
    basis: ''
  };
  const isM = ['Motorway', 'Dual carriageway', 'Main traffic route'].includes(a.type);
  if (isM) {
    const speed = parseInt(a.speed, 10),
      dual = a.layout === 'Dual carriageway';
    if (!Number.isFinite(speed) || speed < 1) result.gaps.push(
      'Select the applicable speed limit.');
    if (!['Dual carriageway', 'Single carriageway — two-way'].includes(a.layout)) result.gaps.push(
      'Confirm single or dual carriageway; this arrangement needs manual assessment if neither applies.'
    );
    if (a.type === 'Motorway' && (!dual || speed < 60)) result.gaps.push(
      'The motorway inputs are inconsistent with the implemented route; confirm arrangement and speed.'
    );
    if (a.type !== 'Motorway' && speed >= 60) result.gaps.push(
      'A non-motorway route at 60 mph or above needs explicit review of the table scope; no automatic class is issued.'
    );
    let band = '';
    if (a.flowBasis === 'Average daily traffic (ADT)') {
      const n = Number(a.adt);
      if (a.adt === '' || !Number.isFinite(n) || n < 0) result.gaps.push('Enter a valid ADT.');
      else {
        band = n > 40000 ? 'High to very high' : n < 7000 ? 'Very low' : 'Low to moderate';
        result.basis =
          `ADT ${n} vehicles/day. Confirm this is an appropriate basis for the most demanding dark-hour conditions.`;
      }
    } else if (a.flowBasis === 'Percentage of lane capacity') {
      const n = Number(a.capacity);
      if (a.capacity === '' || !Number.isFinite(n) || n < 0 || n > 100) result.gaps.push(
        'Enter a capacity percentage from 0 to 100.');
      else {
        let low = dual ? 35 : 15,
          high = dual ? 65 : 45;
        band = n > high ? 'High to very high' : n < low ? 'Very low' : 'Low to moderate';
        result.basis =
          `${n}% of lane capacity; capacity model and relevant dark-hour period must be evidenced.`;
      }
    } else if (a.flowBasis === 'Designer-selected traffic band') {
      if (['High to very high', 'Low to moderate', 'Very low'].includes(a.trafficBand)) band = a
        .trafficBand;
      else result.gaps.push('Select the traffic band.');
      result.basis =
        'Traffic band supplied by the designer; document the evidence and assessed time period.';
    } else result.gaps.push(
      'Choose an explicit traffic classification basis. The earlier Low/Moderate/High answer is not used as a standards threshold.'
    );
    if (dual && !['High — junction centres <3 km apart', 'Low — junction centres ≥3 km apart']
      .includes(a.junctionDensity)) result.gaps.push(
      'Record junction density for the dual carriageway.');
    result.reference = 'BS 5489-1:2020, A.3.1; ' + (speed > 40 ? 'Table A.2' : 'Table A.3');
    if (!result.gaps.length && band) {
      const row = ['High to very high', 'Low to moderate', 'Very low'].indexOf(band);
      const offset = dual && a.junctionDensity.startsWith('Low') ? 1 : 0;
      const n = (speed > 40 ? 2 : 3) + row + offset;
      result.className = 'M' + n;
      result.reasons.push(
        `Traffic-route assessment at ${speed} mph using ${speed>40?'the over-40 mph':'the up-to-40 mph'} selection route.`,
        `${a.layout}; ${dual?a.junctionDensity:'single-carriageway column'}.`,
        `Traffic band: ${band}.`, result.basis,
        'Initial assumptions include moderate background brightness, good guidance and no parked vehicles; differences require the risk review below.'
      );
    }
  } else if (a.type === 'Junction / roundabout / conflict area') {
    result.reference = 'BS 5489-1:2020, A.3.2, Table A.4';
    if (a.conflictConfirmed !== 'Yes — conflict area confirmed') result.gaps.push(
      'Confirm that the location is a conflict area; junction presence alone is insufficient.');
    if (!a.conflictExtent?.trim()) result.gaps.push(
      'Define the conflict-area boundary and approaches.');
    let approaches = [a.approach1, a.approach2].filter(Boolean);
    if (!approaches.length || approaches.some(x => !/^M[1-6]$/.test(x))) result.gaps.push(
      'Enter the applicable M classes of approaching routes. Include the strongest approach.');
    if (!result.gaps.length) {
      let n = Math.min(...approaches.map(x => Number(x.slice(1))));
      result.className = 'C' + (n - 1);
      result.reasons.push(`Recorded approaches: ${approaches.join(', ')}.`,
        `The strongest recorded approach is M${n}; the conflict-area mapping gives ${result.className}.`
      );
    }
    result.limits.push(
      'PLG02 (2026) full-text rules have not been implemented. Verify qualification, extent, transitions and crossing requirements separately. Approach values are entered manually and must be updated if adjacent designs change.'
    );
  } else if (a.type === 'Town / city centre') {
    result.reference = 'BS 5489-1:2020, A.3.4, Table A.6';
    const use = ['Pedestrian through-route', 'Pedestrian area', 'Vehicles with separate footways',
      'Vehicles and pedestrians sharing a surface'
    ].indexOf(a.townUse);
    if (use < 0) result.gaps.push('Select the town-centre movement arrangement.');
    if (!['Normal', 'Busy'].includes(a.useIntensity)) result.gaps.push(
      'Choose Normal or Busy for the town-centre assessment; a quiet case needs review.');
    if (!['E3', 'E4'].includes(a.zone)) result.gaps.push(
      'The implemented town-centre route requires E3 or E4; confirm applicability.');
    if (!result.gaps.length) {
      const col = (a.useIntensity === 'Busy' ? 2 : 0) + (a.zone === 'E4' ? 1 : 0);
      result.className = [
        ['P2', 'P1', 'P2', 'P1'],
        ['C4', 'C3', 'C3', 'C2'],
        ['C3', 'C2', 'C2', 'C1'],
        ['C2', 'C1', 'C1', 'C1']
      ][use][col];
      result.reasons.push(
        `${a.townUse}; ${a.useIntensity.toLowerCase()} activity; environmental zone ${a.zone}.`,
        'Town-centre selection is assessed separately from the ordinary subsidiary-road route.');
    }
  } else if (['Residential / subsidiary road', 'Footpath', 'Cycle route / shared path',
      'Pedestrian area'
    ].includes(a.type)) {
    result.reference = 'BS 5489-1:2020, A.3.3, Table A.5';
    const pedestrianOnly = a.type !== 'Residential / subsidiary road',
      speed = parseInt(a.speed, 10);
    if (!['Quiet', 'Normal', 'Busy'].includes(a.useIntensity)) result.gaps.push(
      'Select Quiet, Normal or Busy using the descriptions provided.');
    if (!['E1', 'E2', 'E3', 'E4'].includes(a.zone)) result.gaps.push(
      'Confirm E1–E4. E0 requires a separate assessment; no automatic class is assigned.');
    if (!pedestrianOnly && (!Number.isFinite(speed) || speed > 30 || speed < 1)) result.gaps.push(
      'The implemented subsidiary-road route applies at up to 30 mph; review the road type/speed.'
    );
    if (!result.gaps.length) {
      let row = ['Busy', 'Normal', 'Quiet'].indexOf(a.useIntensity);
      let col = pedestrianOnly ? 0 : ['E1', 'E2'].includes(a.zone) ? 1 : 2;
      result.className = [
        ['P5', 'P4', 'P3'],
        ['P5', 'P5', 'P4'],
        ['P6', 'P5', 'P4']
      ][row][col];
      result.reasons.push(pedestrianOnly ? 'Assessment recorded as pedestrians/cyclists only.' :
        `Subsidiary-road assessment at ${speed} mph.`,
        `${a.useIntensity} activity in environmental zone ${a.zone}.`,
        'The initial selection assumes no parked vehicles; assess site-specific needs before confirming a final class.'
      );
    }
  } else result.gaps.push(
    'Choose a supported area type. Car parks, tunnels and specialist applications need their applicable standards and a separate assessment.'
  );
  if (a.parking === 'Yes') result.prompts.push(
    'Parked vehicles may obscure users and increase task complexity: consider whether a stronger class or revised coverage is justified.'
  );
  if (a.bus === 'Yes') result.prompts.push(
    'Bus stops: review waiting areas, boarding activity and crossing desire lines.');
  if (a.slow === 'Yes') result.prompts.push(
    'Slow/heavy vehicles: evaluate the actual traffic mix and visual task; no automatic class increase is applied.'
  );
  if (a.school === 'Yes' || a.calming === 'Yes') result.prompts.push(
    'School access or traffic calming: assess the local visual task and whether a separate area or stronger requirement is needed.'
  );
  if (a.crossing && a.crossing !== 'None identified') result.prompts.push(
    'Crossing provision requires a separate check of approaches and horizontal/vertical visibility. TR12 details are not automated.'
  );
  if (a.junction === 'Yes' && a.type !== 'Junction / roundabout / conflict area') result.prompts
    .push(
      'Review the junctions for possible separate conflict areas; do not classify every junction automatically.'
    );
  if (a.crime === 'Yes' || a.recognition === 'Yes') result.prompts.push(
    'Crime/recognition: assess surveillance, faces and vertical illumination. Record supplementary EV/SC requirements as appropriate; do not just add brightness. Review any proposed dimming carefully.'
  );
  if (a.collisions === 'Yes') result.prompts.push(
    'Review darkness-related collision evidence, patterns and possible causes with road-safety colleagues; no automatic uplift is assumed.'
  );
  if (a.vandalism === 'Yes') result.prompts.push(
    'Vandalism: consider equipment robustness, siting, surveillance and maintainability alongside lighting performance.'
  );
  if (isM && a.visualGuidance === 'Poor') result.prompts.push(
    'Poor visual guidance differs from the initial table assumptions; assess whether a stronger class is justified.'
  );
  if (isM && ['High', 'Low', 'Dark'].includes(a.brightness)) result.prompts.push(
    `Background brightness is ${a.brightness.toLowerCase()}, rather than the assumed moderate condition; review whether an adjustment is justified.`
  );
  if (a.lightSource === 'S/P <1 and low colour rendering') result.prompts.push(
    'Low S/P and low colour rendering: assess source-related adjustment for P lighting using A.3.3.3 / PLG03. No automatic reduction is applied.'
  );
  if (a.ecology && a.ecology !== 'Report available — no relevant constraints identified' || a
    .habitats) result.prompts.push(
    'Resolve ecology constraints alongside the road-user task; agree mitigation and verify the resulting photometry.'
  );
  ['parking', 'bus', 'slow', 'crime', 'collisions', 'vandalism', 'school', 'calming', 'recognition']
  .forEach(k => {
    if (!a[k] || a[k] === 'Unknown') result.limits.push(
      `Risk-review input not confirmed: ${k}.`)
  });
  if (!a.trafficEvidence?.trim()) result.limits.push(
    'Activity evidence/time period is missing. The initial result is provisional.');
  if (!a.zoneBasis?.trim()) result.limits.push(
    'Environmental-zone rationale/authority agreement is not recorded.');
  result.limits.push(
    'Rules provide an initial recommendation and review prompts, not photometric compliance or authority approval. Review local policy and applicable national requirements.'
  );
  return result;
}

function performance(cls) {
  if (/^P[1-6]$/.test(cls)) {
    const i = Number(cls[1]) - 1;
    const avg = [15, 10, 7.5, 5, 3, 2][i],
      min = [3, 2, 1.5, 1, .6, .4][i];
    return {
      source: 'BS EN 13201-2:2015, Table 3; BS 5489-1:2020, 7.2',
      items: [
        ['Maintained average illuminance ≥', avg + ' lx'],
        ['Minimum illuminance ≥', min + ' lx'],
        ['Maintained average cap', avg * 1.5 + ' lx'],
        ['Overall uniformity — UK review', 'At least ' + (min / avg).toFixed(2) +
          '; seek as high as reasonably practicable'
        ],
        ['Disability glare TI — Annex C reference', '≤ ' + [20, 25, 25, 30, 30, 35][i] + '%']
      ],
      note: 'Check the relevant area and glare method. If facial recognition is required, separately specify the relevant vertical/semi-cylindrical criteria and viewing orientations.'
    };
  }
  if (/^C[0-5]$/.test(cls)) {
    let i = Number(cls[1]);
    return {
      source: 'BS EN 13201-2:2015, Table 2 and Annex C',
      items: [
        ['Maintained average illuminance ≥', [50, 30, 20, 15, 10, 7.5][i] + ' lx'],
        ['Overall uniformity ≥', '0.40'],
        ['Disability glare TI — Annex C reference', '≤ ' + (i < 3 ? 15 : 20) + '%']
      ],
      note: 'Define assessment boundaries and relevant observers. Verify the appropriate glare-control method; a C class alone is not a crossing design.'
    };
  }
  if (/^M[1-6]$/.test(cls)) {
    let i = Number(cls[1]) - 1;
    return {
      source: 'BS EN 13201-2:2015, Table 1',
      items: [
        ['Maintained average luminance ≥', [2, 1.5, 1, .75, .5, .3][i] + ' cd/m²'],
        ['Dry overall uniformity ≥', i < 4 ? '0.40' : '0.35'],
        ['Longitudinal uniformity reference ≥', i < 2 ? '0.70' : i < 4 ? '0.60' : '0.40'],
        ['Disability glare TI ≤', [10, 10, 15, 15, 15, 20][i] + '%'],
        ['Edge illuminance ratio reference ≥', i < 2 ? '0.35' : '0.30'],
        ['Wet uniformity reference ≥', '0.15 — confirm applicability']
      ],
      note: 'Confirm road-surface reflection assumptions. Longitudinal uniformity applies to appropriate uninterrupted sections; edge and wet criteria depend on the applicable scheme/national requirements. Do not convert this luminance target directly to lux.'
    };
  }
  return null;
}

function fingerprint(a) {
  const copy = {
    ...a
  };
  ['classChoice', 'classReason', 'classSource', 'decisionMode', 'decisionStamp', 'reviewer',
    'reviewDate'
  ].forEach(k => delete copy[k]);
  return JSON.stringify({
    rules: RULESET,
    area: copy,
    operation: {
      hours: state.design.hours,
      dimming: state.design.dimming,
      cct: state.design.cct
    },
    lightingNeed: state.project.need
  });
}

function decisionSignature(a) {
  return JSON.stringify({
    inputs: fingerprint(a),
    mode: a.decisionMode,
    chosen: a.classChoice,
    reason: a.classReason,
    reviewer: a.reviewer,
    date: a.reviewDate,
    source: a.classSource
  });
}

function decision(a) {
  const r = recommend(a);
  if (!a.decisionMode) return {
    className: '',
    status: 'Awaiting designer decision'
  };
  if (a.decisionStamp !== decisionSignature(a)) return {
    className: '',
    status: 'Inputs changed — review and confirm again'
  };
  if (!CLASS_NAMES.includes(a.classChoice)) return {
    className: '',
    status: 'Choose a valid final class'
  };
  if (a.decisionMode === 'Accept recommendation' && a.classChoice !== r.className) return {
    className: '',
    status: 'Selection differs from recommendation — use alternative mode'
  };
  if (!a.classReason.trim() || !a.reviewer.trim() || !a.reviewDate) return {
    className: '',
    status: 'Complete justification, reviewer and date'
  };
  return {
    className: a.classChoice,
    status: 'Designer decision recorded — subject to project review'
  };
}

function confirmDecision() {
  const a = state.areas[areaIndex],
    r = recommend(a);
  if (!a.decisionMode) {
    toast('Select acceptance or a designer alternative first.');
    return
  }
  if (a.decisionMode === 'Accept recommendation') {
    if (!r.className) {
      toast('Complete the selection inputs before accepting a recommendation.');
      return
    }
    a.classChoice = r.className;
  }
  if (!CLASS_NAMES.includes(a.classChoice) || !a.classReason.trim() || !a.reviewer.trim() || !a
    .reviewDate) {
    toast('Complete final class, justification, designer and review date.');
    return
  }
  a.classSource = r.reference || a.classSource;
  a.decisionStamp = decisionSignature(a);
  save();
  render();
  toast('Designer decision recorded. Input changes will flag it for review.');
}

function performanceHTML(cls) {
  const p = performance(cls);
  return p ?
    `<h3>Performance requirements for ${esc(cls)}</h3><table><tbody>${p.items.map(x=>`<tr><td>${esc(x[0])}</td><td><strong>${esc(x[1])}</strong></td></tr>`).join('')}</tbody></table><p class="hint">${esc(p.source)}. ${esc(p.note)}</p>` :
    '';
}

function recommendationHTML(a) {
  const r = recommend(a),
    d = decision(a);
  return `<div class="rec-result"><div class="eyebrow">Initial recommendation · ${RULESET}</div><h2 class="class-result">${r.className||'More information needed'}</h2><p class="small">${esc(r.reference||'Select assessment route')}</p><ol>${r.reasons.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${r.gaps.length?`<div class="info notice"><strong>Needed to calculate</strong><ul>${r.gaps.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}${performanceHTML(r.className)}<h3>Site-specific review prompts</h3>${r.prompts.length?`<ul>${r.prompts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="small">No positive flags from the recorded answers; complete all risk questions and review local evidence.</p>'}<details><summary>Assumptions, incomplete information and limitations</summary><ul>${r.limits.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details><div class="info"><strong>Final design class: ${esc(d.className||'Not confirmed')}</strong><br>${esc(d.status)}</div>${d.className&&d.className!==r.className?performanceHTML(d.className):''}<p class="hint">Recommendation and designer selection are retained separately. An adjustment beyond one class or across families needs explicit project-specific justification and applicable approvals.</p></div>`;
}

function selectionInputs(a) {
  const p = `areas.${areaIndex}.`;
  const isM = ['Motorway', 'Dual carriageway', 'Main traffic route'].includes(a.type),
    conflict = a.type === 'Junction / roundabout / conflict area',
    town = a.type === 'Town / city centre';
  return `<div class="fields">${isM?field(p+'flowBasis','Traffic-band evidence method','ADT and capacity percentages are alternative indicators; review conflicts with observed dark-hour conditions.',['Average daily traffic (ADT)','Percentage of lane capacity','Designer-selected traffic band'])+field(p+'adt','Average daily traffic (vehicles/day)','Used only if ADT is the selected method.',null,false,'number')+field(p+'capacity','Flow as % of lane capacity','Use an appropriate capacity model and relevant dark-hour period.',null,false,'number')+field(p+'trafficBand','Traffic band — manual method','Use only with supporting evidence; generic Low/Moderate/High is not used.',['High to very high','Low to moderate','Very low'])+field(p+'junctionDensity','Dual-carriageway junction density','Junction-centre spacing; required only for dual carriageways.',['High — junction centres <3 km apart','Low — junction centres ≥3 km apart']):conflict?field(p+'conflictConfirmed','Conflict-area qualification','Confirm through the design assessment. Full PLG02 (2026) logic is pending.',['Yes — conflict area confirmed','Uncertain — further review','No — reassess area type'])+field(p+'approach1','Strongest approaching route class','Use the strongest applicable M class; update manually when route decisions change.',['M1','M2','M3','M4','M5','M6'])+field(p+'approach2','Other approaching route class (optional)','Add another M class where relevant.',['M1','M2','M3','M4','M5','M6'])+field(p+'conflictExtent','Conflict area and approach boundaries','Record the layout/drawing reference and assessment extent.',null,true,'textarea'):field(p+'useIntensity','Use intensity for class selection','Busy: significant activity associated with local amenities. Normal: broadly an estate access road. Quiet: mainly serving adjoining homes. Assess the relevant dark-hour peak.',['Busy','Normal','Quiet'])+(town?field(p+'townUse','Town-centre movement arrangement','Choose the relevant space; ordinary traffic routes still use the traffic-route method.',['Pedestrian through-route','Pedestrian area','Vehicles with separate footways','Vehicles and pedestrians sharing a surface']):'')}${field(p+'zone','Environmental zone used in selection','E1/E2 and E3/E4 affect subsidiary-road selection. E0 is a manual review case.',['E0','E1','E2','E3','E4','Unknown'])}${field(p+'zoneBasis','Zone evidence / agreement','Record the basis and adjoining sensitive areas.')}</div>${zoneGuide()}`;
}

function localReviewInputs() {
  const p = `areas.${areaIndex}.`;
  return `<div class="fields">${field(p+'crime','Crime / personal-safety concern','Record local evidence and the specific visibility problem.',yes)}${field(p+'collisions','Darkness-related RTC concern','Use time-of-day patterns and road-safety evidence; lighting is not assumed to be the cause.',yes)}${field(p+'vandalism','Vandalism / deliberate damage','Consider physical protection, siting and maintenance as well as light levels.',yes)}${field(p+'school','School / busy access','Assess actual dark-hour movements and sight lines.',yes)}${field(p+'calming','Traffic-calming features','Consider a local assessment and approach visibility.',yes)}${field(p+'recognition','Need to recognise people / intent','May require supplementary vertical or semi-cylindrical criteria.',yes)}${field(p+'visualGuidance','Visual guidance','The initial traffic-route assumptions include good guidance.',['Good','Poor','Unknown'])}${field(p+'lightSource','Source characteristics','No automatic white-light class reduction. Use actual manufacturer S/P and colour-rendering data.',['White light — S/P ≥1','S/P <1 and low colour rendering','Unknown'])}${field(p+'localEvidence','Local evidence and risk-review conclusions','Crime / RTC records, consultation, observations, chosen controls, supplementary criteria and why any change is appropriate.',null,true,'textarea')}</div>`;
}

function decisionInputs() {
  const p = `areas.${areaIndex}.`;
  return `<div class="fields">${field(p+'decisionMode','Designer decision','Keep the recommendation intact while recording your own conclusion.',['Accept recommendation','Select designer alternative'])}${field(p+'classChoice','Final class / alternative','For acceptance, the current recommendation is copied when you confirm. For an alternative, select your justified class.',CLASS_NAMES)}${field(p+'classReason','Reason for final decision','Explain acceptance or the alternative; identify evidence, residual concerns and any supplementary criteria.',null,true,'textarea')}${field(p+'reviewer','Designer recording decision','Name or initials; this is a decision record, not a digital approval signature.')}${field(p+'reviewDate','Decision date','Record the review date.',null,false,'date')}${field(p+'classSource','Additional standards / policy references','Record local policy, further guidance or departures.')}</div><div class="actions" style="margin-top:18px"><button class="primary" onclick="confirmDecision()">Confirm designer decision</button><button onclick="refreshRecommendations()">Recalculate / refresh</button></div>`;
}

function refreshRecommendations() {
  const box = document.getElementById('live-recommendation');
  if (box) box.innerHTML = recommendationHTML(state.areas[areaIndex]);
}

function recommendationsReport() {
  return `<section><h2>Automatic recommendations and designer decisions</h2><p>Initial class-selection rules: ${RULESET}. Sources: BS 5489-1:2020 Annex A and BS EN 13201-2:2015. Local risk adjustments remain reasoned designer decisions. Full PLG02/TR12 rules and DMRB overlays have not been implemented.</p>${state.areas.map(a=>`<h3>${esc(a.name)}</h3>${recommendationHTML(a).replace("<details>","<details open>")}<table><tbody>${rows(a,{flowBasis:'Traffic-band method',adt:'ADT',capacity:'Lane capacity %',trafficBand:'Manual traffic band',junctionDensity:'Junction density',useIntensity:'Use intensity',townUse:'Town-centre arrangement',conflictConfirmed:'Conflict qualification',conflictExtent:'Conflict extent',approach1:'Approach class 1',approach2:'Approach class 2',crime:'Crime concern',collisions:'RTC concern',vandalism:'Vandalism',school:'School access',calming:'Traffic calming',recognition:'Recognition need',visualGuidance:'Visual guidance',lightSource:'Source characteristics',localEvidence:'Risk-review evidence',decisionMode:'Designer decision',classChoice:'Recorded class — check decision status above',classReason:'Justification',reviewer:'Designer',reviewDate:'Decision date'})}</tbody></table>`).join('')}</section>`;
}

const freshArea = () => ({
  ...ADDITIONAL_AREA_FIELDS,
  id: newId(),
  name: 'Assessment area',
  type: '',
  roadClass: '',
  speed: '',
  operatingSpeed: '',
  layout: '',
  lanes: '',
  flow: '',
  trafficEvidence: '',
  pedestrians: '',
  cyclists: '',
  slow: '',
  parking: '',
  bus: '',
  junction: '',
  crossing: '',
  complexity: '',
  brightness: '',
  zone: '',
  zoneBasis: '',
  ecology: '',
  habitats: '',
  receptors: '',
  ecologyRequirements: '',
  classChoice: '',
  classReason: '',
  classSource: '',
  boundary: ''
});
const blank = () => ({
  version: 1,
  project: {
    name: '',
    reference: '',
    location: '',
    authority: '',
    designer: '',
    date: new Date().toISOString().slice(0, 10),
    scope: '',
    adoption: '',
    need: '',
    drawings: '',
    description: '',
    revision: 'P01'
  },
  areas: [freshArea()],
  design: {
    columns: '',
    height: '',
    setback: '',
    lantern: '',
    cct: '',
    cms: '',
    hours: '',
    dimming: '',
    power: '',
    earthing: '',
    ducts: '',
    maintenance: '',
    structural: '',
    services: '',
    suds: '',
    extra: '',
    deliverables: []
  },
  risks: {},
  customRisks: []
});
// Only accept known fields and safe identifiers from imported or stored data.
function normaliseProject(data) {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!object(data) || data.version !== 1 || !object(data.project) || !object(data.design) || !Array
    .isArray(data.areas) || data.areas.length < 1 || data.areas.length > 100 || !object(data
      .risks) || !Array.isArray(data.customRisks) || data.customRisks.length > 500) throw Error(
    'Invalid project structure');
  const strings = (base, src) => {
    if (!object(src)) throw Error('Invalid record');
    for (const k of Object.keys(base)) {
      if (Array.isArray(base[k])) continue;
      if (Object.hasOwn(src, k)) {
        if (typeof src[k] !== 'string') throw Error('Invalid text field');
        base[k] = src[k]
      }
    }
    return base
  };
  const clean = blank();
  clean.project = strings(clean.project, data.project);
  clean.design = strings(clean.design, data.design);
  if (!Array.isArray(data.design.deliverables) || !data.design.deliverables.every(x => typeof x ===
      'string')) throw Error('Invalid deliverables');
  clean.design.deliverables = [...new Set(data.design.deliverables)];
  const ids = new Set();
  clean.areas = data.areas.map(src => {
    let area = strings(freshArea(), src);
    if (!/^[a-zA-Z0-9-]+$/.test(area.id)) {
      if (/^\d+\.\d+$/.test(area.id)) area.id = area.id.replace('.', '-');
      else throw Error('Invalid area identifier')
    }
    if (ids.has(area.id)) throw Error('Duplicate area identifier');
    ids.add(area.id);
    return area
  });
  const riskBase = {
    title: '',
    hazard: '',
    people: '',
    controls: '',
    stage: '',
    owner: '',
    status: 'Open — assess',
    initialL: '',
    initialS: '',
    residualL: '',
    residualS: '',
    evidence: '',
    due: ''
  };
  const validRisk = src => {
    const r = strings({
      ...riskBase
    }, src);
    for (const k of ['initialL', 'initialS', 'residualL', 'residualS'])
      if (r[k] && !/^[1-5]$/.test(r[k])) throw Error('Invalid risk score');
    return r
  };
  clean.risks = {};
  for (const [id, src] of Object.entries(data.risks)) {
    if (!/^[a-zA-Z0-9.-]+$/.test(id) || ['__proto__', 'constructor', 'prototype'].includes(id))
      throw Error('Invalid risk identifier');
    const r = validRisk(src);
    clean.risks[id.replace(/(\d)\.(\d)/g, '$1-$2')] = Object.fromEntries(Object.entries(r).filter(([
      key
    ]) => Object.hasOwn(src, key)))
  }
  clean.customRisks = data.customRisks.map(src => {
    if (!object(src) || typeof src.id !== 'string' || !/^custom-[a-zA-Z0-9-]+$/.test(src.id) ||
      ids.has(src.id)) throw Error('Invalid custom risk');
    ids.add(src.id);
    return {
      id: src.id,
      ...validRisk(src)
    }
  });
  return clean;
}
let state = blank(),
  storageOK = true,
  startupMessage = '',
  toastTimer;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = normaliseProject(JSON.parse(raw))
} catch (e) {
  storageOK = false;
  startupMessage =
    'Saved data could not be loaded. It has been left untouched. Import a saved project, or export this new assessment before closing.'
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    $('#saveState').textContent = 'Saved in this browser';
    storageOK = true
  } catch (e) {
    storageOK = false;
    $('#saveState').textContent = 'Not saved — export project'
  }
  $('#projectLabel').textContent = state.project.name || 'New lighting project'
}

function toast(t) {
  clearTimeout(toastTimer);
  $('#toast').className = 'toast';
  $('#toast').textContent = t;
  toastTimer = setTimeout(() => {
    $('#toast').className = '';
    $('#toast').textContent = ''
  }, 5000)
}

function val(path) {
  return path.split('.').reduce((o, k) => o?.[k], state) ?? ''
}

function put(path, v) {
  let keys = path.split('.'),
    obj = state;
  keys.slice(0, -1).forEach(k => obj = obj[k]);
  obj[keys.at(-1)] = v;
  save()
}

function field(path, label, hint = '', options = null, full = false, type = 'text') {
  let v = val(path);
  return `<div class="field ${full?'full':''}"><label for="${esc(path)}">${label}</label>${options?`<select id="${esc(path)}" data-path="${esc(path)}" ${hint?`aria-describedby="${esc(path)}-hint"`:""}><option value="">Select / not yet known</option>${options.map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:type==='textarea'?`<textarea id="${esc(path)}" data-path="${esc(path)}" ${hint?`aria-describedby="${esc(path)}-hint"`:""}>${esc(v)}</textarea>`:`<input id="${esc(path)}" data-path="${esc(path)}" ${hint?`aria-describedby="${esc(path)}-hint"`:""} type="${type}" value="${esc(v)}">`}${hint?`<div class="hint" id="${esc(path)}-hint">${hint}</div>`:''}</div>`
}
const yes = ['Yes', 'No', 'Unknown'];
const volumes = ['Low', 'Moderate', 'High', 'Unknown'];
const zones = [
  ['E0', 'Protected darkness', 'Designated dark-sky locations needing the strongest protection.'],
  ['E1', 'Natural / dark',
    'Very dark natural or rural surroundings with little existing artificial light.'
  ],
  ['E2', 'Low district brightness',
    'Relatively dark villages, rural settlements or outer suburban settings.'
  ],
  ['E3', 'Medium district brightness',
    'Established suburban and urban neighbourhoods with moderate night-time lighting.'
  ],
  ['E4', 'High district brightness',
    'Busy town or city centres with substantial night-time activity and lighting.'
  ]
];

function zoneGuide() {
  return `<details><summary>Environmental zones E0–E4: what do they mean?</summary><p>These describe the surrounding lighting environment for obtrusive-light assessment. They are <strong>not P lighting classes</strong>, and E1–E4 are used in the initial subsidiary-road P-class selection. E0 needs a separate assessment. Confirm the zone with the planning authority and consider sensitive neighbouring areas.</p><table class="zone"><thead><tr><th>Zone</th><th>Setting</th><th>Plain-language guide</th></tr></thead><tbody>${zones.map(z=>`<tr><td>${z[0]}</td><td>${z[1]}</td><td>${z[2]}</td></tr>`).join('')}</tbody></table><p>Introductory descriptions informed by ILP GN01/21. The current ILP listing is GN01/26; verify that edition and agreed local requirements before specifying limits. Zone designation and ecological sensitivity need separate consideration.</p><a href="https://theilp.org.uk/resources.html" target="_blank" rel="noopener">ILP guidance library ↗</a></details>`
}

function heading(k, title, desc, actions = '') {
  return `<div class="heading"><div><div class="eyebrow muted">${k}</div><h1>${title}</h1><p class="muted">${desc}</p></div><div class="actions">${actions}</div></div>`
}

function card(title, subtitle, body) {
  return `<section class="card"><div class="cardhead"><div><h2>${title}</h2>${subtitle?`<p class="muted small">${subtitle}</p>`:''}</div></div>${body}</section>`
}

function side(title, body) {
  return `<section class="card rightcard"><div class="eyebrow muted">Field notes</div><h2 style="margin-top:10px">${title}</h2>${body}</section>`
}

function foot() {
  return `<div class="footerbar"><button onclick="go(${Math.max(0,page-1)})">← Previous</button><button class="primary" onclick="go(${Math.min(6,page+1)})">${page===5?'Review outputs':'Continue'} →</button></div>`
}

function areaTabs() {
  return `<div class="area-tabs">${state.areas.map((a,i)=>`<button class="${i===areaIndex?'selected':''}" data-area-index="${i}" onclick="setArea(${i})">${esc(a.name)} ${i+1}</button>`).join('')}<button onclick="addArea()">+ Add area</button></div>`
}

function setArea(i) {
  if (!Number.isInteger(i) || i < 0 || i >= state.areas.length) return;
  areaIndex = i;
  render()
}

function addArea() {
  state.areas.push(freshArea());
  areaIndex = state.areas.length - 1;
  save();
  render()
}

function removeArea() {
  if (state.areas.length === 1) return;
  if (confirm('Remove this assessment area? Its risk notes will no longer appear in the report.')) {
    state.areas.splice(areaIndex, 1);
    areaIndex = 0;
    save();
    render()
  }
}

function route(a) {
  if (['Motorway', 'Dual carriageway', 'Main traffic route'].includes(a.type)) return 'M';
  if (['Junction / roundabout / conflict area'].includes(a.type)) return 'C';
  if (['Residential / subsidiary road', 'Footpath', 'Cycle route / shared path', 'Pedestrian area']
    .includes(a.type)) return 'P';
  return 'Review'
}

function missing() {
  let m = [];
  if (!state.project.name) m.push('Project name');
  if (!state.project.need) m.push('Decision on the need for lighting');
  state.areas.forEach((a, i) => {
    let n = a.name || `Area ${i+1}`;
    ['type', 'speed', 'flow', 'trafficEvidence', 'zone', 'ecology', 'boundary', 'classChoice',
      'classReason', 'classSource'
    ].forEach(k => {
      if (!a[k] || a[k] === 'Unknown') m.push(n + ': ' + ({
        type: 'area type',
        speed: 'speed / applicability',
        flow: 'traffic activity',
        trafficEvidence: 'activity evidence',
        zone: 'environmental zone',
        ecology: 'ecology status',
        boundary: 'assessment boundary',
        classChoice: 'reviewed class',
        classReason: 'class justification',
        classSource: 'selection references'
      } [k]))
    })
  });
  state.areas.forEach(a => {
    const r = recommend(a);
    r.gaps.forEach(g => m.push(a.name + ': ' + g));
    if (!decision(a).className) m.push(a.name + ': ' + decision(a).status)
  });
  return [...new Set(m)]
}

function overview() {
  let m = missing();
  return heading('Lighting, with a clear rationale', 'From site questions to a considered design.',
      'One assessment. Three connected outputs.',
      `<button onclick="loadSample()">Load example project</button><button class="primary" onclick="go(1)">Start assessment →</button>`
    ) +
    `<section class="hero"><div class="herotext"><span class="badge green">UK HIGHWAY LIGHTING · WORKING PROTOTYPE</span><h2>Good lighting starts<br>with the right questions.</h2><p>Build a site-specific brief, explain your class selection and keep design risks in view.</p><button class="primary" onclick="go(2)">Explore the questionnaire →</button></div><div class="road" role="img" aria-label="Illustrative road corridor placeholder"><svg viewBox="0 0 500 270" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="glow" x2="0" y2="1"><stop stop-color="#d9dfaa" stop-opacity=".26"/><stop offset="1" stop-color="#d9dfaa" stop-opacity="0"/></linearGradient></defs><path d="M0 220L500 75 500 150 0 295Z" fill="#436065"/><path d="M-20 210L500 58M-20 298L500 147" stroke="#85978b" stroke-width="7"/><path d="M0 260L500 112" stroke="#c4cfb2" stroke-dasharray="27 25" stroke-width="3"/><g stroke="#a8c4b9" stroke-width="4" fill="none"><path d="M105 217V95q0-15 19-15h24"/><path d="M325 151V32q0-15 19-15h24"/></g><path d="M148 81L66 242 236 192Z" fill="url(#glow)"/><path d="M369 19L290 175 458 125Z" fill="url(#glow)"/><g fill="#507867"><circle cx="40" cy="156" r="23"/><circle cx="237" cy="70" r="30"/><circle cx="457" cy="223" r="32"/></g><g fill="#dcdfab"><rect x="132" y="78" width="21" height="6" rx="3"/><rect x="353" y="15" width="21" height="6" rx="3"/></g></svg><span class="caption">Scheme illustration · image placeholder</span></div></section><div class="stats"><div class="stat"><b>${state.areas.length.toString().padStart(2,'0')}</b><span>Assessment areas</span></div><div class="stat"><b>${riskItems().length.toString().padStart(2,'0')}</b><span>Risks for review</span></div><div class="stat"><b>${m.length.toString().padStart(2,'0')}</b><span>Information gaps</span></div></div><div class="grid">${card('Your design workflow','Work through the site, then review the outputs.',`<div class="steps">${[['Define the scheme','Set the scope, boundaries and adopting authority.'],['Understand the road and its users','Record speed, layout, activity and conflict features.'],['Set environmental and design requirements','Consider ecology, neighbouring properties and maintenance.'],['Review the brief and design risks','Record class justification and export a draft report.']].map((x,i)=>`<div class="step"><div class="num">${i+1}</div><div><strong>${x[0]}</strong><p>${x[1]}</p></div></div>`).join('')}</div>`)}${side('A reviewable first version',`<p class="small muted">This version calculates an initial M, C or P class for supported inputs, explains the result and displays performance requirements. It retains a separate designer decision.</p><div class="info notice">All reports are drafts. Review the recommendation, local risks and evidence, then confirm acceptance or a justified alternative.</div><button onclick="$('#fileInput').click()">Import saved project</button>`)}</div>`
}

function project() {
  return heading('01 / Project & scope', 'Define the scheme.',
      'Set the purpose and boundaries before choosing a lighting requirement.') +
    `<div class="grid"><div>${card('Project information','This information appears on your generated reports.',`<div class="fields">${field('project.name','Project name','Use a recognisable road or scheme name.')}${field('project.reference','Project reference','Your scheme, Section 38 / 278 or job reference.')}${field('project.location','Location','Town, road names and extent of the works.')}${field('project.authority','Adopting / approving authority','Select local requirements through the brief; no council policy is assumed.')}${field('project.designer','Assessment prepared by','Person responsible for completing this draft.')}${field('project.date','Assessment date','Date of this revision.',null,false,'date')}${field('project.revision','Revision','For example P01 — preliminary.')}${field('project.scope','Scheme type','Retaining fixed column positions can constrain the achievable layout.',['New lighting installation','LED lantern replacement','Column replacement','Road alteration / development','Active travel scheme','Mixed works'])}${field('project.adoption','Adoption / ownership','Record who will own and maintain the completed installation.',['Highways adoption','Private ownership','Mixed ownership','To be confirmed'])}${field('project.need','Need for lighting','Class selection follows the decision on whether lighting is justified. Record why below.',['Lighting justified — reason recorded','Existing lighting retained — review required','Need for lighting under assessment','Lighting not proposed — rationale required'])}${field('project.description','Purpose, scope and lighting rationale','Explain the problem, intended outcome, limits of work and any exclusions.',null,true,'textarea')}${field('project.drawings','Reference drawings and evidence','List drawing numbers, revisions, surveys and reports. References only; files are not uploaded.',null,true,'textarea')}</div>`)}${foot()}</div>${side('Define relevant areas',`<p class="small muted">A scheme may need separate assessments for its carriageway, junctions and adjoining pedestrian or cycle routes.</p><ul><li>Describe the exact boundary of each calculation area.</li><li>Record the basis for providing lighting.</li><li>Identify existing assets to retain.</li><li>Keep unknown information visible.</li></ul><div class="info">This workspace saves to this browser. Export the project JSON to keep a transferable copy.</div>`)}</div>`
}

function road() {
  let a = state.areas[areaIndex],
    p = `areas.${areaIndex}.`;
  return heading('02 / Road & users', 'Understand how the space is used.',
      'Assess each relevant area in its own right.',
      `<button class="danger" ${state.areas.length<2?'disabled':''} onclick="removeArea()">Remove area</button>`
    ) + areaTabs() +
    `<div class="grid"><div>${card('Area and road characteristics','Road designation is context; it does not select a lighting class on its own.',`<div class="fields">${field(p+'name','Area name','For example: main carriageway, junction or north footpath.')}${field(p+'type','Area type','A preliminary route into M, C or P assessment; confirm suitability.',['Motorway','Dual carriageway','Main traffic route','Residential / subsidiary road','Junction / roundabout / conflict area','Footpath','Cycle route / shared path','Pedestrian area','Town / city centre','Car park / other specialist area'])}${field(p+'boundary','Assessment boundary','Identify start / end points, widths, footways and neighbouring calculation areas.',null,true,'textarea')}${field(p+'roadClass','Road designation','A/B/C classification does not automatically determine the lighting class.',['Motorway','A road','B road','C road','Unclassified road','Not applicable','Unknown'])}${field(p+'speed','Posted speed limit','Record the legal limit, and available operating-speed evidence separately.',['20 mph','30 mph','40 mph','50 mph','60 mph','70 mph','Not applicable','Unknown'])}${field(p+'operatingSpeed','Operating-speed evidence','Record measured speed, survey date and source, or state unavailable.')}${field(p+'layout','Carriageway arrangement','A single carriageway may have multiple lanes.',['Single carriageway — two-way','Dual carriageway','One-way carriageway','Single-track road / passing places','Shared surface','No carriageway','Other / review required'])}${field(p+'lanes','Lane arrangement','Number of lanes each way, median, turning lanes and widths.')}${field(p+'complexity','Navigation and visual complexity','Describe signs, bends, accesses and unusual or competing demands.',null,true,'textarea')}</div>`)}${card('Traffic, pedestrians and conflict features','Qualitative answers support the brief. They are not a substitute for the verified numerical selection inputs.',`<div class="fields">${field(p+'flow','Motor traffic activity during darkness','Record the relevant time periods; daylight flow alone may not describe night use.',[...volumes,'Not applicable'])}${field(p+'pedestrians','Pedestrian activity','Include waiting passengers, nearby schools, shops and evening uses.',volumes)}${field(p+'cyclists','Cycle activity','Consider on-road cyclists and separate or shared routes.',volumes)}${field(p+'slow','Slow-moving / heavy vehicles','For example agricultural vehicles, buses, HGVs; record details in evidence.',yes)}${field(p+'parking','Parked vehicles','Consider obscured pedestrians, door opening and access constraints.',yes)}${field(p+'bus','Bus stops','Identify waiting areas, boarding activity and how passengers cross the road.',yes)}${field(p+'junction','Junctions / roundabouts / significant accesses','A positive answer triggers a conflict-area review, not an automatic class increase.',yes)}${field(p+'crossing','Crossing provision','Crossings require the relevant specific guidance and an assessment of approaches.',['None identified','Zebra','Puffin / signal-controlled','Toucan / parallel crossing','Uncontrolled / refuge','Multiple crossing types','Unknown'])}${field(p+'trafficEvidence','Evidence and time periods','Counts, capacity basis where relevant, surveys, parking / bus-stop details and assumptions.',null,true,'textarea')}</div>`)}${card('Class-selection inputs','Complete the relevant inputs to calculate an initial recommendation.',selectionInputs(a))}${card('Local risk review','Record evidence and judgement separately from the initial table selection.',localReviewInputs())}${card('Recommendation and designer decision','Recalculates as you enter parameters.',`<div id="live-recommendation" aria-live="polite">${recommendationHTML(a)}</div>${decisionInputs()}`)}${foot()}</div>${side('Three assessment families',`<div class="family" style="grid-template-columns:1fr"><div><b>M</b><strong>Motor traffic</strong><p>Typically assessed using road-surface luminance and associated quality criteria.</p></div><div><b>C</b><strong>Conflict areas</strong><p>Illuminance-based assessment for relevant areas with intersecting movements.</p></div><div><b>P</b><strong>Subsidiary & pedestrian areas</strong><p>Illuminance requirements with supplementary visibility criteria where applicable.</p></div></div><div class="info notice">Car parks and other specialist spaces need the applicable guidance and scope checked separately.</div>`)}</div>`
}

function environment() {
  let p = `areas.${areaIndex}.`;
  return heading('03 / Environment', 'Respect the surroundings.',
      'Record environmental context separately from the road’s lighting class.') + areaTabs() +
    `<div class="grid"><div>${card('Brightness and environmental zone','Local designation, receptor sensitivity and actual surroundings all matter.',`<div class="fields">${field(p+'brightness','Surrounding brightness','This is an assessment input. Do not treat it as automatically identical to the environmental zone.',['Dark','Low','Moderate','High','Unknown'])}${field(p+'zone','Environmental zone','Use the guide below, then confirm the designation and justification.',['E0','E1','E2','E3','E4','Unknown'])}${field(p+'zoneBasis','Zone rationale / authority agreement','Record the planning authority designation or proposed basis; identify any more sensitive adjoining areas.',null,true,'textarea')}</div>${zoneGuide()}`)}${card('Ecology and sensitive receptors','The presence of habitat triggers investigation; it does not automatically set a CCT or reduce the road class.',`<div class="fields">${field(p+'ecology','Ecological assessment status','Unknown does not mean no ecological constraint.',['Not assessed','Advice / survey required','Report available — constraints identified','Report available — no relevant constraints identified'])}${field(p+'habitats','Habitats and ecological features','Woodland, hedgerows, roosts, watercourses, dark corridors and designated sites.',null,true,'textarea')}${field(p+'receptors','Sensitive neighbouring receptors','Homes / windows, wildlife corridors, dark-sky areas, railways, waterways or other affected locations.',null,true,'textarea')}${field(p+'ecologyRequirements','Ecologist’s requirements and mitigation','Report reference; agreed limits and assessment planes; spectrum / CCT, shielding, hours and monitoring. Mark proposals awaiting agreement.',null,true,'textarea')}</div>`)}${foot()}</div>${side('Ask the follow-up question',`<ul><li>Where must darkness be retained?</li><li>Which surfaces or boundaries need calculation?</li><li>Are colour temperature and spectrum requirements agreed?</li><li>Will shields change the road-lighting performance?</li><li>What happens during dimmed operation?</li></ul><div class="info">Environmental zones describe context. Ecological limits and mitigation remain site-specific.</div>`)}</div>`
}
const deliveries = ['Lighting-class selection and rationale', 'Lighting layout and asset schedule',
  'Photometric calculations and calculation grids', 'Obtrusive-light / ecology calculations',
  'Lantern photometry, settings and shielding', 'Cable calculations and circuit schedules',
  'Electrical schematics and feeder-pillar details', 'Supply, earthing and protection design',
  'Column / foundation and structural information', 'Ducting, chambers and service coordination',
  'CMS and dimming / operating schedule', 'Design risk assessment and residual-risk information',
  'Inspection, testing and commissioning requirements',
  'As-built drawings and adoption information'
];

function design() {
  let p = 'design.';
  return heading('04 / Design brief', 'Turn the assessment into instructions.',
      'Define the practical requirements the designer must address.') +
    `<div class="grid"><div>${card('Equipment and positioning','Enter project requirements rather than assumed council defaults.',`<div class="fields">${field(p+'columns','Column strategy','Fixed positions, new columns, relocations, outreach and heritage requirements.',['New columns','Retain existing positions','Mixed retained and new','To be determined'])}${field(p+'height','Mounting heights and brackets','State proposed heights / outreach or ask the designer to assess.')}${field(p+'setback','Setbacks, access and clearances','Record authority requirements and check doors, gates, paths, vehicle envelopes and hinges.')}${field(p+'lantern','Luminaire / optic requirements','Approved products or performance-led requirements; photometry and shielding.')}${field(p+'cct','CCT / spectral requirements','Record the requirement and its basis; ecology advice may need further spectral information.')}${field(p+'cms','CMS / switching requirements','Node / control compatibility, inventory and commissioning.')}${field(p+'structural','Retained assets / structural checks','Condition, loading, wind exposure, bracket suitability and foundation assumptions.',null,true,'textarea')}</div>`)}${card('Power, civil works and maintenance','Capture coordination requirements before the design is completed.',`<div class="fields">${field(p+'power','Supply strategy','DNO services, private distribution, existing circuits and ownership.',['Individual DNO connections','Feeder-pillar distribution','Existing circuits retained','Mixed supply arrangements','To be determined'])}${field(p+'earthing','Earthing and protective arrangements','Confirm through survey and electrical design; do not infer from supply description.')}${field(p+'ducts','Ducting and chambers','Sizes, routes, colour / construction, turns and inspection access.')}${field(p+'services','Underground / overhead services','Record survey status, diversions, clearances and unknown routes.')}${field(p+'suds','SuDS / landscape interfaces','Rain gardens, permeable surfaces, drainage, tree roots and foundation clashes.')}${field(p+'maintenance','Maintenance access','Vehicle access, traffic management, lowering gear, safe working area and hinge clearance.',null,true,'textarea')}</div>`)}${card('Operation and submissions','Assess every proposed operating state against its agreed requirements.',`<div class="fields">${field(p+'hours','Lighting hours','Dusk-to-dawn, part-night or site-specific hours; record rationale.')}${field(p+'dimming','Dimming and activity changes','Record periods, evidence, target requirements and transitions. No automatic percentage is assumed.',null,false,'textarea')}${field(p+'extra','Additional brief requirements','Planning conditions, conservation requirements, interfaces and unresolved decisions.',null,true,'textarea')}</div><h3 style="margin-top:22px">Required deliverables</h3><div class="checklist">${deliveries.map((d,i)=>`<label><input type="checkbox" data-delivery="${i}" ${state.design.deliverables.includes(d)?'checked':''}>${d}</label>`).join('')}</div>`)}${foot()}</div>${side('A complete submission',`<p class="small muted">The design brief should make clear what is to be calculated, drawn, specified and evidenced.</p><ul><li>Retained positions still need photometric verification.</li><li>New lanterns can change structural loading.</li><li>Shielding and dimming need their own performance checks.</li><li>Electrical design needs confirmed site information.</li></ul><div class="info">Select only the deliverables relevant to this scheme. An unchecked item is not an instruction to omit a necessary assessment.</div>`)}</div>`
}

function riskItems() {
  const items = baseRiskItems();
  for (const a of state.areas) {
    for (const [key, title, hazard, controls] of [
        ['crime', 'Crime and recognition',
          'Users may be difficult to recognise or natural surveillance may be limited.',
          'Assess local evidence, coverage, recognition and supplementary criteria.'
        ],
        ['collisions', 'Darkness-related collisions',
          'Road users may not detect movements or features associated with recorded collisions.',
          'Review collision patterns with road-safety colleagues and record a proportionate response.'
        ],
        ['vandalism', 'Vandalism and asset damage',
          'Deliberate damage may impair lighting or expose people to damaged equipment.',
          'Review equipment robustness, location, inspection and safe access.'
        ]
      ])
      if (a[key] === 'Yes') {
        const id = a.id + '-local-' + key;
        items.push({
          id,
          title: a.name + ' · ' + title,
          hazard,
          people: 'Road users, public and maintenance staff',
          controls,
          stage: 'Operation / maintenance',
          owner: '',
          status: 'Open — assess',
          initialL: '',
          initialS: '',
          residualL: '',
          residualS: '',
          evidence: a.localEvidence || '',
          due: '',
          ...(state.risks[id] || {})
        });
      }
  }
  return items;
}

function baseRiskItems() {
  let out = [];
  const add = (id, title, hazard, people, controls, stage) => out.push({
    id,
    title,
    hazard,
    people,
    controls,
    stage,
    owner: '',
    status: 'Open — assess',
    initialL: '',
    initialS: '',
    residualL: '',
    residualS: '',
    evidence: '',
    due: ''
  });
  state.areas.forEach((a, i) => {
    let id = a.id,
      n = a.name || `Area ${i+1}`;
    const r = (key, title, h, p, c, s) => add(id + '-' + key, n + ' · ' + title, h, p, c, s);
    if (a.bus === 'Yes' || a.bus === 'Unknown') r('bus', 'Bus-stop movements',
      'Waiting / boarding passengers and pedestrian movements may be poorly visible or obstructed.',
      'Passengers, pedestrians, drivers and cyclists',
      'Review stop locations, waiting areas, crossing desire lines and column clearances. Record the design response.',
      'Operation');
    if (a.parking === 'Yes' || a.parking === 'Unknown') r('parking', 'Parked vehicles',
      'Parked vehicles may obscure pedestrians, create door-opening conflicts or obstruct maintenance access.',
      'Pedestrians, cyclists, drivers and maintenance staff',
      'Assess parking patterns, visibility, coverage and access. Coordinate column positions and record limitations.',
      'Operation / maintenance');
    if (['40 mph', '50 mph', '60 mph', '70 mph'].includes(a.speed)) r('collision',
      'Roadside collision exposure',
      'Roadside equipment may be struck; installation and maintenance expose personnel to moving traffic.',
      'Vehicle occupants, operatives and other road users',
      'Review siting and roadside context; determine whether passive-safety assessment is required; coordinate safe access.',
      'Construction / operation / maintenance');
    if (a.junction === 'Yes' || (a.crossing && a.crossing !== 'None identified')) r('conflict',
      'Crossing and conflict visibility',
      'Conflicting movements or transitions between lit areas may impair detection of road users.',
      'Pedestrians, cyclists and drivers',
      'Define relevant conflict and approach areas; apply crossing-specific guidance where needed; verify visibility, glare and transitions.',
      'Operation');
    if (a.slow === 'Yes') r('slow', 'Mixed vehicle speeds',
      'Speed differences, turning heavy vehicles and overtaking may increase visual demands.',
      'Drivers, cyclists and pedestrians',
      'Record vehicle mix and movements; assess layout, visibility and relevant lighting requirements.',
      'Operation');
    if (a.ecology && a.ecology !== 'Report available — no relevant constraints identified' || a
      .habitats || ['E0', 'E1'].includes(a.zone)) r('ecology', 'Ecological effects',
      'Artificial light may affect sensitive habitat, roosts or dark movement corridors.',
      'Wildlife and habitat receptors',
      'Obtain relevant ecological advice, retain darkness where required, agree limits and verify the mitigated design.',
      'Construction / operation');
    if (a.receptors) r('spill', 'Obtrusive light',
      'Light spill, glare or skyglow may affect identified neighbouring receptors.',
      'Residents and other affected users / receptors',
      'Agree environmental zone and assessment criteria, model affected receptors and verify shielding and operating states.',
      'Operation');
  });
  add('base-services', 'Service coordination',
    'Excavation or column siting may conflict with buried or overhead services.',
    'Construction / maintenance workers and public',
    'Obtain service information and surveys; coordinate routes, foundations and clearances. Record unresolved interfaces.',
    'Construction / removal');
  add('base-electrical', 'Electrical safety and isolation',
    'Unconfirmed supply, condition, earthing, isolation or protection may expose people to electric shock.',
    'Installers, maintainers and public',
    'Confirm supply and ownership; survey retained systems; obtain competent electrical design, verification and isolation information.',
    'Construction / operation / maintenance / removal');
  add('base-maint', 'Safe maintenance access',
    'Access to equipment may require working at height, traffic exposure or obstructed lowering operations.',
    'Maintainers and public',
    'Design out avoidable access risks; identify working space, access method and traffic interfaces; document residual constraints.',
    'Maintenance / removal');
  if (state.design.columns && state.design.columns !== 'New columns') add('base-structure',
    'Retained column suitability',
    'Retained columns, brackets or foundations may be unsuitable for replacement equipment or current condition.',
    'Public, installers and maintenance workers',
    'Establish condition and structural suitability for proposed loading and exposure; identify further checks and replacement needs.',
    'Construction / operation');
  if (state.design.suds) add('base-suds', 'SuDS and landscape coordination',
    'Foundations or routes may clash with drainage, permeable construction, roots or maintenance zones.',
    'Installers, landscape / drainage maintainers and public',
    'Coordinate approved layouts and levels; agree positions, foundations and access with civil and landscape designers.',
    'Construction / maintenance');
  return out.map(r => ({
    ...r,
    ...(state.risks[r.id] || {})
  })).concat(state.customRisks)
}

function riskUpdate(id, key, value) {
  let c = state.customRisks.find(x => x.id === id);
  if (c) c[key] = value;
  else {
    state.risks[id] ??= {};
    state.risks[id][key] = value
  }
  save()
}

function score(l, s) {
  if (!/^[1-5]$/.test(String(l)) || !/^[1-5]$/.test(String(s))) return 'Not assessed';
  let n = Number(l) * Number(s);
  return n + ' / 25 · ' + (n >= 15 ? 'High' : n >= 6 ? 'Medium' : 'Low')
}

function riskField(r, k, label, type = 'text', options = null) {
  let id = 'risk-' + r.id + '-' + k;
  return `<div class="field"><label for="${esc(id)}">${label}</label>${options?`<select id="${esc(id)}" data-risk="${esc(r.id)}" data-key="${k}"><option value="">Not assessed</option>${options.map(x=>`<option ${r[k]===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`:type==='textarea'?`<textarea id="${esc(id)}" data-risk="${esc(r.id)}" data-key="${k}">${esc(r[k])}</textarea>`:`<input id="${esc(id)}" type="${type}" value="${esc(r[k])}" data-risk="${esc(r.id)}" data-key="${k}">`}</div>`
}

function addRisk() {
  state.customRisks.push({
    id: 'custom-' + newId(),
    title: 'Additional design risk',
    hazard: '',
    people: '',
    controls: '',
    stage: '',
    owner: '',
    status: 'Open — assess',
    initialL: '',
    initialS: '',
    residualL: '',
    residualS: '',
    evidence: '',
    due: ''
  });
  save();
  render()
}

function deleteRisk(id) {
  state.customRisks = state.customRisks.filter(r => r.id !== id);
  save();
  render()
}

function risks() {
  let items = riskItems();
  return heading('05 / Design risks', 'Make the design decisions visible.',
      'Suggested entries respond to your answers. Review them and add site-specific hazards.',
      `<button class="primary" onclick="addRisk()">+ Add risk</button>`) +
    `<div class="info notice">Suggested controls are proposals. They do not confirm implementation or reduce a risk score automatically. Entries remain draft until reviewed; changed answers can remove a triggered entry from the active report.</div><details><summary>How to use the prototype risk matrix</summary><p>Use your organisation’s agreed method for live work. For this prototype only: likelihood 1 rare, 2 unlikely, 3 possible, 4 likely, 5 almost certain; severity 1 minor, 2 moderate, 3 serious, 4 major, 5 catastrophic. Score = likelihood × severity. Bands: 1–5 low, 6–14 medium, 15–25 high. These bands do not determine whether a risk is acceptable.</p><p>Assess the initial risk, record elimination / reduction through design, then assess the residual risk with evidence. Leave unassessed values blank. Record significant residual information for the relevant project parties. This is a design risk register, not a contractor’s construction method statement.</p></details><p class="small muted">${items.length} active entries · Construction, operation, maintenance and removal</p>${items.map((r,i)=>`<section class="risk"><div class="riskhead"><div><span class="eyebrow muted">DR-${String(i+1).padStart(3,'0')}</span><h2 style="margin-top:5px">${esc(r.title)}</h2><span class="pill">${esc(r.stage||'Lifecycle stage to confirm')}</span></div><div><span class="badge amber">${esc(r.status)}</span>${r.id.startsWith('custom-')?` <button class="danger" onclick="deleteRisk('${esc(r.id)}')">Remove</button>`:''}</div></div><div class="fields">${riskField(r,'title','Risk title')}${riskField(r,'stage','Lifecycle stage')}${riskField(r,'hazard','Hazard and potential consequence','textarea')}${riskField(r,'people','Who / what may be affected','textarea')}${riskField(r,'controls','Design measures / proposed controls','textarea')}${riskField(r,'evidence','Evidence, residual risk and information to communicate','textarea')}${riskField(r,'owner','Action owner')}${riskField(r,'due','Target review date','date')}${riskField(r,'status','Review status','text',['Open — assess','Action required','Controls proposed','Controls evidenced — review residual risk','Reviewed — residual risk recorded','Not applicable — reason in evidence'])}${riskField(r,'initialL','Initial likelihood (1–5)','text',['1','2','3','4','5'])}${riskField(r,'initialS','Initial severity (1–5)','text',['1','2','3','4','5'])}${riskField(r,'residualL','Residual likelihood (1–5)','text',['1','2','3','4','5'])}${riskField(r,'residualS','Residual severity (1–5)','text',['1','2','3','4','5'])}</div><div class="info small" id="score-${esc(r.id)}">Initial: <strong>${score(r.initialL,r.initialS)}</strong> · Residual: <strong>${score(r.residualL,r.residualS)}</strong></div></section>`).join('')}${foot()}`
}

function rows(obj, labels) {
  return Object.entries(labels).map(([k, l]) =>
    `<tr><td style="width:30%"><strong>${l}</strong></td><td>${esc(obj[k]||'Not recorded').replace(/\n/g,'<br>')}</td></tr>`
  ).join('')
}

function reportBody() {
  let m = missing(),
    rs = riskItems();
  return `<article class="report" id="report"><div class="reporttop"><div><div class="eyebrow">Lumen / Lighting design workspace</div><h1>${esc(state.project.name||'Untitled lighting project')}</h1><p>${esc(state.project.reference||'Reference not recorded')} · ${esc(state.project.revision)} · ${esc(state.project.date)}</p></div><div><span class="badge amber">DRAFT · DESIGNER REVIEW REQUIRED</span></div></div><div class="info notice">Draft assessment using the implemented UK class-selection rules. Initial recommendations and designer decisions are recorded separately below. Unconfirmed or stale decisions are not final selections. Specialist guidance gaps and local requirements remain subject to review; this report does not certify design compliance or approval.</div><h2>1. Project and scope</h2><table><tbody>${rows(state.project,{location:'Location',authority:'Approving / adopting authority',designer:'Prepared by',scope:'Scheme type',adoption:'Ownership / adoption',need:'Lighting decision',description:'Purpose and rationale',drawings:'Evidence / drawings'})}</tbody></table>${recommendationsReport()}<h2>Recorded site parameters</h2>${state.areas.map((a,i)=>`<h3>${i+1}. ${esc(a.name)}</h3><table><tbody>${rows(a,{boundary:'Assessment boundary',type:'Area type',roadClass:'Road designation',speed:'Speed limit',operatingSpeed:'Operating-speed evidence',layout:'Road arrangement',lanes:'Lane details',flow:'Motor traffic',pedestrians:'Pedestrian activity',cyclists:'Cycle activity',slow:'Slow / heavy vehicles',parking:'Parked vehicles',bus:'Bus stops',junction:'Junctions / accesses',crossing:'Crossings',complexity:'Visual / navigation complexity',trafficEvidence:'Activity evidence'})}<tr><td><strong>Suggested family route</strong></td><td>${route(a)} — preliminary area-type routing only</td></tr>${rows(a,{classChoice:'Designer-entered class — see decision status above',classReason:'Selection reasoning / performance requirements',classSource:'Selection references'})}</tbody></table><h3>Environmental context</h3><table><tbody>${rows(a,{brightness:'Surrounding brightness',zone:'Environmental zone',zoneBasis:'Zone rationale',ecology:'Ecology assessment status',habitats:'Habitats',receptors:'Sensitive receptors',ecologyRequirements:'Ecological requirements / mitigation'})}</tbody></table>`).join('')}<h2>3. Lighting design brief</h2><table><tbody>${rows(state.design,{columns:'Column strategy',height:'Mounting heights',setback:'Setbacks and clearance',lantern:'Luminaire / optics',cct:'CCT / spectrum',cms:'CMS / switching',structural:'Structural checks',power:'Supply strategy',earthing:'Earthing / protection',ducts:'Ducting / chambers',services:'Service coordination',suds:'SuDS / landscaping',maintenance:'Maintenance access',hours:'Lighting hours',dimming:'Dimming / operating profile',extra:'Additional requirements'})}</tbody></table><h3>Required submissions</h3>${state.design.deliverables.length?`<ul>${state.design.deliverables.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`:'<p>No deliverables selected — review required.</p>'}<h2>4. Design risk assessment</h2><p>Draft register. Illustrative 5 × 5 method: 1–5 low, 6–14 medium, 15–25 high. Confirm the project’s risk method. Proposed measures are not evidence of implementation.</p>${rs.map((r,i)=>`<h3>DR-${String(i+1).padStart(3,'0')} · ${esc(r.title)}</h3><table><tbody>${rows(r,{stage:'Lifecycle stage',hazard:'Hazard / consequence',people:'Affected parties',controls:'Design measures',evidence:'Evidence / residual information',owner:'Action owner',due:'Review date',status:'Review status'})}<tr><td><strong>Initial risk</strong></td><td>${score(r.initialL,r.initialS)}</td></tr><tr><td><strong>Residual risk</strong></td><td>${score(r.residualL,r.residualS)}</td></tr></tbody></table>`).join('')}<h2>5. Outstanding information and review</h2>${m.length?`<ul>${m.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Key fields populated. Content and evidence still require designer review.</p>'}<p>All class selections, numerical targets, environmental requirements, risk entries and project-specific references require checking before issue. No approval or reviewer sign-off is implied.</p><h2>6. Reference framework</h2>${references()}<p class="small muted">Generated ${esc(new Date().toLocaleString('en-GB'))} · Lumen prototype v0.2 · Project data is user-entered and saved in the browser.</p></article>`
}

function references() {
  return `<div class="ref"><a href="https://knowledge.bsigroup.com/products/design-of-road-lighting-lighting-of-roads-and-public-amenity-areas-code-of-practice" target="_blank" rel="noopener">BS 5489-1:2020</a> — UK road and public amenity lighting guidance. Initial selection uses Annex A Tables A.2–A.6; verify applicability, local requirements and risk adjustments. Public research source: <a href="https://www.lincolnshire.gov.uk/downloads/file/10050/british-standards-bs-5489-1-2020-design-of-road-lighting" target="_blank" rel="noopener">BS 5489-1 research copy</a>.</div><div class="ref"><a href="https://knowledge.bsigroup.com/products/road-lighting-guidelines-on-selection-of-lighting-classes" target="_blank" rel="noopener">PD CEN/TR 13201-1:2014</a> — class-selection guidance.</div><div class="ref"><a href="https://knowledge.bsigroup.com/products/road-lighting-performance-requirements-1" target="_blank" rel="noopener">BS EN 13201-2:2015</a> — Performance summaries are provided for the selected M/C/P class, with scope notes; calculation compliance remains to be demonstrated.</div><div class="ref"><a href="https://theilp.org.uk/resources.html" target="_blank" rel="noopener">ILP guidance library</a> — current listing includes GN01/26 and PLG02 (2026). Environmental-zone hints here are an introductory paraphrase informed by GN01/21, not a numerical limits table.</div>`
}

function review() {
  return heading('06 / Review & reports', 'Your decisions, brought together.',
      'A printable draft assessment, brief and risk register.',
      `<button onclick="downloadReport()">Download report HTML</button><button class="primary" onclick="window.print()">Print / save PDF</button>`
    ) +
    `<div class="info no-print">Use your browser’s print dialog to save a PDF. Project JSON preserves editable answers and risk notes; report HTML is a standalone snapshot.</div><section class="card">${reportBody()}</section><div class="actions no-print"><button onclick="exportJSON()">Export editable project</button><button onclick="$('#fileInput').click()">Import project</button><button class="danger" onclick="resetProject()">Start new project</button></div>`
}

function render() {
  document.querySelector('#nav').innerHTML = pages.map((p, i) =>
    `<button class="${page===i?'active':''}" onclick="go(${i})" ${page===i?'aria-current="step"':''}><span>${i===0?'◈':String(i).padStart(2,'0')}</span>${p}</button>`
  ).join('');
  $('#app').innerHTML = [overview, project, road, environment, design, risks, review][page]();
  $('#projectLabel').textContent = state.project.name || 'New lighting project'
}

function go(i) {
  if (!Number.isInteger(i) || i < 0 || i >= pages.length) return;
  page = i;
  render();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function handleValue(t) {
  if (t.dataset.path) {
    /* refresh after saving the changed input below */
  }
  if (t.dataset.path) {
    put(t.dataset.path, t.value);
    refreshRecommendations();
  }
  if (t.dataset.risk) {
    riskUpdate(t.dataset.risk, t.dataset.key, t.value);
    const r = riskItems().find(x => x.id === t.dataset.risk);
    if (!r) return;
    const box = document.getElementById('score-' + r.id);
    if (box) box.innerHTML =
      `Initial: <strong>${score(r.initialL,r.initialS)}</strong> · Residual: <strong>${score(r.residualL,r.residualS)}</strong>`
  }
}
document.addEventListener('input', e => handleValue(e.target));
document.addEventListener('change', e => {
  const t = e.target;
  handleValue(t);
  if (t.dataset.delivery !== undefined) {
    const d = deliveries[Number(t.dataset.delivery)];
    if (d) {
      state.design.deliverables = t.checked ? [...new Set([...state.design.deliverables, d])] :
        state.design.deliverables.filter(x => x !== d);
      save()
    }
  }
  if (t.dataset.path && /\.(type|flowBasis)$/.test(t.dataset.path)) render();
  if (t.dataset.risk && t.dataset.key === 'status') render();
  if (t.dataset.path && /\.name$/.test(t.dataset.path)) document.querySelectorAll(
    '[data-area-index]').forEach(b => {
    const i = Number(b.dataset.areaIndex);
    b.textContent = (state.areas[i].name || 'Assessment area') + ' ' + (i + 1)
  })
});

function download(name, content, type) {
  let u = URL.createObjectURL(new Blob([content], {
      type
    })),
    a = document.createElement('a');
  a.href = u;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 30000)
}

function exportJSON() {
  download('lumen-project.json', JSON.stringify(state, null, 2), 'application/json');
  toast('Editable project exported')
}

function downloadReport() {
  let css = getReportStyles();
  download('lumen-design-report.html',
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draft lighting design report</title><style>' +
    css +
    'body{padding:30px;max-width:1100px;margin:auto;background:white}</style></head><body>' +
    reportBody() + '</body></html>', 'text/html');
  toast('Draft report downloaded')
}

function resetProject() {
  if (!confirm('Start a new project? Export your current answers first if you want to keep them.'))
    return;
  state = blank();
  areaIndex = 0;
  save();
  go(1)
}

function loadSample() {
  if (!confirm(
      'Load a fictional example? This replaces your current project. Export it first if needed.'))
    return;
  state = blank();
  Object.assign(state.project, {
    name: 'Meadow Lane · active travel link',
    reference: 'DEMO-001',
    location: 'Fictional UK scheme — for demonstration',
    authority: 'Local highway authority — confirm',
    designer: 'Example assessment',
    description: 'Illustrative residential road and adjoining shared path. Improve lighting while retaining a dark hedge corridor.',
    scope: 'Active travel scheme',
    need: 'Lighting justified — reason recorded',
    adoption: 'Highways adoption'
  });
  Object.assign(state.areas[0], {
    name: 'Residential carriageway',
    type: 'Residential / subsidiary road',
    roadClass: 'Unclassified road',
    speed: '20 mph',
    layout: 'Single carriageway — two-way',
    lanes: 'One lane each way; dimensions to be surveyed',
    boundary: 'From junction A to junction B, including associated footways — drawing required',
    flow: 'Low',
    pedestrians: 'Moderate',
    cyclists: 'Moderate',
    slow: 'Yes',
    parking: 'Yes',
    bus: 'Yes',
    junction: 'Yes',
    crossing: 'Uncontrolled / refuge',
    zone: 'E3',
    brightness: 'Moderate',
    zoneBasis: 'Proposed suburban context; planning agreement outstanding',
    ecology: 'Advice / survey required',
    habitats: 'Hedgerow along northern boundary',
    receptors: 'Homes fronting the road',
    trafficEvidence: 'Qualitative demonstration only — obtain dark-hour counts and bus-stop details'
  });
  let a = freshArea();
  Object.assign(a, {
    name: 'Shared footpath / cycle route',
    type: 'Cycle route / shared path',
    speed: 'Not applicable',
    flow: 'Not applicable',
    roadClass: 'Not applicable',
    layout: 'No carriageway',
    pedestrians: 'Moderate',
    cyclists: 'Moderate',
    zone: 'E2',
    ecology: 'Advice / survey required',
    habitats: 'Hedgerow and potential dark corridor',
    boundary: 'Separate shared route — exact width and limits to be agreed',
    trafficEvidence: 'No counts available — survey needed'
  });
  state.areas.push(a);
  Object.assign(state.design, {
    columns: 'Mixed retained and new',
    maintenance: 'Investigate lowering columns where vehicle access is unavailable; check hinge clearance.',
    suds: 'Coordinate rain garden near junction B.',
    cms: 'Compatibility and commissioning requirements to be confirmed',
    deliverables: deliveries.slice(0, 5).concat(deliveries.slice(10, 13))
  });
  state.areas.forEach(a => Object.assign(a, {
    useIntensity: 'Normal',
    crime: 'Unknown',
    collisions: 'Unknown',
    vandalism: 'Unknown',
    school: 'No',
    calming: 'No',
    recognition: 'Unknown',
    visualGuidance: 'Good',
    lightSource: 'Unknown'
  }));
  areaIndex = 0;
  save();
  go(2);
  toast('Fictional example loaded — review the calculated initial classes')
}
$('#fileInput').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    if (f.size > 2000000) throw Error('File too large');
    const next = normaliseProject(JSON.parse(await f.text()));
    if (!confirm(
        'Replace the current project with this imported project? Export your current work first if you need to keep it.'
      )) return;
    state = next;
    areaIndex = 0;
    startupMessage = '';
    save();
    go(0);
    toast('Project imported')
  } catch (err) {
    toast(
      'Could not import: choose a valid Lumen v1 project JSON. Your current project has not changed.'
    )
  } finally {
    e.target.value = ''
  }
});
render();
if (startupMessage) {
  $('#saveState').textContent = 'Saved data needs attention';
  toast(startupMessage)
} else {
  save()
}

// Read the linked stylesheet for exported reports. The fallback also works
// when a browser restricts stylesheet access for locally opened files.
function getReportStyles() {
  try {
    const sheet = Array.from(document.styleSheets).find(item => item.href &&
      /styles\.css(?:[?#].*)?$/.test(item.href));
    if (sheet) return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
  } catch (error) {
    // Local file security restrictions can prevent access to cssRules.
  }
  return `body {
    margin: 30px auto;
    padding: 0 24px;
    max-width: 1100px;
    color: #18353d;
    font: 14px/1.55 Arial, sans-serif;
}

h1 {
    font-size: 28px;
}

h2 {
    margin-top: 28px;
    font-size: 20px;
}

h3 {
    margin-top: 22px;
}

table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

th,
td {
    text-align: left;
    vertical-align: top;
    padding: 10px;
    border-bottom: 1px solid #d9e1dd;
    overflow-wrap: anywhere;
}

td:first-child {
    width: 30%;
}

a {
    color: #08695d;
}

.info {
    padding: 16px;
    margin: 20px 0;
    background: #fff5e5;
    border-left: 3px solid #c99443;
}

.badge {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #c99443;
}

.reporttop {
    border-bottom: 2px solid #08695d;
    padding-bottom: 18px;
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 11px;
}

.ref {
    padding: 12px 0;
    border-bottom: 1px solid #d9e1dd;
}

.muted {
    color: #5f7378;
}

.small {
    font-size: 12px;
}

@media print {
    body {
        margin: 0;
        padding: 0;
        font-size: 11px;
    }

    h2,
    h3 {
        break-after: avoid;
    }

    tr {
        break-inside: avoid;
    }
}`;
}
