/* Lumen 0.9 — project overview, applicable BS 5489 tables and designer review.
   Primary source: supplied BS 5489-1:2020; performance summaries identify their supporting source.
   This stage selects an initial table class. It does not approve a design. */
'use strict';

const STORAGE_KEY = 'lumen-annex-a-focused-v09';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[char]);
const id = () => globalThis.crypto?.randomUUID?.() || 'area-' + Date.now().toString(36) + Math
    .random().toString(36).slice(2);

const TYPES = {
    motorway: {
        name: 'Motorway mainline',
        family: 'Motorised traffic route · M',
        table: 'A.2',
        description: 'A motorway carriageway for permitted motor traffic. Focus on mainline driving, lanes and interchanges. Assess service areas, separate paths and other distinct spaces separately.',
        help: 'Table A.2 is the starting route for motorways. A lower or variable limit needs explicit scope review; it does not automatically switch this assessment to A.3.'
    },
    traffic: {
        name: 'Other motorised traffic route',
        family: 'Motorised traffic route · M',
        table: 'A.2 / A.3',
        description: 'A route predominantly serving motorised traffic, including ordinary single and dual carriageways. It may also carry pedestrians, cyclists or slow-moving vehicles. This can include a main road through a settlement.',
        help: 'Use its function and users, not just an A/B road designation. Above 40 mph, consider A.2; at up to 40 mph, use A.3. M does not mean motorway.'
    },
    residential: {
        name: 'Residential / subsidiary road',
        family: 'Subsidiary-road route · P',
        table: 'A.5',
        description: 'A residential or subsidiary road where pedestrian and cyclist needs normally have priority in the lighting assessment. The implemented table route is for roads at up to 30 mph.',
        help: 'An estate access/spine road may have Normal use, while a street mainly serving adjoining homes may be Quiet. Check actual activity; the road name alone does not determine the category.'
    },
    footpath: {
        name: 'Separate footpath / pedestrian street',
        family: 'Pedestrian-only route · P',
        table: 'A.5',
        description: 'An area assessed for people on foot, separate from an ordinary motor-traffic carriageway. For a busy urban square or town-centre space, consider the town-centre category instead.',
        help: 'Use the pedestrians/cyclists-only column of A.5. A crossing over a road needs its own relevant assessment.'
    },
    cycle: {
        name: 'Cycle track / shared pedestrian-cycle route',
        family: 'Pedestrian / cycle route · P',
        table: 'A.5',
        description: 'A cycle track or shared walking/cycling route without ordinary motor traffic in the assessment area. Record the use and interactions of the actual users.',
        help: 'Use the pedestrians/cyclists-only column of A.5. Define connections to carriageways and crossings separately.'
    },
    conflict: {
        name: 'Confirmed conflict area',
        family: 'Conflict-area route · C',
        table: 'A.4',
        description: 'An area on a traffic route where significant movements conflict, such as an appropriately assessed junction or roundabout. A junction is not automatically a conflict area.',
        help: 'Confirm qualification and boundaries, then use the strongest relevant approaching M class. A.4 is not a general M-to-lux conversion.'
    },
    town: {
        name: 'Town / city-centre space',
        family: 'Town-centre route · P or C',
        table: 'A.6',
        description: 'A town-centre thoroughfare, pedestrian area or mixed vehicle/pedestrian space. Its movement arrangement, use and E3/E4 environment determine the table entry.',
        help: 'Predominantly vehicular roads still need the traffic-route assessment. A.6 distinguishes a pedestrian thoroughfare from other pedestrian-only spaces.'
    }
};
const FLOW = {
    Busy: 'High traffic use that may be associated with local amenities such as clubs, shopping facilities and public houses.',
    Normal: 'Traffic use comparable to a housing-estate access road.',
    Quiet: 'Use comparable to a residential road, mainly associated with adjoining properties or similar roads accessed through it.'
};
const YES_NO = ['Yes', 'No', 'Unknown'];
const M_BANDS = ['High to very high', 'Low to moderate', 'Very low'];
const ZONES = {
    E1: 'Dark natural/rural surroundings.',
    E2: 'Low district brightness; relatively dark rural/village settings.',
    E3: 'Medium district brightness; suburban/urban settlement.',
    E4: 'High district brightness; active town/city-centre surroundings.'
};
const DIRECT = {
    structure: {
        name: 'Subway / footbridge / stairway / ramp',
        family: 'Direct maintained illuminance · lux',
        table: '3',
        description: 'Pedestrian subway, footbridge, stairway or ramp. Table 3 applies to urban/suburban surroundings with suitably lit approaches; rural or unlit approaches need a separate assessment.',
        help: 'Select structure and open/enclosed condition. Open means major daylight penetration. This gives direct lux criteria, not a P/M/C class.'
    },
    carpark: {
        name: 'Outdoor car park',
        family: 'Direct maintained illuminance · lux',
        table: '4',
        description: 'Surface car park or open roof of a multi-storey car park. Select actual traffic usage, considering pedestrians, glare and surrounding environmental sensitivity.',
        help: 'Table 4 provides average illuminance and uniformity for Light, Medium and Heavy use. Enclosed car parks require a separate route.'
    },
    arcade: {
        name: 'Shopping arcade / canopied area',
        family: 'Direct maintained illuminance · lux',
        table: '2',
        description: 'An open shopping arcade, completely enclosed arcade or canopied area. Select day or night operation and match adjacent window lighting.',
        help: 'Table 2 provides direct illuminance targets. Colour rendering Ra ≥60 is specified in 7.4.6.'
    }
};
Object.assign(TYPES, DIRECT);

function flowExplanation(a) {
    if (!['residential', 'footpath', 'cycle'].includes(a.type)) return '';
    const flow = a.params.flow;
    const text = FLOW[flow] || 'Select Busy, Normal or Quiet above to display the relevant explanation.';
    const extra = flow === 'Normal' && a.type === 'residential' ? ' An estate access/spine road may be comparable, but confirm its actual use.' : flow === 'Busy' ? ' Review amenity activity during darkness and the users it attracts.' : flow === 'Quiet' ? ' Check whether through-use or nearby amenities mean Quiet is unsuitable.' : '';
    return `<div class="info"><strong>${flow?escapeHTML(flow)+' flow':'Flow-selection guidance'}:</strong> ${escapeHTML(text+extra)}</div>`;
}

function zoneExplanation() {
    return '';
}

function environmentPicker(a) {
    if (!['residential', 'footpath', 'cycle', 'town'].includes(a.type)) return '';
    const list = Object.entries(ZONES).filter(([zone]) => a.type !== 'town' || ['E3', 'E4'].includes(zone));
    return `<section class="card"><details open><summary>Select the environmental zone — descriptions</summary><p>These are introductory descriptions of the Annex A E-zone groupings, which refer to ILP GN01. Confirm the applicable authority designation and local context. Select a zone to populate the parameters and its editable basis below.</p>${table(['Environmental zone','Description / basis'],list.map(([zone,text])=>[`<button class="table-select" data-zone="${zone}" aria-pressed="${a.params.zone===zone}">${zone}</button>`,text]))}<p class="hint">E0 or an uncertain environment needs separate review; no class is assigned from an unsupported zone.</p></details></section>`;
}

function directInputs(a) {
    let inputs = field('name', 'Assessment area name', 'Identify the assessed area and drawing reference.');
    if (a.type === 'structure') inputs += field('structure', 'Structure type', 'Select the actual pedestrian structure.', ['Subway', 'Footbridge', 'Stairway / ramp']) + field('enclosure', 'Daylight condition', 'Open means major daylight penetration.', ['Open', 'Enclosed']) + field('context', 'Surroundings and approaches', 'Table 3 is not appropriate with unlit approaches or little surrounding ambient lighting.', ['Urban/suburban with lit approaches', 'Rural / unlit approaches — review']) + field('approachBasis', 'Approach lighting and compatibility', 'Record actual approach levels and demonstrate the night-time compatibility required by Table 3 note A.', null, true, 'textarea') + field('approachConfirmed', 'Approach compatibility checked?', 'Night levels must not be lower than actual approach levels or more than two classes higher. Verify rather than assuming a conversion.', ['Yes', 'No', 'Unknown']);
    if (a.type === 'carpark') inputs += field('usage', 'Car-park usage', 'Selected from Table 4; examples support judgement and are not automatic site-name rules.', ['Light', 'Medium', 'Heavy']);
    if (a.type === 'arcade') inputs += field('enclosure', 'Arcade / canopy type', 'Open arcade or completely enclosed arcade / canopied area.', ['Open', 'Enclosed / canopied']);
    if (a.type !== 'carpark') inputs += field('period', 'Assessment period', 'Add separate assessment areas for day and night requirements if both are needed.', ['Day', 'Night']);
    return card('Parameters populated from the table', 'Complete the applicable information. Direct illuminance tables do not assign an Annex A class.', `<div class="fields">${inputs}</div>`);
}

function directAssessment(a) {
    const p = a.params,
        r = {
            table: DIRECT[a.type].table,
            className: '',
            row: -1,
            column: -1,
            reasons: [],
            gaps: [],
            flags: [],
            unanswered: [],
            target: null
        };
    if (a.type === 'carpark') {
        r.row = ['Light', 'Medium', 'Heavy'].indexOf(p.usage);
        if (r.row < 0) r.gaps.push('Select Light, Medium or Heavy car-park use.');
        else r.target = {
            avg: [5, 10, 20][r.row],
            uniformity: 0.25
        };
    } else {
        if (a.type === 'structure') {
            if (!['Subway', 'Footbridge', 'Stairway / ramp'].includes(p.structure)) r.gaps.push('Select the structure type.');
            if (p.context !== 'Urban/suburban with lit approaches') r.gaps.push('Confirm Table 3 scope: urban/suburban surroundings and suitably lit approaches. Rural or unlit approaches require separate review.');
            if (p.period === 'Night' && (p.approachConfirmed !== 'Yes' || !p.approachBasis.trim())) r.gaps.push('Record and confirm night-time compatibility with the actual approach lighting.');
        }
        const enclosed = a.type === 'structure' ? 'Enclosed' : 'Enclosed / canopied';
        if (!['Open', enclosed].includes(p.enclosure)) r.gaps.push('Select the open/enclosed condition.');
        if (!['Day', 'Night'].includes(p.period)) r.gaps.push('Select Day or Night.');
        if (!r.gaps.length) {
            if (p.enclosure === 'Open' && p.period === 'Day') r.gaps.push('The table gives no artificial day-lighting value for this open condition. Assess daylight and site needs separately; the dash does not mean zero lux.');
            else r.target = a.type === 'structure' ? (p.period === 'Night' ? {
                avg: 20,
                min: 10
            } : {
                avg: 350,
                min: 150
            }) : (p.enclosure === 'Open' ? {
                avg: 75,
                min: 50
            } : p.period === 'Day' ? {
                avg: 250,
                min: 150
            } : {
                avg: 150,
                min: 75
            });
        }
    }
    if (r.gaps.length) r.target = null;
    if (r.target) r.reasons.push(`BS 5489-1:2020 Table ${r.table}; ${a.type==='carpark'?p.usage+' use':p.enclosure+'; '+p.period+'.'}`);
    const questions = reviewQuestions(a.type, p);
    questions.forEach(q => {
        if (!p[q.key] || p[q.key] === 'Unknown') r.unanswered.push(q.label);
        else if (p[q.key] === 'Yes') r.flags.push(q.label + ': assess the recorded concern.');
    });
    return r;
}

function directTable(a) {
    const p = a.params;
    if (a.type === 'carpark') return card('Table 4 — outdoor car parks', 'Select the applicable usage row.', table(['Usage / examples', 'Maintained average Ē (lux)', 'Minimum Uo'], [
        ['Light', 'Shops, terraced / apartment housing; cycle parks', 5],
        ['Medium', 'Department stores, offices, plants, sports / multipurpose complexes', 10],
        ['Heavy', 'Major shopping centres and major sports / building complexes', 20]
    ].map(([use, example, lux]) => [`<button class="table-select" data-usage="${use}" aria-pressed="${p.usage===use}">${use}</button><span class="table-description">${example}</span>`, lux, '0.25']))) + card('Notes to read with Table 4', '7.4.8.3, printed page 41.', '<p>Provide independent lighting throughout night-time use; select appropriate intensity control to limit glare. In low ambient luminance or environmentally sensitive areas, choose levels appropriate to adjacent highway lighting. Consider vertical illumination for recognition, security and CCTV; review obtrusive light and maintenance access.</p>');
    if (a.type === 'structure') return card('Table 3 — subways, footbridges, stairways and ramps', 'Select the structure and daylight condition; then complete the assessment period and scope checks.', `<div class="actions">${['Subway','Footbridge','Stairway / ramp'].map(v=>`<button data-structure="${v}" aria-pressed="${p.structure===v}">${v}</button>`).join('')}</div>` + table(['Condition', 'Day Ē / Emin (lux)', 'Night Ē / Emin (lux)'], ['Open', 'Enclosed'].map(v => [`<button class="table-select" data-enclosure="${v}" aria-pressed="${p.enclosure===v}">${v}</button>`, v === 'Open' ? '— / —' : '350 / 150', '20 / 10']))) + card('Notes to read with Table 3', '7.4.7, printed pages 38–39.', '<p>Urban/suburban scope only: these levels are inappropriate for unlit approaches or little ambient lighting. Open means major daylight penetration. Night levels must relate to actual approach lighting: not lower than approach levels and no more than two classes higher. Record that check below.</p><p>Assess whether and when to light. Enclosed structures may need emergency lighting; this is essential when part of an escape route from a shopping centre, car park or transport interchange. Assess vertical surfaces, vandal resistance and accessible stair/ramp requirements under BS 8300-2.</p>');
    return card('Table 2 — shopping arcades and canopied areas', 'Select the applicable condition.', table(['Type', 'Day Ē / Emin (lux)', 'Night Ē / Emin (lux)'], [
        ['Open', '— / —', '75 / 50'],
        ['Enclosed / canopied', '250 / 150', '150 / 75']
    ].map(([v, day, night]) => [`<button class="table-select" data-enclosure="${v}" aria-pressed="${p.enclosure===v}">${v}</button>`, day, night]))) + card('Notes to read with Table 2', '7.4.6, printed page 38.', '<p>Provide at least the tabulated levels and match adjacent windows. Use sources with Ra ≥60. A dash is not a zero-lux target.</p>');
}

function clearanceSummary(a) {
    if (!['motorway', 'traffic', 'residential', 'conflict'].includes(a.type)) return '';
    const p = a.params,
        speed = Number(p.speed),
        valid = p.speed && Number.isFinite(speed) && speed > 0 && (speed <= 30 || (speed >= 40 && speed <= 50) || (speed >= 60 && speed <= 70));
    const value = valid ? (speed <= 30 ? .8 : speed <= 50 ? 1 : 1.5) : null;
    return card('Column clearance — Table 1', 'BS 5489-1:2020, 6.1.3, printed page 21.', `<p>${value!==null?`Recorded speed: <strong>${escapeHTML(p.speed)} mph</strong>. Recommended minimum horizontal clearance: <strong>${value.toFixed(1)} m</strong> from carriageway edge to column face, wherever practicable.`:'Record a supported speed to show the applicable clearance.'}</p>${a.type==='motorway'||p.barrier==='Yes'?'<div class="notice">For columns protected by safety barriers, determine the actual setback from the barrier design requirements. The speed-based Table 1 figure alone does not establish the required setback.</div>':''}<p class="hint">Check unobstructed footway passage and 6.1.4. A smaller clearance needs a project-specific risk assessment. In residential roads with adjacent footways ≤3 m wide, site at the rear where practicable. This figure is a recommendation, not a statement that the proposed location is compliant.</p>`);
}

function directDecision(a) {
    const r = assessment(a),
        p = a.params;
    return card('Designer’s review — direct illuminance table', 'These tables specify lux criteria rather than numbered lighting classes.', `<div class="fields">${field('justification','Designer’s review and reasoning','Record the scope checks, local risks, acceptance of the targets or a separately justified alternative design basis. An alternative does not overwrite the table requirement.',null,true,'textarea')}</div><div id="decision-summary">${directSummary(a)}</div>`);
}

function directSummary(a) {
    const r = assessment(a),
        p = a.params,
        recorded = p.decisionStamp === reviewSnapshot(a) && !!p.decisionStamp;
    return `${r.flags.length?'<ul>'+r.flags.map(v=>'<li>'+escapeHTML(v)+'</li>').join('')+'</ul>':''}${r.unanswered.length?'<p>Outstanding: '+r.unanswered.map(escapeHTML).join('; ')+'.</p>':''}<p>${recorded?'Designer review recorded: '+escapeHTML(p.recordedAt):p.decisionStamp?'Inputs have changed; review and record again.':'Designer review not yet recorded.'}</p><button class="primary no-print" data-action="record-direct" ${!r.target||!p.justification.trim()?'disabled':''}>Record review of table targets</button><p class="hint">No automatic one-class adjustment is applied to a direct illuminance table.</p>`;
}

function directResult(a) {
    const r = assessment(a);
    return `<div class="eyebrow muted">Suggested lighting requirements from the table</div><h2>Table ${r.table} — ${escapeHTML(TYPES[a.type].name)}</h2>${r.target?table(['Criterion','Maintained requirement'],[['Average horizontal illuminance Ē',r.target.avg+' lux minimum'],...(r.target.min!==undefined?[['Minimum horizontal illuminance Emin',r.target.min+' lux minimum']]:[['Overall uniformity Uo',r.target.uniformity+' minimum']])]):'<p>Complete the applicable parameters and scope checks.</p>'}${r.reasons.map(v=>'<p>'+escapeHTML(v)+'</p>').join('')}${r.gaps.length?'<div class="notice"><ul>'+r.gaps.map(v=>'<li>'+escapeHTML(v)+'</li>').join('')+'</ul></div>':''}<p class="hint">These are direct maintained targets from the supplied standard, not a P, M or C class. Photometric verification and the table-specific qualifications remain necessary.</p>`;
}

/* Checked against the supplied BS EN 13201-2:2015 Tables 1–6 and Annex C.
   These are requirements, not achieved photometric results. */
const RULE_VERSION = 'UK-BS5489-2020_EN13201-2-2015_v09';
const EXTRA_PARAMS = ['extent', 'operatingPeriod', 'policyBasis', 'sourceMode', 'sourceRa', 'sourceSP', 'sourceReview', 'ulScope', 'wetScope', 'reiScope', 'criteriaBasis', 'glareMethod', 'intensityClass', 'discomfortClass', 'recognitionMode', 'supplementClass', 'recognitionBasis', 'ecology', 'ecologyEvidence', 'receptorRequirements', 'ecologyMeasures', 'riskConclusion', 'riskReviewed', 'collisions', 'vandalism', 'approachLinks', 'exceptionBasis'];
const EXTRA_PROJECT = ['authority', 'policy', 'drawing', 'checker', 'lightingDecision'];
const PERFORMANCE = {
    M: [
        [2, .4, .7, 10, .35],
        [1.5, .4, .7, 10, .35],
        [1, .4, .6, 15, .3],
        [.75, .4, .6, 15, .3],
        [.5, .35, .4, 15, .3],
        [.3, .35, .4, 20, .3]
    ],
    P: [
        [15, 3, 5, 5],
        [10, 2, 3, 2],
        [7.5, 1.5, 2.5, 1.5],
        [5, 1, 1.5, 1],
        [3, .6, 1, .6],
        [2, .4, .6, .2]
    ],
    C: [50, 30, 20, 15, 10, 7.5],
    glareC: [15, 15, 15, 20, 20, 20],
    glareP: [20, 25, 25, 30, 30, 35],
    SC: [10, 7.5, 5, 3, 2, 1.5, 1, .75, .5],
    EV: [50, 30, 10, 7.5, 5, .5]
};
const RISK_FIELDS = ['hazard', 'users', 'evidence', 'controls', 'residual', 'owner', 'status'];
const newRisk = (factor = '', hazard = '') => ({
    id: id(),
    factor,
    hazard,
    users: '',
    evidence: '',
    controls: '',
    residual: '',
    owner: '',
    status: 'Open'
});

function scopeState(value, apply, exclude) {
    return value === apply ? 'Applies' : value === exclude ? 'Not applicable' : 'Applicability not established';
}

function selectedClass(a) {
    return DIRECT[a.type] ? '' : proposedClass(a).className || assessment(a).className;
}

function performanceRows(className, a) {
    if (!/^(M[1-6]|P[1-6]|C[0-5])$/.test(className)) return [];
    const p = a?.params || {},
        f = className[0],
        n = Number(className.slice(1));
    let rows = [];
    if (f === 'M') {
        const v = PERFORMANCE.M[n - 1];
        rows = [
            ['Maintained average road luminance L̄', v[0] + ' cd/m² minimum', 'Applies', 'EN 13201-2 Table 1'],
            ['Dry overall uniformity Uo', v[1] + ' minimum', 'Applies', 'Table 1'],
            ['Longitudinal uniformity Ul', v[2] + ' minimum', scopeState(p.ulScope, 'Long uninterrupted section', 'Not applicable'), 'Table 1 note a; BS 5489 5.3.1.3'],
            ['Threshold increment TI', v[3] + '% maximum', 'Applies', 'Table 1; BS 5489 5.3.1.4'],
            ['Edge illuminance ratio REI', v[4] + ' minimum', scopeState(p.reiScope, 'No separately assessed adjacent traffic areas', 'Adjacent traffic areas have own requirements'), 'Table 1 note d'],
            ['Wet overall uniformity Uow', '0.15 minimum', scopeState(p.wetScope, 'Required by project', 'Not required by project'), 'Table 1 note b']
        ];
    } else if (f === 'C') rows = [
        ['Maintained average horizontal illuminance Ē', PERFORMANCE.C[n] + ' lux minimum', 'Applies', 'EN 13201-2 Table 2'],
        ['Overall uniformity Uo (Emin / Ē)', '0.40 minimum', 'Applies', 'Table 2']
    ];
    else {
        const v = PERFORMANCE.P[n - 1];
        rows = [
            ['Maintained average horizontal illuminance Ē', v[0] + ' lux minimum', 'Applies', 'EN 13201-2 Table 3'],
            ['Maintained minimum horizontal illuminance Emin', v[1] + ' lux minimum', 'Applies', 'Table 3'],
            ['Maintained average cap', (v[0] * 1.5) + ' lux maximum', 'Applies', 'Table 3 note a']
        ];
    }
    if (f !== 'M') {
        const ti = f === 'C' ? PERFORMANCE.glareC[n] : PERFORMANCE.glareP[n - 1];
        rows.push(['Disability glare TI', ti + '% maximum', p.glareMethod === 'TI calculation' ? 'Selected calculation route' : p.glareMethod === 'Installed intensity class' ? 'Alternative intensity-control route selected' : 'Glare route not established', `EN 13201-2 Annex C Table C.${f==='C'?1:2}; BS 5489 5.3`]);
        if (p.glareMethod === 'Installed intensity class') rows.push(['Installed intensity class', /^G\*[1-6]$/.test(p.intensityClass) ? p.intensityClass : 'Select the G* class', 'Verify in installed orientation', 'EN 13201-2 Annex A']);
        if (p.discomfortClass) rows.push(['Discomfort-glare class', /^D[1-6]$/.test(p.discomfortClass) ? p.discomfortClass : 'Review selected class', 'Additional specified control', 'EN 13201-2 Annex A']);
    }
    if (p.recognition === 'Yes') {
        if (f === 'P' && ['P-table vertical', 'P-table semi-cylindrical'].includes(p.recognitionMode)) {
            const vertical = p.recognitionMode === 'P-table vertical';
            rows.push([vertical ? 'Minimum vertical illuminance Ev,min' : 'Minimum semi-cylindrical illuminance Esc,min', PERFORMANCE.P[n - 1][vertical ? 2 : 3] + ' lux minimum', 'Facial recognition selected; define height/orientations', 'EN 13201-2 Table 3']);
        } else if (['Supplementary SC class', 'Supplementary EV class'].includes(p.recognitionMode)) {
            const match = /^(SC([1-9])|EV([1-6]))$/.exec(p.supplementClass);
            const family = p.supplementClass.startsWith('SC') ? 'SC' : 'EV';
            const valid = match && p.recognitionMode === `Supplementary ${family} class`;
            rows.push([family === 'SC' ? 'Additional semi-cylindrical illuminance' : 'Additional vertical illuminance', valid ? p.supplementClass + ' · ' + PERFORMANCE[family][Number(p.supplementClass.replace(/\D/g, '')) - 1] + ' lux minimum' : 'Select the supplementary class', 'Designer-selected additional requirement', `EN 13201-2 Table ${family==='SC'?5:6}`]);
        } else rows.push(['Recognition requirement', 'Select the criterion and its basis', 'Unresolved', 'EN 13201-2 6.2 / Table 3']);
    }
    return rows;
}

function lightingLevels(className, a = area()) {
    const rows = performanceRows(className, a);
    if (!rows.length) return '';
    return `<h3>${escapeHTML(className)} — lighting levels and applicability</h3>${table(['Criterion','Maintained requirement / limit','Applicability','Source'],rows.map(row=>row.map(escapeHTML)))}<p class="hint">Primary source: supplied BS EN 13201-2:2015. Conditional criteria remain visible until their applicability is established. These are design targets; achieved performance is not calculated by this selector. M classes use luminance rather than a universal lux equivalent. Annex C and Annex A provide informative glare guidance; BS 5489 supplies the UK design recommendations.</p>`;
}

function requirementsInputs(a) {
    const p = a.params,
        c = selectedClass(a),
        f = c[0];
    let html = '';
    if (f === 'M') html += field('ulScope', 'Does this area include a long, uninterrupted stretch of road?', 'This determines whether longitudinal uniformity (Ul) is assessed. Example: a continuous straight road with repeated columns. A junction or irregular space may need a different assessment.', ['Long uninterrupted section', 'Not applicable', 'Unknown']) + field('wetScope', 'Does the authority or project require an additional wet-road assessment?', 'Dry-road calculations are the normal UK basis (BS 5489-1:2020, 7.1.2 Note 5). Select Yes if the authority/project requires both wet and dry calculations; otherwise record No, or Not yet confirmed.', ['Required by project', 'Not required by project', 'Unknown']) + field('reiScope', 'Adjacent traffic areas', 'REI applies where adjacent traffic areas do not have their own lighting requirements.', ['No separately assessed adjacent traffic areas', 'Adjacent traffic areas have own requirements', 'Unknown']);
    if (f === 'P' || f === 'C') html += field('glareMethod', 'Disability-glare assessment route', 'Identify TI calculation or justified installed-intensity control.', ['TI calculation', 'Installed intensity class', 'Not established']) + (p.glareMethod === 'Installed intensity class' ? field('intensityClass', 'Installed luminous intensity class', 'Verify the luminaire at its installed tilt/rotation; a catalogue claim alone may be insufficient.', ['G*1', 'G*2', 'G*3', 'G*4', 'G*5', 'G*6']) : '') + field('discomfortClass', 'Additional discomfort-glare class (optional)', 'Specify only where justified; this does not replace disability-glare review.', ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']);
    if (f === 'P') {
        html += field('sourceMode', 'P-class source suitability', 'BS 5489 A.1.1(d): Ra <60 or S/P <1.0 triggers exceptional source review. No routine S/P reduction is offered.', ['Benchmark white source confirmed', 'Exceptional source / review required', 'Not established']);
        if (p.sourceMode === 'Exceptional source / review required') html += field('sourceRa', 'Colour rendering Ra', 'Enter manufacturer evidence, if known.', null, false, 'number') + field('sourceSP', 'S/P ratio', 'Exceptional-source evidence only; do not infer this from colour temperature.', null, false, 'number') + field('sourceReview', 'Source-review outcome / reference', 'Record specialist review against PLG03. The tool does not calculate that adjustment.', null, true, 'textarea');
    }
    if (p.recognition === 'Yes') {
        const options = f === 'P' ? ['P-table vertical', 'P-table semi-cylindrical', 'Supplementary SC class', 'Supplementary EV class'] : ['Supplementary SC class', 'Supplementary EV class'];
        html += field('recognitionMode', 'Supplementary recognition criterion', 'Select the visual requirement explicitly; it does not automatically raise the primary class.', options);
        if (p.recognitionMode === 'Supplementary SC class') html += field('supplementClass', 'SC class', 'Additional semi-cylindrical illuminance; EN 13201-2 Table 5.', ['SC1', 'SC2', 'SC3', 'SC4', 'SC5', 'SC6', 'SC7', 'SC8', 'SC9']);
        if (p.recognitionMode === 'Supplementary EV class') html += field('supplementClass', 'EV class', 'Additional vertical illuminance; EN 13201-2 Table 6.', ['EV1', 'EV2', 'EV3', 'EV4', 'EV5', 'EV6']);
        html += field('recognitionBasis', 'Recognition basis and assessment plane', 'Record users/task, reference height, orientations and extent. SC is evaluated at 1.5 m; define the relevant vertical planes for EV.', null, true, 'textarea');
    }

    return card('Applicable lighting criteria', 'Complete the conditions supporting the performance schedule; the final designer class determines these criteria.', `<div class="fields">${html}</div><div id="criteria-generated">${generatedReasonsHTML(a)}</div><div class="fields">${field('criteriaBasis','Additional designer notes (optional)','The explanation above is generated from your answers. Add only site-specific reasoning or clarification; previous notes are retained.',null,true,'textarea')}</div>`);
}

function ecologyInputs(a) {
    const p = a.params;
    return card('Ecology and environmental constraints', 'Environmental zone and ecological sensitivity are separate: an E3 street can still have a sensitive corridor.', `<div class="fields">${field('ecology','Ecological constraints identified?','Consider habitat, roosts, commuting/foraging routes, watercourses and planning requirements.',['Yes','No identified constraints — evidence reviewed','Unknown / survey needed'])}${field('ecologyEvidence','Ecology / planning evidence','Record survey/report, consultation or the documented basis for no identified constraints.',null,true,'textarea')}${p.ecology==='Yes'?field('receptorRequirements','Ecologically sensitive locations and required lighting restrictions','Examples: a bat-roost entrance, northern hedgerow, woodland edge or watercourse. Identify the feature and the report/condition specifying limits, planes/heights and periods. If not established, record “Awaiting ecology advice”; do not invent an agreed lux limit.',null,true,'textarea')+field('ecologyMeasures','Measures to protect sensitive areas and how they will be checked','Suggested options are prefilled and editable. Example: move columns away from a hedgerow, review optics/shields and check calculated spill against the ecologist’s requirements. Record the selected measures and calculations or measurements still needed.',null,true,'textarea'):''}</div><p class="hint">The supplied GN08 is the 2018 edition. GN08/23 and current obtrusive-light guidance remain references to obtain/review. This module records project constraints; it does not certify ecological acceptability.</p>`);
}

function riskField(r, key, label, hint, options) {
    const controlId = `risk-${r.id}-${key}`,
        attrs = `id="${controlId}" data-risk="${r.id}" data-rkey="${key}" aria-describedby="${controlId}-hint"`;
    const control = options ? `<select ${attrs}>${options.map(v=>`<option value="${escapeHTML(v)}" ${r[key]===v?'selected':''}>${escapeHTML(key==='status'?(RISK_STATUS_LABELS[v]||v):v)}</option>`).join('')}</select>` : `<textarea ${attrs}>${escapeHTML(r[key])}</textarea>`;
    return `<div class="field"><label for="${controlId}">${label}</label>${control}<p class="hint" id="${controlId}-hint">${hint}</p></div>`;
}

function flaggedQuestions(a) {
    return reviewQuestions(a.type, a.params).filter(q => a.params[q.key] === 'Yes' || q.key === 'background' && ['Low', 'High'].includes(a.params.background) || q.key === 'guidance' && a.params.guidance === 'Poor');
}

function recordIssues(a) {
    const p = a.params,
        r = assessment(a),
        issues = [...r.gaps];
    if (!r.className && !r.target && !issues.length) issues.push('Complete the table selection.');
    for (const [key, label] of [
            ['name', 'Project name'],
            ['designer', 'Designer'],
            ['authority', 'Authority/client'],
            ['policy', 'Policy / design basis'],
            ['drawing', 'Drawing / extent reference']
        ])
        if (!state.project[key]?.trim()) issues.push(label + ' not recorded.');
    if (!a.name.trim()) issues.push('Assessment area name not recorded.');
    if (!(a.type === 'conflict' ? p.boundary : p.extent)?.trim()) issues.push('Assessment boundary not recorded.');
    if (!p.operatingPeriod.trim()) issues.push('Assessment operating period not recorded.');
    if (!p.evidence.trim()) issues.push('Selection evidence not recorded.');
    for (const q of reviewQuestions(a.type, p))
        if (!p[q.key]) issues.push(q.label + ' — no answer selected.');
        else if (p[q.key] === 'Unknown') issues.push(q.label + ' — recorded as Unknown; confirm or document the unresolved issue.');
    for (const q of flaggedQuestions(a))
        if (!a.risks.some(item => item.factor === q.key) && !p.suppressedRisks.split(',').includes(q.key)) issues.push('Risk item needed for ' + q.label + '.');
    a.risks.forEach((item, i) => {
        const missing = riskMissing(item);
        if (missing.length) issues.push(`Risk ${i+1}: complete ${missing.join('; ')}.`);
        if (item.status === 'Open') issues.push(`Risk ${i+1}: draft assessment needs designer review; choose the appropriate assessment/action status.`);
    });
    if (!p.riskConclusion.trim() || p.riskReviewed !== 'Reviewed by designer') issues.push('Designer risk review not complete.');
    if (!p.ecology || p.ecology === 'Unknown / survey needed' || !p.ecologyEvidence.trim()) issues.push('Ecological constraints / evidence not established.');
    if (p.ecology === 'Yes' && (!p.receptorRequirements.trim() || !p.ecologyMeasures.trim() || (!a.risks.some(v => v.factor === 'ecology') && !p.suppressedRisks.split(',').includes('ecology')))) issues.push('Complete the receptor requirements, measures and ecology risk item.');
    const c = selectedClass(a),
        f = c[0];
    if (f === 'M') {
        for (const k of ['ulScope', 'wetScope', 'reiScope'])
            if (!p[k] || p[k] === 'Unknown') issues.push(k === 'ulScope' ? 'Ul applicability not established.' : k === 'wetScope' ? 'Wet-road requirement not established.' : 'REI applicability not established.');
    } else if (f === 'C' || f === 'P') {
        if (!['TI calculation', 'Installed intensity class'].includes(p.glareMethod)) issues.push('Glare assessment route not established.');
        if (p.glareMethod === 'Installed intensity class' && !/^G\*[1-6]$/.test(p.intensityClass)) issues.push('Installed intensity class not selected.');
    }
    if (f === 'P' && p.sourceMode !== 'Benchmark white source confirmed') issues.push('P-class exceptional/unknown source requires external review; no source-adjusted result is calculated here.');
    if (p.recognition === 'Yes') {
        const mode = p.recognitionMode,
            valid = mode === 'Supplementary SC class' ? /^SC[1-9]$/.test(p.supplementClass) : mode === 'Supplementary EV class' ? /^EV[1-6]$/.test(p.supplementClass) : f === 'P' && ['P-table vertical', 'P-table semi-cylindrical'].includes(mode);
        if (!valid || !p.recognitionBasis.trim()) issues.push('Supplementary recognition criterion / assessment plane not established.');
    }
    if (!DIRECT[a.type] && proposedClass(a).warnings.length && !p.exceptionBasis.trim()) issues.push('Record the exceptional basis for the larger adjustment or lighting-family change.');

    if (!DIRECT[a.type] && proposedClass(a).error) issues.push(proposedClass(a).error);
    if (DIRECT[a.type] && !p.justification.trim()) issues.push('Designer review reasoning not recorded.');
    return [...new Set(issues)];
}

function decisionCurrent(a) {
    return !!a.params.decisionStamp && a.params.decisionStamp === reviewSnapshot(a);
}

function dependencies(a) {
    const ids = a.params.approachLinks.split(',').filter(Boolean);
    return ids.map(id => {
        const s = state.areas.find(v => v.id === id);
        if (!s) return {
            id,
            missing: true
        };
        const params = {
            ...s.params
        };
        delete params.decisionStamp;
        return {
            id,
            type: s.type,
            name: s.name,
            params,
            risks: s.risks
        };
    });
}

function reviewSnapshot(a) {
    const params = {
        ...a.params
    };
    delete params.decisionStamp;
    delete params.recordedAt;
    return JSON.stringify({
        version: RULE_VERSION,
        project: state.project,
        type: a.type,
        name: a.name,
        params,
        risks: a.risks,
        dependencies: dependencies(a)
    });
}

function linkedAssessment(a) {
    const ids = a.params.approachLinks.split(',').filter(Boolean);
    if (!ids.length) return baseAssessment(a);
    let classes = [],
        issues = [],
        names = [];
    for (const id of ids) {
        const source = state.areas.find(v => v.id === id);
        if (!source || !['motorway', 'traffic'].includes(source.type)) {
            issues.push('A linked approach is missing or is not a motorised traffic route.');
            continue;
        }
        const proposal = proposedClass(source);
        if (proposal.error || !decisionCurrent(source) || !/^M[1-6]$/.test(proposal.className)) {
            issues.push('Record a current M-class designer selection for linked approach ' + (source.name || source.id) + '.');
            continue;
        }
        classes.push(proposal.className);
        names.push((source.name || 'Approach') + ' ' + proposal.className);
    }
    const strongest = classes.length ? 'M' + Math.min(...classes.map(v => Number(v[1]))) : '';
    const result = baseAssessment({
        ...a,
        params: {
            ...a.params,
            approach1: strongest,
            approach2: ''
        }
    });
    result.reasons.unshift('Linked approaches: ' + names.join('; ') + '.');
    result.gaps.push(...issues);
    if (issues.length) result.className = '';
    return result;
}

function linkInputs(a) {
    if (a.type !== 'conflict') return '';
    const ids = a.params.approachLinks.split(',');
    const choices = state.areas.filter(v => v.id !== a.id && ['motorway', 'traffic'].includes(v.type));
    return card('Link approaching road assessments', 'Optional: select any number of assessed motorised approaches. Their current recorded designer M classes replace the manual approaching-class inputs.', `<div class="link-choices">${choices.map(s=>`<label><input type="checkbox" data-link="${s.id}" ${ids.includes(s.id)?'checked':''}> ${escapeHTML(s.name||'Unnamed road')} · ${escapeHTML(TYPES[s.type].name)}</label>`).join('')||'<p>Add motorised road assessment areas to enable linking.</p>'}</div>${ids.filter(Boolean).length?'<p class="hint">Manual approach values below are ignored while linked approaches are selected. Source changes invalidate the affected conflict decision.</p>':''}`);
}

function areaMetaInputs(a) {
    return card('Assessment boundary and period', 'Define what the selected table applies to and the most onerous conditions during darkness.', `<div class="fields">${a.type!=='conflict'?field('extent','Area extent / drawing boundary','Reference the assessed carriageway, path or space; split distinct areas into separate assessments.',null,true,'textarea'):''}${field('operatingPeriod','When and under what conditions is this area being assessed?','Examples: residential evening use; the main road’s highest traffic flow during darkness; shopping-area evening opening; school arrival/departure when dark. Assess a quieter overnight period separately if proposing reduced lighting.')}${field('policyBasis','Council / client requirements and any proposed exceptions','Examples: a council class requirement; an all-night operating requirement; or a justified exception for these conditions. If none apply, enter “No additional local requirements identified”. Record any agreement needed for an exception.',null,true,'textarea')}</div>`);
}

function projectBasis() {
    return card('Authority, drawings and design basis', 'The selection method is BS 5489-1:2020 Annex A; performance is BS EN 13201-2:2015. Local policy is recorded alongside that basis, not blended into a hidden score.', `<div class="fields">${field('authority','Authority / client','Who will review or own the assessed scheme?',null,false,'text',true)}${field('policy','Applicable policy / specification','Record document name, edition and relevant instruction; record the basis if no client policy applies.',null,true,'textarea',true)}${field('drawing','Drawing / revision and project extent','Reference the drawing used to define all assessment areas.',null,true,'textarea',true)}${field('checker','Checker (if required)','A name is a record only; this offline prototype does not authenticate sign-off.',null,false,'text',true)}${field('lightingDecision','Reason for providing / changing lighting','Reference the decision or brief. Selecting a class does not itself decide whether to light.',null,true,'textarea',true)}</div>`);
}

function addHistory(a) {
    a.history.push({
        at: new Date().toISOString(),
        designer: state.project.designer,
        initial: assessment(a).className || directTargetText(assessment(a)),
        selected: DIRECT[a.type] ? directTargetText(assessment(a)) : proposedClass(a).className,
        reason: a.params.justification,
        issues: recordIssues(a),
        snapshot: reviewSnapshot(a)
    });
    if (a.history.length > 20) a.history.shift();
}

function directTargetText(r) {
    return r.target ? `${r.target.avg} lux average minimum; ${r.target.min!==undefined?r.target.min+' lux minimum':'Uo '+r.target.uniformity+' minimum'}` : 'Pending';
}

function historyHTML(a) {
    return a.history.length ? `<details><summary>Recorded decision history (${a.history.length})</summary>${table(['Date','Designer','Starting','Selected','Reason / outstanding at recording'],a.history.map(h=>[h.at,h.designer,h.initial,h.selected,h.reason+(h.issues.length?' · '+h.issues.length+' unresolved item(s)':'')].map(escapeHTML)))}</details>` : '';
}

function reportArea(a, index) {
    const r = assessment(a),
        p = a.params,
        proposal = DIRECT[a.type] ? null : proposedClass(a),
        selected = proposal?.className || '';
    const values = Object.entries(p).filter(([k, v]) => v && !['decisionStamp', 'recordedAt', 'justification', 'riskConclusion', 'riskReviewed'].includes(k) && applicableReportKey(a, k));
    return `<article class="report-area"><h2>${index+1}. ${escapeHTML(a.name||'Unnamed area')} · ${escapeHTML(TYPES[a.type]?.name||'Type not selected')}</h2>${statusPanel(a).replaceAll('<details>','<details open>')}<h3>Selection and reasons</h3>${table(['Stage','Result'],[['Starting table',r.table?'BS 5489-1:2020 Table '+r.table:'Not selected'],['Starting requirements',r.className||directTargetText(r)],['Designer selection',DIRECT[a.type]?directTargetText(r):selected||'Not chosen'],['Decision current?',decisionCurrent(a)?'Yes — recorded '+p.recordedAt:p.decisionStamp?'No — inputs changed':'Not recorded'],['Designer reasoning',p.justification||'Not recorded']].map(row=>row.map(escapeHTML)))}${r.reasons.length?'<ol>'+r.reasons.map(v=>'<li>'+escapeHTML(v)+'</li>').join('')+'</ol>':''}${DIRECT[a.type]?directResult(a):lightingLevels(selected||r.className,a)}${generatedReasonsHTML(a)}<details open><summary>Recorded parameters and evidence</summary>${table(['Parameter','Recorded value'],values.map(([k,v])=>[escapeHTML(parameterLabel(k)),escapeHTML(v)]))}</details><h3>Lighting-design risk assessment</h3>${riskReport(a)}<p><strong>Overall conclusion:</strong> ${escapeHTML(p.riskConclusion||'Not recorded')}</p><p><strong>Risk-review status:</strong> ${escapeHTML(p.riskReviewed||'Draft')}</p><h3>Ecology and environmental constraints</h3>${table(['Item','Record'],[['Status',p.ecology],['Evidence',p.ecologyEvidence],['Receptors / requirements',p.ecology==='Yes'?p.receptorRequirements:'Not applicable to recorded screening'],['Measures / verification',p.ecology==='Yes'?p.ecologyMeasures:'Not applicable to recorded screening']].map(row=>row.map(v=>escapeHTML(v||'Not recorded'))))}${clearanceSummary(a)}${historyHTML(a).replaceAll('<details>','<details open>')}<h3>Design verification to be supplied</h3><p>Provide photometric calculation evidence against the applicable criteria, with software/version, calculation geometry, maintained/initial assumptions, luminaire photometry, source/driver settings and maintenance factor. Record applicable glare and supplementary assessment planes. This report does not calculate achieved installation performance. Measurement and energy modules are planned separately.</p></article>`;
}

function parameterLabel(k) {
    const labels = {
        criteriaBasis: 'Additional designer notes',
        suppressedRisks: 'Automatic draft factors removed by designer',
        speed: 'Recorded speed limit (mph)',
        zone: 'Environmental zone',
        zoneBasis: 'Zone basis',
        extent: 'Boundary / extent',
        operatingPeriod: 'Operating period',
        approachLinks: 'Linked approach area IDs',
        adt: 'Average daily traffic (vehicles/day)',
        capacity: 'Lane-capacity percentage',
        flow: 'Flow category',
        evidence: 'Selection evidence',
        sourceMode: 'P-class source review',
        sourceRa: 'Colour rendering Ra',
        sourceSP: 'Exceptional S/P evidence',
        sourceReview: 'Exceptional source-review reference'
    };
    return labels[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function applicableReportKey(a, k) {
    if (k === 'ecologyMeasuresDraft') return false;
    const p = a.params,
        f = selectedClass(a)[0],
        allReview = ['background', 'guidance', 'mixed', 'parking', 'bus', 'crossing', 'school', 'calming', 'recognition', 'heavy', 'interchange', 'crime', 'cctv', 'competing', 'amenities', 'slow', 'collisions', 'vandalism'];
    if (['ulScope', 'wetScope', 'reiScope'].includes(k)) return f === 'M';
    if (['glareMethod', 'intensityClass', 'discomfortClass'].includes(k) && !['C', 'P'].includes(f)) return false;
    if (k === 'sourceMode') return f === 'P';
    if (['receptorRequirements', 'ecologyMeasures'].includes(k)) return p.ecology === 'Yes';
    if (allReview.includes(k)) return reviewQuestions(a.type, p).some(v => v.key === k);
    if (k === 'adt') return p.method === 'ADT';
    if (k === 'capacity') return p.method === 'Lane-capacity percentage';
    if (k === 'band') return p.method === 'Designer-selected band';
    if (k === 'density') return p.layout === 'Dual carriageway';
    if (k === 'approach1' || k === 'approach2') return a.type === 'conflict' && !p.approachLinks;
    if (k === 'exceptionBasis') return !DIRECT[a.type] && proposedClass(a).warnings.length > 0;
    if (k === 'alternative') return p.adjustment === 'Choose another class';
    if (['recognitionMode', 'supplementClass', 'recognitionBasis'].includes(k)) return p.recognition === 'Yes' && (k !== 'supplementClass' || p.recognitionMode.startsWith('Supplementary'));
    if (['sourceRa', 'sourceSP', 'sourceReview'].includes(k)) return selectedClass(a)[0] === 'P' && p.sourceMode === 'Exceptional source / review required';
    if (k === 'intensityClass') return p.glareMethod === 'Installed intensity class';
    return true;
}

function designBrief() {
    return pageHead('03', 'Design brief and risk assessment.', 'All assessment areas, their requirements, reasons and unresolved actions.') + `<div class="actions no-print"><button data-action="print">Print / save PDF</button><button data-action="download-brief">Download standalone HTML brief</button><button data-action="selection">Return to assessment</button></div><section class="card report-intro"><h2>${escapeHTML(state.project.name||'Untitled lighting project')}</h2>${table(['Project record','Value'],Object.entries(state.project).map(([k,v])=>[escapeHTML(parameterLabel(k)),escapeHTML(v||'Not recorded')]))}<p><strong>Rule register:</strong> ${RULE_VERSION}. Selection: supplied BS 5489-1:2020 Annex A and main-body Tables 1–4. Performance: supplied BS EN 13201-2:2015. CEN/CIE weighting alternatives are not combined with this route.</p><p class="notice">This is a design brief and recorded selection/risk review. Installation photometric verification, ecological acceptance and authority approval are separate records. Draft and unresolved items remain visible below.</p></section><section class="card"><h2>Area requirements schedule</h2>${table(['Area','Starting','Designer proposal','Record status'],state.areas.map(a=>[escapeHTML(a.name||'Unnamed'),escapeHTML(assessment(a).className||directTargetText(assessment(a))),escapeHTML(DIRECT[a.type]?directTargetText(assessment(a)):proposedClass(a).className||'Pending'),escapeHTML(decisionCurrent(a)?recordIssues(a).length?'Selection recorded — assessment needs attention':openActions(a).length?'Assessment recorded — actions outstanding':'Designer assessment recorded':'Draft / needs review')]))}</section>` + state.areas.map(reportArea).join('');
}

function downloadBrief() {
    const html = designBrief().replace(/<div class="actions no-print">[\s\S]*?<\/div>/, '');
    download('lumen-design-brief-v09.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lumen design brief</title><style>body{font:15px/1.6 Arial,sans-serif;color:#173337;max-width:1100px;margin:2rem auto;padding:1rem}table{width:100%;border-collapse:collapse;margin:1rem 0}td,th{border:1px solid #cedbd9;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}thead{background:#edf4f2}.tablewrap{overflow:auto}.status-panel,.notice{background:#fff5de;padding:1rem;border-left:4px solid #b87813}.ready{background:#eaf5ef}.report-area{margin-top:3rem;border-top:2px solid #173337}.hint{font-size:.85em}.no-print{display:none}.risk-item{margin:1.5rem 0}.generated-note{background:#eef6f3;border-left:4px solid #427b68;padding:16px;margin:18px 0}.action-summary{border:1px solid #e0c587;padding:12px;margin-top:12px}h2,h3,h4{break-after:avoid}tr{break-inside:avoid}@media print{body{font-size:10pt;margin:0;max-width:none}table{font-size:9pt}.report-area{break-before:page}.tablewrap{overflow:visible}details{display:block}}</style></head><body>${html}</body></html>`, 'text/html');
}

const EXTRA09 = ['suppressedRisks', 'ecologyMeasuresDraft'];
const RISK_STATUS_LABELS = {
    'Open': 'Draft — needs designer review',
    'Action agreed': 'Assessment reviewed — action outstanding',
    'Reviewed / closed': 'Reviewed — no further design-stage action'
};
const RISK_TEMPLATES = {
    ecology: {
        hazard: 'Artificial light could spill onto sensitive habitat or disturb wildlife movement, foraging or roost access.',
        users: 'Wildlife and the ecological features identified in the survey or planning requirements; coordinate with the ecologist.',
        controls: 'OPTIONS FOR DESIGNER REVIEW: consider avoiding lighting or relocating columns away from sensitive features. Review suitable optics and installed G* intensity control, lantern orientation/tilt, shielding, baffles or bat louvres. Consider an appropriate spectrum / colour temperature with the ecologist. Test lower or higher mounting heights against spill, glare and road coverage; neither is automatically better. Consider operating hours, dimming and seasonal requirements where justified. Select measures against the actual site constraints; these are suggested options, not confirmed requirements. A G* rating or colour temperature alone does not establish ecological acceptability.',
        residual: 'Verify the selected arrangement using receptor calculations against ecologist/planning requirements and measurements where required. Record any remaining safety/ecology conflict and the agreed design response.'
    },
    parking: {
        hazard: 'Parked vehicles may conceal pedestrians, cyclists or obstacles and create movement conflicts during darkness.',
        users: 'Pedestrians, cyclists and drivers near parked vehicles, accesses and crossing movements.',
        controls: 'Review parking layout, sightlines and actual night-time activity. Consider lighting position, optics and local coverage to reveal users between or beyond parked vehicles while controlling glare. Check whether the table assumption of no parked vehicles needs a justified class or supplementary-criterion adjustment; do not apply an automatic uplift.',
        residual: 'Confirm visibility and achieved coverage in the design calculation; record any remaining obstruction and proposed layout or management measures.'
    },
    bus: {
        hazard: 'Waiting, boarding, alighting and associated crossing movements may be difficult to see during darkness.',
        users: 'Passengers, pedestrians, bus drivers and other road users around the stop and its approaches.',
        controls: 'Identify waiting areas, boarding points, access paths and actual crossing desire lines. Review illumination, recognition, glare and the effect of shelters or parked vehicles. Define separate crossing or conflict assessments where appropriate; coordinate with the highway and public-transport requirements.',
        residual: 'Check the relevant calculation areas and observer views. Record unresolved shelter, access or crossing issues and any additional measures needed.'
    },
    crossing: {
        hazard: 'People crossing the carriageway may not be adequately visible to approaching drivers.',
        users: 'Pedestrians, cyclists and approaching drivers at the identified crossing and approaches.',
        controls: 'Confirm crossing type, extent and applicable guidance. Review approach visibility, background contrast, crossing illumination and glare. Assess the crossing and any associated conflict area separately where needed; do not assume a general road class proves crossing visibility.',
        residual: 'Verify against the applicable crossing design requirements and drawing. Record any remaining approach, contrast or obstruction issues.'
    },
    mixed: {
        hazard: 'Different user speeds and movements may create visual complexity or obscure vulnerable users.',
        users: 'The actual mix of drivers, slow-moving vehicles, cyclists and pedestrians within this area.',
        controls: 'Identify users, movements and peak conditions during darkness. Review separation, sightlines and lighting coverage at interactions. Consider supplementary visual criteria or a justified class adjustment where the risk assessment supports it.',
        residual: 'Check the design against the identified movements and relevant calculation areas; record any interaction needing layout or traffic-management measures.'
    },
    school: {
        hazard: 'Concentrated arrival/departure activity may create visibility problems at school access points during darkness.',
        users: 'Children, carers, pedestrians, cyclists, school transport and passing drivers.',
        controls: 'Confirm whether arrival or departure actually occurs in darkness. Review entrances, footways, crossing desire lines, parked vehicles and approach visibility. Coordinate appropriate lighting and non-lighting measures with the school/highway arrangements.',
        residual: 'Verify the relevant winter operating conditions and entrance/crossing assessment; record any unresolved parking or access concern.'
    },
    calming: {
        hazard: 'Traffic-calming features or changes in alignment may be difficult to identify on the approach.',
        users: 'Drivers, cyclists and pedestrians near the feature and its approaches.',
        controls: 'Identify the feature and the approaching visual task. Review placement, contrast, markings, local illumination and glare. Check coverage of islands, narrowing or vertical features without assuming that a blanket class increase is the right solution.',
        residual: 'Confirm visibility of each feature in the proposed arrangement and record any marking, layout or maintenance action.'
    },
    recognition: {
        hazard: 'Insufficient visibility of faces or intent may affect personal safety or the ability to recognise other users.',
        users: 'Pedestrians and other users for whom recognition is a relevant visual task.',
        controls: 'Record the actual recognition need. Consider appropriate vertical or semi-cylindrical criteria, SC/EV requirements where justified, source colour rendering and glare control. Define the assessment plane, height and orientations. Do not treat extra horizontal lux alone as proof of recognition performance.',
        residual: 'Verify the selected supplementary criteria and views in the design calculation; confirm remaining concerns through the relevant project review.'
    },
    crime: {
        hazard: 'Local crime or personal-safety concerns may indicate a need to improve visibility, recognition or surveillance.',
        users: 'Residents, pedestrians and other users identified by the local evidence.',
        controls: 'Review the type, location, timing and reliability of crime evidence. Consider recognition, sightlines, concealment, lighting distribution, glare and coordination with surveillance. Select lighting and non-lighting measures to address the actual task; crime concerns do not automatically justify a higher class.',
        residual: 'Check the proposed measures against the recorded concern and seek relevant stakeholder input. Record any issue lighting cannot resolve.'
    },
    vandalism: {
        hazard: 'Damage or interference with lighting equipment may reduce service or create unsafe equipment conditions.',
        users: 'Road/path users and people maintaining or accessing damaged equipment.',
        controls: 'Consider robust equipment, suitable protection, fixing/access arrangements, location and maintainability. Review shielding or louvres for mechanical suitability as well as optical performance. Coordinate the response to faults or damage with the asset owner.',
        residual: 'Confirm equipment suitability and maintenance arrangements; record any remaining exposure to damage and necessary design action.'
    },
    collisions: {
        hazard: 'Night-time collisions or near misses may indicate an unresolved visual task, visibility or layout problem.',
        users: 'The road users and movements identified in the collision / near-miss evidence.',
        controls: 'Check collision location, timing, circumstances and data quality. Identify whether lighting could address the actual task. Review sightlines, glare, contrast, alignment, crossings and other contributing factors. Consider non-lighting measures and specialist input; do not infer a class uplift from counts alone.',
        residual: 'Document the connection between the evidence and proposed measures. Verify the relevant lighting criteria and retain any issue requiring highway-safety review.'
    },
    background: {
        hazard: 'Surrounding brightness differs from the moderate ambient-luminance assumption in the traffic-route table.',
        users: 'Drivers and other users whose adaptation or object visibility could be affected.',
        controls: 'Review actual night-time surroundings and adaptation, including strong off-road light or unusually dark backgrounds. Check glare, transitions and the appropriate table/risk-review response rather than adding an arbitrary score.',
        residual: 'Confirm the selected class and transition arrangements against site evidence and record any outstanding external-lighting issue.'
    },
    guidance: {
        hazard: 'Poor visual guidance may make alignment, junctions or obstacles difficult to interpret during darkness.',
        users: 'Drivers and other users relying on clear route guidance.',
        controls: 'Identify bends, changes in alignment, signs, markings and competing light. Review lighting continuity and layout together with non-lighting guidance improvements. Consider a justified class/criterion adjustment only where appropriate.',
        residual: 'Check the proposed arrangement against the actual approach task and identify any remaining guidance issue.'
    },
    heavy: {
        hazard: 'Heavy-vehicle activity may increase visual complexity or obscure other traffic and signs.',
        users: 'Permitted motorway/mainline traffic and heavy-vehicle drivers.',
        controls: 'Review the observed vehicle mix, overtaking and approach tasks, sign visibility and glare. Consider appropriate lighting distribution and geometry; assess the recorded risk rather than automatically increasing the class.',
        residual: 'Verify mainline visibility and any relevant approach/merge calculations, recording unresolved geometry or traffic-management matters.'
    },
    interchange: {
        hazard: 'Merge/diverge and interchange movements may create demanding guidance and visibility tasks.',
        users: 'Permitted motorway traffic at the identified mainline interchange features.',
        controls: 'Identify lane-changing, signs, geometry and most onerous night-time operation. Review lighting continuity, guidance, glare and relevant interfaces; assess separate facilities separately.',
        residual: 'Confirm the proposed mainline arrangement and interface requirements; record any unresolved sign, alignment or safety issue.'
    },
    cctv: {
        hazard: 'The lighting arrangement may not support the intended CCTV identification or surveillance task.',
        users: 'People relying on the agreed surveillance arrangements and relevant operators.',
        controls: 'Coordinate camera positions, required task, views, spectral response and exposure with the CCTV designer. Review vertical light, contrast, uniformity and glare. Do not assume the road-class result establishes CCTV performance.',
        residual: 'Verify the agreed camera/lighting requirements with the relevant designer or operator and record remaining checks.'
    },
    competing: {
        hazard: 'Competing shopfront or off-road lighting may affect adaptation, glare or visibility within the assessed area.',
        users: 'People moving through the area and drivers where relevant.',
        controls: 'Record the sources and periods of competing light. Review luminance contrast, glare, orientation and transitions; coordinate with other owners where possible. Avoid simply increasing output to compete with external light.',
        residual: 'Check relevant observer views and operating conditions; record external sources outside the project’s control.'
    },
    amenities: {
        hazard: 'Amenities may concentrate movement, congregation or crossing activity during darkness.',
        users: 'Visitors, pedestrians, cyclists and relevant vehicle users near the destinations.',
        controls: 'Identify opening hours, activity levels, desire lines and interfaces with vehicles. Review local coverage, recognition and glare; split spaces into separate assessment areas where their tasks differ.',
        residual: 'Verify the relevant peak conditions and calculation areas; record any crowding, access or management issue.'
    },
    slow: {
        hazard: 'Slow-moving vehicles or mobility scooters may interact with pedestrians or faster traffic.',
        users: 'Mobility-scooter users, pedestrians, cyclists and relevant drivers.',
        controls: 'Identify actual paths, shared surfaces and speed differences. Review visibility, obstacles, access and contrast, with appropriate illumination and non-lighting measures.',
        residual: 'Confirm coverage at the interaction points and record any access or layout issue requiring further action.'
    }
};

function optionLabel(key, value) {
    const map = {
        wetScope: {
            'Required by project': 'Yes — assess both dry and wet conditions',
            'Not required by project': 'No — normal UK dry-road calculation basis',
            'Unknown': 'Not yet confirmed'
        },
        ulScope: {
            'Long uninterrupted section': 'Yes — a long, uninterrupted stretch',
            'Not applicable': 'No — this requirement is not applicable',
            'Unknown': 'Not yet confirmed'
        }
    };
    return map[key]?.[value] || value;
}

function conditionalReasons(a) {
    const p = a.params,
        c = selectedClass(a),
        f = c[0],
        lines = [];
    if (!c && !DIRECT[a.type]) return ['Complete the table selection to generate the reasons for the applicable requirements.'];
    if (DIRECT[a.type]) lines.push(`The selected area uses direct requirements from BS 5489-1:2020 Table ${assessment(a).table}; no M/P/C class is assigned by that table.`);
    if (f === 'M') {
        lines.push(`${c} uses road-surface luminance and the associated M-class performance criteria.`);
        lines.push(p.ulScope === 'Long uninterrupted section' ? 'Longitudinal uniformity applies because the area has been identified as a long, uninterrupted stretch of road.' : p.ulScope === 'Not applicable' ? 'Longitudinal uniformity is recorded as not applicable to this area; confirm that the layout does not require assessment as a long uninterrupted section.' : 'Whether longitudinal uniformity applies has not yet been confirmed.');
        lines.push(p.wetScope === 'Required by project' ? 'An additional wet-road assessment is required by the recorded project choice. Calculate both dry and wet conditions using appropriate surface-reflection data.' : p.wetScope === 'Not required by project' ? 'No additional wet-road assessment has been selected. The assessment uses the normal UK dry-road calculation basis described in BS 5489-1:2020, 7.1.2 Note 5.' : 'Whether the authority/project requires an additional wet-road assessment has not yet been confirmed.');
        lines.push(p.reiScope === 'No separately assessed adjacent traffic areas' ? 'The edge illuminance ratio (REI) applies because no adjacent traffic areas have their own separately specified lighting requirements.' : p.reiScope === 'Adjacent traffic areas have own requirements' ? 'REI is recorded as not applicable because the adjacent traffic areas have their own lighting requirements; assess those areas against their specified criteria.' : 'The applicability of REI has not yet been confirmed; establish whether adjacent traffic areas have their own requirements.');
    } else if (f === 'P' || f === 'C') {
        lines.push(`${c} uses the maintained horizontal illuminance criteria and associated conditions in BS EN 13201-2:2015.`);
        lines.push(p.glareMethod === 'TI calculation' ? 'Disability glare will be assessed using TI calculations for the relevant observer positions and directions.' : p.glareMethod === 'Installed intensity class' ? `Installed luminous-intensity control is selected as the glare route${p.intensityClass?' ('+p.intensityClass+')':''}; verify the selected class in the actual installed orientation.` : 'The disability-glare assessment route has not yet been established.');
        if (p.discomfortClass) lines.push(`Additional discomfort-glare control ${p.discomfortClass} is specified; it does not replace disability-glare assessment.`);
        if (f === 'P') lines.push(p.sourceMode === 'Benchmark white source confirmed' ? 'The benchmark white-light source suitability has been confirmed by the designer; no routine S/P adjustment is applied.' : p.sourceMode === 'Exceptional source / review required' ? 'The source has been identified for exceptional review under BS 5489 A.1.1(d). Record the specialist outcome; this tool does not calculate that adjustment.' : 'P-class source suitability has not yet been confirmed.');
    }
    if (p.recognition === 'Yes') lines.push(p.recognitionMode ? `Recognition has been identified as a requirement. The selected approach is ${p.recognitionMode}${p.supplementClass&&p.recognitionMode.startsWith('Supplementary')?' '+p.supplementClass:''}; use the recorded assessment plane, height and orientations.` : 'Recognition is required, but the supplementary criterion and assessment plane have not yet been established.');
    else if (reviewQuestions(a.type, p).some(q => q.key === 'recognition')) lines.push(p.recognition === 'No' ? 'No supplementary recognition requirement has been identified in the recorded answers.' : 'The need for supplementary recognition criteria has not yet been established.');
    return lines;
}

function generatedReasonsHTML(a) {
    return `<div class="generated-note"><h3>Reasons generated from your selections</h3><ul>${conditionalReasons(a).map(v=>'<li>'+escapeHTML(v)+'</li>').join('')}</ul><p class="hint">Updates automatically when the answers change. Review the explanation and add any site-specific notes below.</p></div>`;
}

function riskTemplate(a, factor) {
    const p = a.params,
        t = RISK_TEMPLATES[factor] || {
            hazard: 'An identified local condition may affect the visual task or design.',
            users: 'Users of the assessed area.',
            controls: 'Review the local condition and select justified lighting and non-lighting measures.',
            residual: 'Check the design and record remaining issues.'
        };
    return {
        hazard: t.hazard,
        users: t.users,
        evidence: `DRAFT — check the site evidence. Area: ${a.name||'not yet named'}. Period: ${p.operatingPeriod||'not yet recorded'}.\n${factor==='ecology'?'Ecology/planning evidence: '+(p.ecologyEvidence||'Not yet supplied; obtain the relevant advice and project limits.'):'Recorded selection evidence: '+(p.evidence||'Not yet supplied; add observations, surveys or relevant references.')}\nConfirm how this evidence relates to this particular risk.`,
        controls: t.controls,
        residual: t.residual,
        owner: ''
    };
}

function syncRiskDrafts(a) {
    if (!TYPES[a.type]) return false;
    let changed = false;
    const factors = flaggedQuestions(a).map(q => q.key);
    if (a.params.ecology === 'Yes') factors.push('ecology');
    const excluded = a.params.suppressedRisks.split(',').filter(Boolean);
    for (const factor of factors) {
        if (excluded.includes(factor)) continue;
        let r = a.risks.find(v => v.factor === factor);
        const draft = riskTemplate(a, factor);
        if (!r) {
            if (a.risks.length >= 100) continue;
            r = {
                ...newRisk(factor),
                ...draft,
                autoValues: {
                    ...draft
                },
                templateVersion: '09'
            };
            a.risks.push(r);
            changed = true;
            continue;
        }
        const old = r.autoValues || {};
        const wasLegacy = !r.autoValues;
        for (const [key, value] of Object.entries(draft)) {
            if (!r[key] || (Object.hasOwn(old, key) && r[key] === old[key])) {
                if (r[key] !== value) {
                    r[key] = value;
                    changed = true;
                    if (r.status !== 'Open') r.status = 'Open';
                }
            }
        }
        if (wasLegacy || Object.keys(draft).some(k => old[k] !== draft[k])) {
            r.autoValues = {
                ...draft
            };
            r.templateVersion = '09';
            changed = true;
        }
    }
    if (a.params.ecology === 'Yes') {
        const eco = a.risks.find(v => v.factor === 'ecology'),
            draft = eco?.controls || RISK_TEMPLATES.ecology.controls;
        if (!a.params.ecologyMeasures || a.params.ecologyMeasures === a.params.ecologyMeasuresDraft) {
            if (a.params.ecologyMeasures !== draft) {
                a.params.ecologyMeasures = draft;
                changed = true;
            }
        }
        if (a.params.ecologyMeasuresDraft !== draft) {
            a.params.ecologyMeasuresDraft = draft;
            changed = true;
        }
    }
    return changed;
}

function syncAllDrafts() {
    let changed = false;
    for (const a of state.areas)
        if (syncRiskDrafts(a)) changed = true;
    return changed;
}

function seedRisks() {
    syncAllDrafts();
    save();
    render();
    toast('Draft risks are up to date. Your edits have been retained.');
}

function riskMissing(r) {
    const labels = {
        hazard: 'hazard / visual task',
        users: 'people affected',
        evidence: 'evidence / existing controls',
        controls: 'proposed measures and checks',
        residual: 'remaining issue / further action'
    };
    const missing = Object.keys(labels).filter(k => !r[k].trim()).map(k => labels[k]);
    if (r.status === 'Action agreed' && !r.owner.trim()) missing.push('person responsible for the outstanding action');
    return missing;
}

function riskStatusLabel(r) {
    return RISK_STATUS_LABELS[r.status] || r.status;
}

function openActions(a) {
    return a.risks.filter(r => r.status === 'Action agreed');
}

function riskRegister(a) {
    const flagged = new Set(flaggedQuestions(a).map(q => q.key));
    if (a.params.ecology === 'Yes') flagged.add('ecology');
    return `<div id="risk-register">${card('Lighting-design risk assessment','Relevant answers automatically create editable draft assessments. Suggested measures need designer review; they are not automatically selected or verified.',`<div class="actions no-print"><button data-action="seed-risks">Refresh draft suggestions</button><button data-action="restore-risks">Restore removed automatic drafts</button><button data-action="add-risk">+ Add site-specific risk</button></div>${a.risks.map((r,i)=>`<section class="risk-item"><div class="risk-heading"><h3>Risk ${i+1}${r.factor?' · '+escapeHTML(r.factor):''}</h3><button class="no-print" data-remove-risk="${r.id}">Remove risk</button></div>${r.factor&&!flagged.has(r.factor)?'<p class="notice">This factor is no longer flagged by the current answers. Its assessment has been retained; review its relevance or remove it.</p>':''}<p class="hint">${escapeHTML(riskStatusLabel(r))}. All text is editable. Confirm the actual evidence and chosen measures before recording your review.</p><div class="fields">${riskField(r,'hazard','Hazard / visual task','Example: parked vehicles conceal pedestrians approaching a crossing.')}${riskField(r,'users','People affected','Example: pedestrians, cyclists and drivers using this part of the road.')}${riskField(r,'evidence','Evidence / existing controls','Draft references come from your answers. Confirm the observations or report; the app does not invent survey findings.')}${riskField(r,'controls','Proposed measures and checks','Edit the suggested options to describe the measures selected for this design and how they will be checked.')}${riskField(r,'residual','Remaining issue / further action','Explain any remaining design issue or state why no further design-stage action is needed.')}${riskField(r,'status','Assessment / action status','A reviewed assessment can retain an outstanding action. Do not mark it closed just to clear a warning.',['Open','Action agreed','Reviewed / closed'])}${r.status==='Action agreed'?riskField(r,'owner','Person responsible for any outstanding action','Required only when an action remains. Example: lighting designer, ecologist or developer. No review date is required.'):'<p class="hint full">No responsible person is required unless an outstanding action is recorded.</p>'}</div>${riskMissing(r).length?'<p class="notice">Missing: '+riskMissing(r).map(escapeHTML).join('; ')+'.</p>':''}</section>`).join('')||'<p class="small">No answers currently flag an automatic risk. You can add a site-specific assessment.</p>'}${a.params.suppressedRisks?'<p class="hint">Automatic factors removed by the designer: '+escapeHTML(a.params.suppressedRisks)+'. Explain exclusions in the overall conclusion.</p>':''}<div class="fields">${field('riskConclusion','Overall risk-review conclusion','Explain the chosen lighting requirements, the measures selected and any remaining actions. If no further risks are identified, record that conclusion.',null,true,'textarea')}${field('riskReviewed','Designer risk-review status','A completed design-stage review can include documented outstanding actions.',['Draft / incomplete','Reviewed by designer'])}</div><p class="hint">Suggested measures, the designer’s selected measures and verification evidence are distinct. Completing this review does not assert that installation calculations or site checks have been completed.</p>`)}</div>`;
}

function statusPanel(a) {
    const issues = recordIssues(a),
        current = decisionCurrent(a),
        actions = openActions(a);
    const title = current && !issues.length ? (actions.length ? 'Assessment recorded — actions outstanding' : 'Designer assessment recorded') : current ? 'Selection recorded — assessment needs attention' : a.params.decisionStamp ? 'Decision needs review after input changes' : 'Draft — decision not yet recorded';
    return `<div class="status-panel ${issues.length?'pending':'ready'}"><strong>${title}</strong><p>${issues.length?issues.length+' assessment item(s) need attention.':'Required assessment entries are complete.'}${!current?' Use “Record designer selection” after reviewing the current inputs.':''}</p>${issues.length?'<details open><summary>Missing information or review still needed</summary><ul>'+issues.map(v=>'<li>'+escapeHTML(v)+'</li>').join('')+'</ul></details>':''}${actions.length?'<div class="action-summary"><strong>'+actions.length+' documented outstanding action(s)</strong><ul>'+actions.map(r=>'<li>'+escapeHTML(r.hazard)+' — '+escapeHTML(r.owner||'responsible person not recorded')+'</li>').join('')+'</ul><p class="hint">These actions remain visible without requiring you to mark the risk closed.</p></div>':''}<p class="hint">Calculated performance, ecological acceptance and authority approval remain separate records.</p></div>`;
}

function riskReport(a) {
    return a.risks.length ? a.risks.map((r, i) => `<section class="risk-item"><h4>Risk ${i+1}: ${escapeHTML(r.hazard||'Unspecified')}</h4>${table(['Item','Assessment'],[['People affected',r.users],['Evidence / existing controls',r.evidence],[r.status==='Open'?'Suggested measures — not yet reviewed':'Designer-selected measures and checks',r.controls],['Remaining issue / further action',r.residual],['Person responsible for outstanding action',r.status==='Action agreed'?r.owner:r.status==='Reviewed / closed'?'No further action identified / no person required':'To confirm when the draft is reviewed'],['Assessment / action status',riskStatusLabel(r)]].map(row=>row.map(v=>escapeHTML(v||'Not recorded'))))}</section>`).join('') : '<p>No individual risk items recorded.</p>';
}

const NEW_PARAMS = () => ({
    ...Object.fromEntries([...EXTRA_PARAMS, ...EXTRA09].map(k => [k, ''])),
    tableChoice: '',
    adjustment: '',
    alternative: '',
    justification: '',
    decisionStamp: '',
    recordedAt: '',
    structure: '',
    enclosure: '',
    period: '',
    context: '',
    usage: '',
    approachBasis: '',
    approachConfirmed: '',
    barrier: '',
    speed: '',
    layout: '',
    density: '',
    method: '',
    adt: '',
    capacity: '',
    band: '',
    flow: '',
    zone: '',
    zoneBasis: '',
    movement: '',
    approach1: '',
    approach2: '',
    confirmed: '',
    boundary: '',
    evidence: '',
    notes: '',
    function: '',
    parking: '',
    bus: '',
    crossing: '',
    mixed: '',
    school: '',
    calming: '',
    recognition: '',
    crime: '',
    cctv: '',
    competing: '',
    amenities: '',
    slow: '',
    background: '',
    guidance: '',
    heavy: '',
    interchange: ''
});
const newArea = () => ({
    id: id(),
    name: '',
    type: '',
    params: NEW_PARAMS(),
    risks: [],
    history: []
});
const fresh = () => ({
    version: 9,
    project: {
        ...Object.fromEntries(EXTRA_PROJECT.map(k => [k, ''])),
        name: '',
        reference: '',
        location: '',
        designer: '',
        date: '',
        description: ''
    },
    areas: [newArea()]
});
let state = fresh();
let activeArea = 0;
let page = 'overview';
let toastTimer;
let startupWarning = '';

function validateRisks(items) {
    if (!Array.isArray(items) || items.length > 100) throw Error('Invalid risk list');
    const ids = new Set();
    return items.map(v => {
        if (!v || typeof v.id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(v.id) || ids.has(v.id) || typeof v.factor !== 'string') throw Error('Invalid risk');
        ids.add(v.id);
        for (const k of RISK_FIELDS)
            if (typeof v[k] !== 'string') throw Error('Invalid risk field');
        if (!['Open', 'Action agreed', 'Reviewed / closed'].includes(v.status)) throw Error('Invalid risk status');
        const output = Object.fromEntries(['id', 'factor', ...RISK_FIELDS].map(k => [k, v[k]]));
        if (v.autoValues !== undefined) {
            if (!v.autoValues || typeof v.autoValues !== 'object' || Array.isArray(v.autoValues)) throw Error('Invalid draft metadata');
            output.autoValues = {};
            for (const [k, value] of Object.entries(v.autoValues)) {
                if (!RISK_FIELDS.includes(k) || typeof value !== 'string') throw Error('Invalid draft field');
                output.autoValues[k] = value;
            }
            output.templateVersion = typeof v.templateVersion === 'string' ? v.templateVersion : '';
        }
        return output;
    });
}

function validateHistory(items) {
    if (!Array.isArray(items) || items.length > 20) throw Error('Invalid history');
    return items.map(v => {
        for (const k of ['at', 'designer', 'initial', 'selected', 'reason', 'snapshot'])
            if (typeof v?.[k] !== 'string') throw Error('Invalid history entry');
        if (!Array.isArray(v.issues) || v.issues.some(i => typeof i !== 'string')) throw Error('Invalid history issues');
        return {
            at: v.at,
            designer: v.designer,
            initial: v.initial,
            selected: v.selected,
            reason: v.reason,
            snapshot: v.snapshot,
            issues: [...v.issues]
        };
    });
}

function validateProject(data) {
    if (!data || ![5, 6, 7, 8, 9].includes(data.version) || !data.project || !Array.isArray(data.areas) || !data.areas
        .length || data.areas.length > 100) throw Error('Unsupported project');
    const output = fresh();
    for (const key of Object.keys(output.project)) {
        if (data.version < 8 && EXTRA_PROJECT.includes(key) && data.project[key] === undefined) continue;
        if (typeof data.project[key] !== 'string') throw Error('Invalid project field');
        output.project[key] = data.project[key];
    }
    const ids = new Set();
    output.areas = data.areas.map(area => {
        if (!area || typeof area.id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(area.id) || ids.has(area
                .id) || typeof area.name !== 'string' || typeof area.type !== 'string' || (area.type &&
                !TYPES[area.type]) || !area.params) throw Error('Invalid area');
        ids.add(area.id);
        const params = NEW_PARAMS();
        for (const key of Object.keys(params)) {
            if (data.version < 9 && EXTRA09.includes(key) && area.params[key] === undefined) continue;
            if (data.version < 8 && EXTRA_PARAMS.includes(key) && area.params[key] === undefined) continue;
            if (data.version < 7 && ['structure', 'enclosure', 'period', 'context', 'usage', 'approachBasis', 'approachConfirmed', 'barrier'].includes(key) && area.params[key] === undefined) continue;
            if (data.version === 5 && ['tableChoice', 'adjustment', 'alternative', 'justification', 'decisionStamp', 'recordedAt'].includes(key) && area.params[key] === undefined) continue;
            if (typeof area.params[key] !== 'string') throw Error('Invalid area field');
            params[key] = area.params[key];
        }
        const risks = data.version < 8 ? [] : validateRisks(area.risks);
        const history = data.version < 8 ? [] : validateHistory(area.history);
        return {
            risks,
            history,
            id: area.id,
            name: area.name,
            type: area.type,
            params
        };
    });
    return output;
}
try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('lumen-annex-a-focused-v08') || localStorage.getItem('lumen-annex-a-focused-v07') || localStorage.getItem('lumen-annex-a-focused-v06') || localStorage.getItem('lumen-annex-a-focused-v05');
    if (saved) state = validateProject(JSON.parse(saved));
} catch (error) {
    startupWarning =
        'Saved data could not be loaded. It has been left untouched. Export your work if browser saving is unavailable.';
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        $('#save-status').textContent = 'Saved in this browser';
    } catch (error) {
        $('#save-status').textContent = 'Not saved — export project';
    }
}

function toast(message) {
    clearTimeout(toastTimer);
    const element = $('#toast');
    element.className = 'toast';
    element.textContent = message;
    toastTimer = setTimeout(() => {
        element.className = '';
        element.textContent = '';
    }, 5000);
}
const area = () => state.areas[activeArea];

function field(key, label, hint, options = null, full = false, type = 'text', project = false) {
    const value = project ? state.project[key] : key === 'name' ? area().name : area().params[key];
    const controlId = (project ? 'project-' : 'area-') + key;
    const attributes =
        `id="${controlId}" data-key="${key}" ${project ? 'data-project="true"' : ''} aria-describedby="${controlId}-hint"`;
    const control = options ?
        `<select ${attributes}><option value="">Select / not yet known</option>${options.map(item => `<option value="${escapeHTML(item)}" ${value === item ? 'selected' : ''}>${escapeHTML(optionLabel(key,item))}</option>`).join('')}</select>` :
        type === 'textarea' ?
        `<textarea ${attributes}>${escapeHTML(value)}</textarea>` :
        `<input ${attributes} type="${type}" value="${escapeHTML(value)}" ${type === 'number' ? 'min="0" step="any"' : ''}>`;
    return `<div class="field ${full ? 'full' : ''}"><label for="${controlId}">${label}</label>${control}<p class="hint" id="${controlId}-hint">${hint}</p></div>`;
}

function table(headers, rows, chosenRow = -1, chosenColumn = -1) {
    return `<div class="tablewrap"><table><thead><tr>${headers.map(text => `<th scope="col">${text}</th>`).join('')}</tr></thead><tbody>${rows.map((row, i) => `<tr class="${chosenRow === i ? 'chosen' : ''}">${row.map((cell, j) => `<${j ? 'td' : 'th'} ${j ? '' : 'scope="row"'} class="${chosenRow === i && j > 0 && chosenColumn === j ? 'chosen-cell' : ''}">${cell}</${j ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function card(title, subtitle, content) {
    return `<section class="card"><h2>${title}</h2><p class="small muted">${subtitle}</p>${content}</section>`;
}

function pageHead(number, title, text) {
    return `<div class="pagehead"><p class="eyebrow muted">${number} / BS 5489-1:2020</p><h1>${title}</h1><p class="muted">${text}</p></div>`;
}

function baseOverview() {
    return pageHead('01', 'Start with the project.',
            'Record the project basis, assess each relevant area and prepare the class recommendation, risk review and design brief.'
        ) +
        `<section class="card hero"><span class="badge">PROJECT OVERVIEW + ANNEX A</span><h2 style="margin-top:15px">The right table, in the right place.</h2><p>Choose the area by its function and users. Read the relevant descriptions and table notes, then record the parameters that lead to a starting lighting class.</p></section>` +
        card('Project details', 'These identify the assessment and appear when printing it.',
            `<div class="fields">${
      field('name', 'Project name', 'A recognisable scheme or road name.', null, false, 'text', true) +
      field('reference', 'Project reference', 'Your project or job reference.', null, false, 'text', true) +
      field('location', 'Location', 'Town and extent of the scheme.', null, false, 'text', true) +
      field('designer', 'Prepared by', 'Designer completing this initial assessment.', null, false, 'text', true) +
      field('date', 'Assessment date', 'Date of this assessment.', null, false, 'date', true) +
      field('description', 'Purpose and scope', 'What is being assessed, its limits and why lighting is being considered.', null, true, 'textarea', true)
    }</div><div class="actions"><button class="primary" data-action="selection">Choose road / area →</button><button data-action="import">Open a saved project</button><button data-action="example">Load worked example</button><button data-action="reset">New project</button></div>`
        ) +
        `<div class="info">“Open a saved project” reopens a JSON file previously exported from this tool. “Load worked example” replaces the current entries with a fictional residential, traffic-route and junction examples after confirmation. This prototype uses the supplied BS 5489-1:2020 for table selection, including direct requirements for structures, arcades and outdoor car parks. It records the <strong>initial table class</strong> and relevant risk-review factors. It also records a reasoned designer adjustment. Complete the structured risk review and project brief after selecting the table. Detailed photometric verification remains a separate design stage.</div>`;
}

function reviewQuestions(type, p) {
    const common = {
        collisions: ['Night-time collision / near-miss concern', 'Record location, period, data source and whether lighting addresses the identified visual task.'],
        vandalism: ['Vandalism / damage concern', 'Record local evidence and appropriate design/maintenance measures.'],
        background: ['Surrounding brightness',
            'The initial traffic-route tables assume moderate ambient luminance.', ['Low', 'Moderate',
                'High', 'Unknown'
            ]
        ],
        guidance: ['Visual guidance',
            'The traffic-route tables assume good guidance; record differences.', ['Good', 'Poor',
                'Unknown'
            ]
        ],
        mixed: ['Mixed users / vehicle speeds',
            'Consider interaction between slow-moving vehicles, cyclists and pedestrians.'
        ],
        parking: ['Parked vehicles',
            'Parking can obscure users and increase visual task complexity.'
        ],
        bus: ['Bus stops', 'Consider waiting, boarding and crossing movements.'],
        crossing: ['Pedestrian crossings',
            'Identify crossings needing their own assessment and visibility checks.'
        ],
        school: ['School entrances',
            'Assess the actual activity during darkness and local visibility demands.'
        ],
        calming: ['Traffic-calming features',
            'Assess the visual task at the feature and its approaches.'
        ],
        recognition: ['Need to recognise people / intent',
            'Consider supplementary vertical illumination where justified.'
        ],
        heavy: ['Significant heavy-vehicle activity',
            'Record permitted motor traffic and its effect on the driving task.'
        ],
        interchange: ['Interchange / merge-diverge features',
            'Record relevant geometry, signs and lane-changing demands.'
        ],
        crime: ['Crime / personal-safety concern',
            'Record local evidence and the visibility or surveillance need.'
        ],
        cctv: ['CCTV requirements', 'Consider relevant camera and recognition requirements.'],
        competing: ['Competing shopfront / off-road light',
            'Consider other lighting in the surrounding visual field.'
        ],
        amenities: ['Local amenities / destinations',
            'Record shops, public houses and other activity generators.'
        ],
        slow: ['Slow-moving vehicles / mobility scooters',
            'Assess the actual movements within the area.'
        ]
    };
    let keys = [];
    if (type === 'motorway') keys = ['background', 'guidance', 'heavy', 'interchange'];
    if (type === 'traffic') keys = ['background', 'guidance', 'mixed', 'parking', 'bus', 'crossing'];
    if (type === 'residential') keys = ['mixed', 'parking', 'school', 'calming', 'recognition'];
    if (type === 'footpath') keys = ['recognition'];
    if (type === 'cycle') keys = ['mixed', 'recognition'];
    if (type === 'conflict') keys = ['crossing', 'mixed'];
    if (type === 'town') {
        keys = ['crime', 'recognition', 'cctv', 'competing', 'amenities', 'slow'];
        if (['Vehicles with separate footways', 'Vehicles and pedestrians sharing a surface'].includes(p
                .movement)) keys.push('parking', 'mixed');
    }
    if (type === 'structure') keys = ['crime', 'recognition', 'cctv'];
    if (type === 'carpark') keys = ['crime', 'recognition', 'cctv', 'mixed'];
    if (type === 'arcade') keys = ['crime', 'recognition', 'cctv'];
    if (TYPES[type]) keys.push('collisions');
    if (TYPES[type] && type !== 'motorway') {
        if (!keys.includes('crime')) keys.push('crime');
        keys.push('vandalism');
    }
    if (type === 'cycle') common.mixed = ['Mixed walking / cycling use',
        'Consider interaction between pedestrians and cyclists within this route.'
    ];
    return keys.map(key => ({
        key,
        label: common[key][0],
        hint: common[key][1],
        options: common[key][2] || YES_NO
    }));
}

function trafficBand(p) {
    if (p.method === 'Designer-selected band') return M_BANDS.includes(p.band) ? p.band : '';
    const input = p.method === 'ADT' ? p.adt : p.method === 'Lane-capacity percentage' ? p.capacity :
        '';
    if (input === '' || !Number.isFinite(Number(input)) || Number(input) < 0) return '';
    const value = Number(input);
    if (p.method === 'ADT') return value > 40000 ? M_BANDS[0] : value < 7000 ? M_BANDS[2] : M_BANDS[
        1];
    if (value > 100 || !['Dual carriageway', 'Single carriageway'].includes(p.layout)) return '';
    const dual = p.layout === 'Dual carriageway';
    return value > (dual ? 65 : 45) ? M_BANDS[0] : value < (dual ? 35 : 15) ? M_BANDS[2] : M_BANDS[1];
}

function baseAssessment(a) {
    const p = a.params;
    const result = {
        table: '',
        className: '',
        row: -1,
        column: -1,
        reasons: [],
        gaps: [],
        flags: [],
        unanswered: []
    };
    const type = a.type;
    const speed = Number(p.speed);
    if (!TYPES[type]) {
        result.gaps.push('Choose the road / area type.');
        return result;
    }
    if (type === 'motorway' || type === 'traffic') {
        result.table = type === 'motorway' ? 'A.2' : ['A.2', 'A.3'].includes(p.tableChoice) ? p.tableChoice : p.speed && Number.isFinite(speed) ? speed > 40 ?
            'A.2' : 'A.3' : '';
        if (!p.speed || !Number.isFinite(speed) || speed <= 0) result.gaps.push(
            'Select the applicable speed / review status.');
        if (type === 'motorway' && !['60', '70'].includes(p.speed)) result.gaps.push(
            'This motorway speed/operation needs explicit scope review; Table A.3 is not selected automatically.'
        );
        if (type === 'traffic' && p.tableChoice && p.speed && Number.isFinite(speed) && p.tableChoice !== (speed > 40 ? 'A.2' : 'A.3')) result.gaps.push('The recorded speed does not match the selected table range.');
        if (type === 'traffic' && speed >= 60) result.gaps.push(
            'Review the stated scope of A.3.1.2 for this non-motorway high-speed case before selecting a class.'
        );
        if (!['Dual carriageway', 'Single carriageway'].includes(p.layout)) result.gaps.push(
            'Confirm carriageway arrangement.');
        if (type === 'motorway' && p.layout !== 'Dual carriageway') result.gaps.push(
            'The implemented motorway mainline route requires confirmation of dual-carriageway geometry.'
        );
        if (p.layout === 'Dual carriageway' && !['High', 'Low'].includes(p.density)) result.gaps.push(
            'Select junction/interchange density.');
        const band = trafficBand(p);
        if (!band) result.gaps.push(
            'Choose a traffic-band method and enter its valid supporting input.');
        result.row = M_BANDS.indexOf(band);
        result.column = p.layout === 'Single carriageway' ? 3 : p.density === 'High' ? 1 : p.density ===
            'Low' ? 2 : -1;
        if (!result.gaps.length) {
            const base = result.table === 'A.2' ? 2 : 3;
            result.className = 'M' + (base + result.row + (result.column === 2 ? 1 : 0));
            result.reasons.push(`${TYPES[type].name}; ${speed} mph → Table ${result.table}.`,
                `${p.layout}; ${p.layout === 'Dual carriageway' ? p.density.toLowerCase() + ' junction/interchange density' : 'single-carriageway column'}.`,
                `${band} traffic flow, using ${p.method}${p.method === 'ADT' ? ' (' + p.adt + ' vehicles/day)' : p.method === 'Lane-capacity percentage' ? ' (' + p.capacity + '%)' : ''}.`
            );
        }
    } else if (['residential', 'footpath', 'cycle'].includes(type)) {
        result.table = 'A.5';
        if (!FLOW[p.flow]) result.gaps.push(
            'Choose Busy, Normal or Quiet using the displayed descriptions.');
        if (!['E1', 'E2', 'E3', 'E4'].includes(p.zone)) result.gaps.push(
            'Confirm an E1–E4 environment. E0 / unconfirmed environments require review.');
        if (type === 'residential' && (!p.speed || !Number.isFinite(Number(p.speed)) || Number(p
                .speed) <= 0 || Number(p.speed) > 30)) result.gaps.push(
            'Confirm a subsidiary road at up to 30 mph, or review the area category.');
        result.row = ['Busy', 'Normal', 'Quiet'].indexOf(p.flow);
        result.column = type === 'residential' ? ['E1', 'E2'].includes(p.zone) ? 1 : ['E3', 'E4']
            .includes(p.zone) ? 2 : -1 : 1;
        if (!result.gaps.length) {
            const index = type === 'residential' ? ['E1', 'E2'].includes(p.zone) ? 1 : 2 : 0;
            result.className = [
                ['P5', 'P4', 'P3'],
                ['P5', 'P5', 'P4'],
                ['P6', 'P5', 'P4']
            ][result.row][index];
            result.reasons.push(`${TYPES[type].name} → Table A.5.`, `${p.flow}: ${FLOW[p.flow]}`, type ===
                'residential' ? `${p.speed} mph; environmental zone ${p.zone}.` :
                `Pedestrians/cyclists-only column; environmental zone ${p.zone}.`);
        }
    } else if (type === 'conflict') {
        result.table = 'A.4';
        const approaches = [p.approach1, p.approach2].filter(Boolean);
        if (p.confirmed !== 'Yes') result.gaps.push(
            'Confirm that this is a conflict area; table selection alone does not establish qualification.'
        );
        if (!approaches.length || approaches.some(value => !/^M[1-6]$/.test(value))) result.gaps.push(
            'Record the strongest relevant approaching M class.');
        if (!p.boundary.trim()) result.gaps.push(
            'Record the conflict-area boundary / drawing reference.');
        if (!result.gaps.length) {
            const strongest = Math.min(...approaches.map(value => Number(value[1])));
            result.row = strongest - 1;
            result.column = 1;
            result.className = 'C' + (strongest - 1);
            result.reasons.push(`Confirmed conflict-area assessment → Table A.4.`,
                `Recorded approach classes: ${approaches.join(', ')}. The strongest is M${strongest}.`,
                `Initial conflict-area class: ${result.className}.`);
        }
    } else if (type === 'town') {
        result.table = 'A.6';
        const arrangements = ['Pedestrian thoroughfare', 'Pedestrian-only space',
            'Vehicles with separate footways', 'Vehicles and pedestrians sharing a surface'
        ];
        result.row = arrangements.indexOf(p.movement);
        if (result.row < 0) result.gaps.push('Choose the movement arrangement.');
        if (!['Normal', 'High'].includes(p.flow)) result.gaps.push(
            'Choose Normal or High town-centre traffic flow.');
        if (!['E3', 'E4'].includes(p.zone)) result.gaps.push(
            'Confirm an E3/E4 town-centre environment or review applicability.');
        result.column = p.flow === 'Normal' ? 1 : p.flow === 'High' ? 2 : -1;
        if (!result.gaps.length) {
            const column = (p.flow === 'High' ? 2 : 0) + (p.zone === 'E4' ? 1 : 0);
            result.className = [
                ['P2', 'P1', 'P2', 'P1'],
                ['C4', 'C3', 'C3', 'C2'],
                ['C3', 'C2', 'C2', 'C1'],
                ['C2', 'C1', 'C1', 'C1']
            ][result.row][column];
            result.reasons.push(`${p.movement} → Table A.6.`,
                `${p.flow} flow in environmental zone ${p.zone}.`);
        }
    }
    const messages = {
        collisions: 'Review night-time collision evidence and the visual task before deciding on measures.',
        vandalism: 'Review vandalism evidence, resilience and maintenance response.',
        parking: 'Assess obscured users and task complexity from parked vehicles.',
        bus: 'Assess bus-stop waiting, boarding and crossing activity.',
        crossing: 'Check crossing-specific needs and the relevant assessment extent.',
        mixed: 'Review the interactions between the actual users and vehicle speeds.',
        school: 'Review visibility and activity at school entrances during darkness.',
        calming: 'Review the feature and approach visibility at traffic-calming measures.',
        recognition: 'Consider supplementary vertical illumination for recognition / personal safety.',
        crime: 'Review local crime evidence and the visibility or surveillance need.',
        cctv: 'Coordinate the relevant CCTV requirements.',
        competing: 'Assess competing shopfront or off-road lighting.',
        amenities: 'Review activity associated with local amenities.',
        slow: 'Review slow-moving vehicles and mobility-scooter movements.',
        heavy: 'Review the actual permitted heavy-vehicle mix.',
        interchange: 'Review interchange geometry, signs and merge/diverge visibility.'
    };
    for (const question of reviewQuestions(type, p)) {
        const value = p[question.key];
        if (!value || value === 'Unknown') result.unanswered.push(question.label);
        if (value === 'Yes' && messages[question.key]) result.flags.push(messages[question.key]);
        if (question.key === 'background' && ['Low', 'High'].includes(value)) result.flags.push(
            `Background brightness is ${value.toLowerCase()}, rather than the initial moderate assumption.`
        );
        if (question.key === 'guidance' && value === 'Poor') result.flags.push(
            'Visual guidance differs from the initial good-guidance assumption.');
    }
    if (!p.evidence.trim()) result.unanswered.push('Evidence and assessment period');
    return result;
}

function areaSelector() {
    const choices =
        `<div class="types">${Object.entries(TYPES).map(([key, type]) => `<button type="button" class="type-card ${area().type === key ? 'selected' : ''}" data-type="${key}" aria-pressed="${area().type === key}"><strong>${type.name}</strong><span>${type.description}</span><small>${type.family} · Table ${type.table}</small><span style="margin-top:8px">${type.help}</span></button>`).join('')}</div>`;
    if (!TYPES[area().type]) return card('Which road or area are you assessing?',
        'Choose by function and users. An A/B designation or the word “spine road” does not by itself select a lighting family.',
        choices);
    const type = TYPES[area().type];
    return card(type.name, type.description,
        `<div class="info">${type.help}</div><span class="badge">${type.family}</span><details class="no-print"><summary>Change road / area type — read the descriptions</summary>${choices}</details>`
    );
}

function baseParameterInputs(a) {
    const p = a.params;
    const type = a.type;
    let inputs = field('name', 'Assessment area name',
        'For example: main carriageway, residential access or junction.');
    if (type === 'motorway' || type === 'traffic') {
        inputs += field('speed', 'Applicable speed limit (mph)', type === 'motorway' ?
            'Motorway mainline remains on Table A.2. Unusual or lower/variable-speed operation is held for scope review.' :
            'This determines the traffic-route table: above 40 mph → A.2; at up to 40 mph → A.3.',
            type === 'motorway' ? ['60', '70', 'Variable / other — review'] : (p.tableChoice === 'A.2' ? ['50', '60', '70'] : p.tableChoice === 'A.3' ? ['20', '30', '40'] : ['20', '30', '40', '50', '60', '70']));
        inputs += field('layout', 'Carriageway arrangement',
            'Confirm the physical layout rather than the road designation.', type === 'motorway' ? [
                'Dual carriageway', 'Other — review'
            ] : ['Single carriageway', 'Dual carriageway', 'Other — review']);
        if (p.layout === 'Dual carriageway') inputs += field('density', type === 'motorway' ?
            'Interchange / junction density' : 'Junction density',
            'High: junction centres less than 3 km apart. Low: centres at least 3 km apart.', ['High',
                'Low'
            ]);
        inputs += field('method', 'Traffic-flow evidence method',
            'Use one justified basis; document the most demanding conditions during darkness.', ['ADT',
                'Lane-capacity percentage', 'Designer-selected band'
            ]);
        if (p.method === 'ADT') inputs += field('adt', 'Average daily traffic (vehicles/day)',
            'Annex A gives possible ADT indicators. Confirm their relevance to the night-time assessment.',
            null, false, 'number');
        if (p.method === 'Lane-capacity percentage') inputs += field('capacity',
            'Flow as percentage of lane capacity',
            'Use an appropriate capacity model and assessed period. Enter 0–100.', null, false, 'number'
        );
        if (p.method === 'Designer-selected band') inputs += field('band', 'Traffic-flow band',
            'Use the explanations below and record the supporting evidence.', M_BANDS);
    }
    if (type === 'residential') {
        inputs += field('speed', 'Subsidiary-road speed limit (mph)',
            'Table A.5’s road columns apply at up to 30 mph. Higher-speed routes need review of their function.',
            ['5', '10', '15', '20', '30', 'Above 30 — review']);
        inputs += field('function', 'Residential road role — context only',
            'A spine/access road may resemble Normal use; assess actual traffic activity rather than assigning a class from its name.',
            ['Estate access / spine road', 'Local estate access road',
                'Street mainly serving adjoining properties', 'Amenity frontage / other use'
            ]);
    }
    if (['residential', 'footpath', 'cycle'].includes(type)) {
        inputs += field('flow', 'Traffic / user flow for Table A.5',
            'Populated by the flow row selected above; revise here if needed.', ['Busy', 'Normal',
                'Quiet'
            ]);
    }
    if (['residential', 'footpath', 'cycle', 'town'].includes(type)) {
        inputs += field('zone', 'Environmental zone',
            'Confirm the lighting environment and record the basis; this is not the lighting class itself.',
            type === 'town' ? ['E3', 'E4', 'Other / unknown — review'] : ['E1', 'E2', 'E3', 'E4',
                'E0 / unknown — review'
            ]);
        inputs += field('zoneBasis', 'Basis for the environmental zone',
            'Record the authority designation or assessed context and neighbouring sensitive areas.');
    }
    if (type === 'conflict') {
        inputs += field('confirmed', 'Conflict-area qualification confirmed?',
            'Not every junction is a conflict area. Confirm this before using Table A.4.', YES_NO);
        inputs += field('approach1', 'Strongest relevant approaching traffic-route class',
            'Enter the strongest applicable M class, with evidence in the assessment notes.', ['M1',
                'M2', 'M3', 'M4', 'M5', 'M6'
            ]);
        inputs += field('approach2', 'Another approaching class (optional)',
            'Where relevant, add a second route. The stronger class governs the starting selection.', [
                'M1', 'M2', 'M3', 'M4', 'M5', 'M6'
            ]);
        inputs += field('boundary', 'Conflict-area extent / drawing reference',
            'Record its boundary and relevant approaches. This prototype does not determine the extent automatically.',
            null, true, 'textarea');
    }
    if (type === 'town') {
        inputs += field('movement', 'Town-centre movement arrangement',
            'Distinguish a pedestrian thoroughfare from a destination pedestrian space.', [
                'Pedestrian thoroughfare', 'Pedestrian-only space', 'Vehicles with separate footways',
                'Vehicles and pedestrians sharing a surface'
            ]);
        inputs += field('flow', 'Town-centre traffic flow',
            'Table A.6 uses Normal and High. It does not provide numerical thresholds here; record your evidence.',
            ['Normal', 'High']);
    }
    return card('Parameters populated from the table',
        'Your table selections appear here. Complete the remaining relevant inputs; values can also be revised here.',
        `<div class="fields">${inputs}</div>`);
}

function baseApplicableTable(a) {
    const p = a.params;
    const r = assessment(a);
    let title = '',
        subtitle = '',
        markup = '',
        notes = '';
    if (a.type === 'motorway' || a.type === 'traffic') {
        if (!r.table) return card('Select the speed range to identify the relevant traffic-route table',
            'No traffic-route table is assumed until the applicable speed is recorded.',
            '<p class="small">Choose the speed range above to display its table.</p>');
        title =
            `Table ${r.table} — traffic routes ${r.table === 'A.2' ? 'above 40 mph' : 'at up to 40 mph'}`;
        subtitle = a.type === 'motorway' ?
            'Motorway mainline: the applicable dual-carriageway extract of Table A.2.' :
            'Only the carriageway columns applicable to the recorded arrangement are shown.';
        const base = r.table === 'A.2' ? 2 : 3;
        let headers = ['Traffic flow'];
        let columns;
        if (a.type === 'motorway' || p.layout === 'Dual carriageway') {
            columns = p.density === 'High' ? [1] : p.density === 'Low' ? [2] : [1, 2];
        } else if (p.layout === 'Single carriageway') columns = [3];
        else columns = [1, 2, 3];
        const labels = {
            1: 'Dual carriageway · high junction density',
            2: 'Dual carriageway · low junction density',
            3: 'Single carriageway'
        };
        headers.push(...columns.map(column => labels[column]));
        const rows = M_BANDS.map((band, index) => [`<button class="table-select" data-mband="${band}" aria-pressed="${trafficBand(p)===band}">${band}</button>`, ...columns.map(column => 'M' + (base + index +
            (column === 2 ? 1 : 0)))]);
        markup = table(headers, rows, r.row, columns.indexOf(r.column) + 1);
        markup += '<h3>Traffic-flow explanations accompanying this table</h3>' + table(['Flow',
            'Possible ADT indicator', 'Dual/multilane capacity indicator',
            'Single-carriageway capacity indicator'
        ].filter((_, i) => !(a.type === 'motorway' && i === 3)), [
            ['High to very high', 'Above 40,000 vehicles/day', 'Above 65%', 'Above 45%'],
            ['Low to moderate', '7,000–40,000 vehicles/day', '35%–65%', '15%–45%'],
            ['Very low', 'Below 7,000 vehicles/day', 'Below 35%', 'Below 15%']
        ].map(row => a.type === 'motorway' ? row.slice(0, 3) : row), r.row);
        notes =
            `<ul><li>High junction density means centres spaced less than 3 km apart.</li><li>ADT and capacity are possible alternative indicators. Record your chosen basis and conflicting evidence; do not combine them into an invented score.</li><li>Select for the most demanding conditions during darkness.</li><li>The initial assumptions include moderate ambient luminance and good visual guidance${a.type === 'motorway' ? '.' : ', with no parked vehicles.'}</li></ul><p class="hint">BS 5489-1:2020, A.3.1.2–A.3.1.3; printed pages 56–57. ${a.type === 'motorway' ? 'This motorway branch remains on A.2; unusual operating cases require scope review.' : 'The stated scope of the high-speed route requires review for non-motorway cases at 60 mph and above.'}</p>`;
    } else if (['residential', 'footpath', 'cycle'].includes(a.type)) {
        title = 'Table A.5 — subsidiary roads and pedestrian / cycle areas';
        let columns;
        if (a.type !== 'residential') {
            columns = [0];
            subtitle = 'Applicable extract: pedestrians and cyclists only, E1–E4.';
        } else {
            columns = ['E1', 'E2'].includes(p.zone) ? [1] : ['E3', 'E4'].includes(p.zone) ? [2] : [1, 2];
            subtitle =
                'Applicable extract: subsidiary-road columns at up to 30 mph. The pedestrians/cyclists-only column is excluded.';
        }
        const headings = {
            0: 'Pedestrians/cyclists only · E1–E4',
            1: 'Road ≤30 mph · E1/E2',
            2: 'Road ≤30 mph · E3/E4'
        };
        const values = [
            ['P5', 'P4', 'P3'],
            ['P5', 'P5', 'P4'],
            ['P6', 'P5', 'P4']
        ];
        const selectedOriginal = a.type !== 'residential' ? 0 : ['E1', 'E2'].includes(p.zone) ? 1 : [
            'E3', 'E4'
        ].includes(p.zone) ? 2 : -1;
        markup = table(['Traffic / user flow', ...columns.map(column => headings[column])], ['Busy',
                'Normal', 'Quiet'
            ].map((flow, i) => [`<button class="table-select" data-flow="${flow}" aria-pressed="${p.flow===flow}">${flow}</button><span class="table-description">${FLOW[flow]}</span>`, ...columns.map(column => values[i][column])]), r.row, columns
            .indexOf(selectedOriginal) + 1);
        notes =
            `<ul>${a.type === 'residential' ? '<li>The table assumes no parked vehicles. Review parking and local task complexity under A.3.3.2.</li>' : ''}<li>A supplementary EV class may be appropriate for crime/personal-safety concerns, assessed at a typical face height of 1.5 m in relevant orientations.</li><li>The maintained average illuminance should not exceed 1.5 times the class value; seek overall uniformity as high as reasonably practicable.</li><li>The classes are suggested starting minimums. A site-specific risk assessment is still needed.</li></ul><p class="hint">Table A.5 and A.3.3.1–A.3.3.2; printed pages 58–59.</p>`;
    } else if (a.type === 'conflict') {
        title = 'Table A.4 — conflict areas';
        subtitle = 'Use the strongest applicable approaching traffic-route class.';
        markup = table(['Approaching traffic-route class', 'Initial conflict-area class'], [1, 2, 3, 4,
            5, 6
        ].map(n => [`<button class="table-select" data-approach="M${n}" aria-pressed="${p.approach1==='M'+n}">M${n}</button>`, 'C' + (n - 1)]), r.row, 1);
        notes =
            '<p>Where routes of different classes meet, the stronger approaching class normally governs. Confirm that this is a conflict area and define its extent. Not every junction qualifies.</p><p class="hint">A.3.2 and Table A.4, printed page 58. The standard refers to ILP PLG02 for further conflict-area guidance; detailed qualification/extents are not automated here.</p>';
    } else if (a.type === 'town') {
        title = 'Table A.6 — city and town centres';
        subtitle = 'Normal / High flow columns for the selected E3 or E4 environment.';
        const names = ['Pedestrian thoroughfare', 'Pedestrian-only space',
            'Vehicles with separate footways', 'Vehicles and pedestrians sharing a surface'
        ];
        const data = [
            ['P2', 'P1', 'P2', 'P1'],
            ['C4', 'C3', 'C3', 'C2'],
            ['C3', 'C2', 'C2', 'C1'],
            ['C2', 'C1', 'C1', 'C1']
        ];
        const columns = p.zone === 'E3' ? [0, 2] : p.zone === 'E4' ? [1, 3] : [0, 1, 2, 3];
        const headings = ['Normal · E3', 'Normal · E4', 'High · E3', 'High · E4'];
        const chosen = ['Normal', 'High'].includes(p.flow) && ['E3', 'E4'].includes(p.zone) ? (p
            .flow === 'High' ? 2 : 0) + (p.zone === 'E4' ? 1 : 0) : -1;
        markup = table(['Movement arrangement', ...columns.map(column => `<button class="table-select" data-townflow="${column<2?'Normal':'High'}" aria-pressed="${p.flow===(column<2?'Normal':'High')}">${headings[column]}</button>`)], names.map((
            name, i) => [`<button class="table-select" data-movement="${i}" aria-pressed="${p.movement===name}">${name}</button>`, ...columns.map(column => data[i][column])]), r.row, columns.indexOf(
            chosen) + 1);
        notes =
            '<p>Table A.6 uses Normal and High; it gives no numerical flow cut-offs here. Record the basis for the category. The residential Busy/Normal/Quiet explanations are not extra town-centre thresholds.</p><p>For a road carrying mainly vehicular traffic, review the traffic-route category instead. A pedestrian thoroughfare can require a different approach from a pedestrian destination space.</p><p class="hint">A.3.4 and Table A.6, printed pages 60–61.</p>';
    }
    return card(title, subtitle, markup + flowExplanation(a) +
        `<details open><summary>Notes to read with this table</summary>${notes}</details>` +
        zoneExplanation(a));
}

function reviewInputs(a) {
    const questions = reviewQuestions(a.type, a.params);
    const reference = DIRECT[a.type] ? (a.type === 'carpark' ? '7.4.8.3' : a.type === 'structure' ? '7.4.7' : '7.4.6') : a.type === 'town' ? 'A.3.4.2' : ['residential', 'footpath', 'cycle'].includes(a
            .type) ? 'A.3.3.2' : a.type === 'conflict' ?
        'A.3.2 and the relevant conflict-area design assessment' : 'A.3.1.3';
    return card('Relevant factors for the next risk-review step',
        `Record the applicable factors only. These do not automatically add or subtract classes. Reference: ${reference}.`,
        `<div class="checks">${questions.map(question => field(question.key, question.label, question.hint, question.options)).join('')}</div><div class="fields">${field('evidence', 'Evidence and assessment periods', 'Counts, observations, survey / drawing references and local evidence supporting the table inputs.', null, true, 'textarea')}${field('notes', 'Designer’s observations', 'Record why the selected category fits and any matters needing a later risk-based decision.', null, true, 'textarea')}</div>` +
        (['residential', 'footpath', 'cycle'].includes(a.type) ?
            '<details><summary>Light-source note in A.3.3.3</summary><p>For the white-light benchmark used by A.5, no routine S/P adjustment is made. The standard retains a review exception for low-S/P, low-colour-rendering sources. A.1.1 also identifies Ra &lt;60 or S/P &lt;1 as source-review triggers. This initial table selector performs no source adjustment.</p></details>' :
            ''));
}

function resultHTML(a) {
    const r = assessment(a);
    return `<div class="eyebrow muted">Initial Annex A result</div><div class="class-value">${r.className || 'Complete the table inputs'}</div><p class="small"><strong>${r.table ? 'Table ' + r.table : 'Table not yet selected'}</strong> · ${escapeHTML(TYPES[a.type]?.family || 'Choose an area type')}</p>${r.reasons.length ? '<ol>' + r.reasons.map(text => '<li>' + escapeHTML(text) + '</li>').join('') + '</ol>' : ''}${r.gaps.length ? '<div class="notice"><strong>Required for this selection</strong><ul>' + r.gaps.map(text => '<li>' + escapeHTML(text) + '</li>').join('') + '</ul></div>' : ''}${r.flags.length ? '<h3>Factors to assess before a final class is chosen</h3><ul>' + r.flags.map(text => '<li>' + escapeHTML(text) + '</li>').join('') + '</ul>' : '<p class="small">No positive risk flags from the answers recorded so far.</p>'}${r.unanswered.length ? '<p class="hint"><strong>Not yet established:</strong> ' + r.unanswered.map(escapeHTML).join('; ') + '.</p>' : ''}<div class="info">This is the <strong>starting class from the applicable table</strong>, not a final risk-adjusted class or evidence that a proposed installation achieves it. Annex A proceeds to risk review and, where justified, a designer adjustment, source review and an operating profile.</div>`;
}

function printOverview() {
    return `<section class="print-overview"><h1>${escapeHTML(state.project.name || 'Lighting assessment')}</h1><p>${escapeHTML(state.project.reference)} · ${escapeHTML(state.project.location)} · ${escapeHTML(state.project.designer)} · ${escapeHTML(state.project.date)}</p><p>${escapeHTML(state.project.description)}</p></section>`;
}

// Table-first controls populate the same parameter record used by the calculation.
function tableChooser(a) {
    if (a.type !== 'traffic') return '';
    const chosen = a.params.tableChoice || (a.params.speed ? (Number(a.params.speed) > 40 ? 'A.2' : 'A.3') : '');
    return card('Choose the applicable traffic-route table', 'Choose the speed range first. The precise speed and carriageway inputs follow below.', `<div class="actions"><button data-table="A.2" class="${chosen==='A.2'?'primary':''}" aria-pressed="${chosen==='A.2'}">Table A.2 · above 40 mph</button><button data-table="A.3" class="${chosen==='A.3'?'primary':''}" aria-pressed="${chosen==='A.3'}">Table A.3 · up to 40 mph</button></div>`);
}

function baseInitialResult(a) {
    const r = assessment(a);
    return `<div class="eyebrow muted">Suggested starting class from the table</div><div class="class-value">${r.className||'Complete the remaining parameters'}</div><p class="small"><strong>${r.table?'Table '+r.table:'Select the applicable table'}</strong> · ${escapeHTML(TYPES[a.type]?.family||'')}</p>${r.reasons.length?'<ol>'+r.reasons.map(text=>'<li>'+escapeHTML(text)+'</li>').join('')+'</ol>':''}${r.gaps.length?'<div class="notice"><strong>Needed for this starting class</strong><ul>'+r.gaps.map(text=>'<li>'+escapeHTML(text)+'</li>').join('')+'</ul></div>':''}<p class="hint">This is the initial table recommendation. Review the relevant factors below before recording the designer’s final choice.</p>`;
}

function proposedClass(a) {
    const r = assessment(a),
        p = a.params;
    const out = {
        className: '',
        error: '',
        warnings: []
    };
    if (!r.className) {
        out.error = 'Complete the table selection and parameters first.';
        return out;
    }
    if (!p.adjustment) {
        out.error = 'Choose whether to keep or adjust the table recommendation.';
        return out;
    }
    const family = r.className[0],
        n = Number(r.className.slice(1)),
        min = family === 'C' ? 0 : 1,
        max = family === 'C' ? 5 : 6;
    if (p.adjustment === 'Keep the starting class') out.className = r.className;
    else if (p.adjustment === 'Increase lighting by one class') {
        if (n === min) out.error = 'The starting class is already the strongest in this family. Review any further requirement separately.';
        else out.className = family + (n - 1);
    } else if (p.adjustment === 'Decrease lighting by one class') {
        if (n === max) out.error = 'The starting class is already the weakest implemented in this family. Review any further change separately.';
        else out.className = family + (n + 1);
    } else if (p.adjustment === 'Choose another class') {
        if (!/^(M[1-6]|C[0-5]|P[1-6])$/.test(p.alternative)) out.error = 'Select the alternative class.';
        else {
            out.className = p.alternative;
            if (p.alternative[0] !== family) out.warnings.push('This changes lighting family: justify the assessment concept and applicable criteria; families are not interchangeable.');
            else if (Math.abs(Number(p.alternative.slice(1)) - n) > 1) out.warnings.push('This exceeds the normal one-class adjustment described in Annex A; record the project-specific basis and any required approval.');
        }
    } else out.error = 'Select a supported adjustment option.';
    if (out.className && !p.justification.trim()) out.error = 'Record the designer’s reasoning and supporting evidence.';
    return out;
}

function baseDesignerSummary(a) {
    const r = assessment(a),
        p = a.params,
        proposal = proposedClass(a);
    const recorded = !!p.decisionStamp && p.decisionStamp === reviewSnapshot(a) && !proposal.error;
    const stale = !!p.decisionStamp && !recorded;
    return `<div class="decision-comparison"><div><span class="eyebrow muted">Table recommendation</span><strong>${r.className||'Pending'}</strong></div><div><span class="eyebrow muted">${recorded?'Recorded designer class':'Proposed designer class'}</span><strong>${proposal.className||'Pending'}</strong></div></div>${r.flags.length?'<h3>Factors identified for review</h3><ul>'+r.flags.map(text=>'<li>'+escapeHTML(text)+'</li>').join('')+'</ul>':'<p class="small">No positive risk factors recorded so far.</p>'}${r.unanswered.length?'<p class="hint"><strong>Review information still outstanding:</strong> '+r.unanswered.map(escapeHTML).join('; ')+'.</p>':''}${proposal.warnings.map(text=>'<div class="notice">'+escapeHTML(text)+'</div>').join('')}${proposal.error?'<p class="notice">'+escapeHTML(proposal.error)+'</p>':''}${stale?'<div class="notice"><strong>The assessment has changed since the decision was recorded.</strong> Review and record the decision again.</div>':''}${recorded?'<div class="info"><strong>Designer selection recorded.</strong> '+escapeHTML(p.recordedAt)+'. This is a design decision record, not authority approval or photometric verification.</div>':''}<div class="actions no-print"><button class="primary" data-action="record" ${proposal.error?'disabled':''}>Record designer selection</button></div><p class="hint">Positive factors do not automatically cause an uplift. “Increase lighting” moves to a lower class number, such as P4 → P3. The initial recommendation remains visible.</p>`;
}

function baseAdjustmentSection(a) {
    const p = a.params;
    const alternatives = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
    return card('Designer’s review and adjustment', 'Keep the starting class or record a justified alternative after reviewing the relevant factors.', `<div class="fields">${field('adjustment','Designer’s choice','The usual adjustment is no more than one class up or down, based on assessed risks.',['Keep the starting class','Increase lighting by one class','Decrease lighting by one class','Choose another class'])}${p.adjustment==='Choose another class'?field('alternative','Alternative class','Explain a larger change or a change of lighting family explicitly.',alternatives):''}${field('justification','Reasoning and supporting evidence','Explain acceptance or the adjustment, the relevant factors and any additional criteria or outstanding checks.',null,true,'textarea')}</div><div id="decision-summary">${designerSummary(a)}</div>`);
}

function recordSelection() {
    const proposal = proposedClass(area());
    if (proposal.error) {
        toast(proposal.error);
        return;
    }
    addHistory(area());
    area().params.recordedAt = new Date().toLocaleString('en-GB');
    area().params.decisionStamp = reviewSnapshot(area());
    save();
    render();
    toast('Designer selection recorded. Later input changes will flag it for review.');
}

function selection() {
    const a = area();
    const tabs = `<div class="area-tabs no-print">${state.areas.map((item,i)=>`<button data-area="${i}" class="${i===activeArea?'selected':''}">${escapeHTML(item.name||'Area '+(i+1))}</button>`).join('')}<button data-action="add">+ Add assessment area</button>${state.areas.length>1?'<button data-action="remove">Remove this area</button>':''}</div>`;
    return pageHead('02', 'Start with the table.', 'Area type → table and flow → notes → environmental zone → parameters → starting class → relevant factors → designer decision.') + printOverview() + tabs + areaSelector() + (TYPES[a.type] ? tableChooser(a) + `<div id="table-section">${applicableTable(a)}</div>` + environmentPicker(a) + linkInputs(a) + parameterInputs(a) + areaMetaInputs(a) + `<section class="card" id="result" aria-live="polite">${initialResult(a)}</section>` + reviewInputs(a) + requirementsInputs(a) + ecologyInputs(a) + riskRegister(a) + adjustmentSection(a) + `<div class="actions no-print"><button class="primary" data-action="print-brief">Print project brief / save PDF</button><button data-action="brief">Project design brief →</button><button data-action="overview">Project overview</button></div>` : '') + '<p class="hint">Class selection follows the supplied BS 5489-1:2020 Annex A; direct requirements use Tables 2–4 and column clearance uses Table 1. This workflow records the initial class and designer decision; detailed photometric, source, operating-profile and project-approval checks remain to be completed where applicable.</p>';
}


function assessment(a) {
    return DIRECT[a.type] ? directAssessment(a) : a.type === 'conflict' ? linkedAssessment(a) : baseAssessment(a);
}

function parameterInputs(a) {
    if (DIRECT[a.type]) return directInputs(a);
    let html = baseParameterInputs(a);
    if (['motorway', 'traffic', 'residential', 'conflict'].includes(a.type)) {
        let extra = field('barrier', 'Columns protected by a safety barrier?', 'Barrier working width, deflection and design requirements can govern the setback.', YES_NO);
        if (a.type === 'conflict') extra = field('speed', 'Speed limit at the assessed area (mph)', 'Used for Table 1 column clearance, not the M-to-C class relationship.', ['5', '10', '15', '20', '30', '40', '50', '60', '70']) + extra;
        html = html.replace('</div></section>', '</div><div class="fields">' + extra + '</div></section>');
    }
    return html;
}

function applicableTable(a) {
    return DIRECT[a.type] ? directTable(a) : baseApplicableTable(a);
}

function initialResult(a) {
    return DIRECT[a.type] ? directResult(a) : baseInitialResult(a) + lightingLevels(assessment(a).className, a);
}

function designerSummary(a) {
    return DIRECT[a.type] ? directSummary(a) + statusPanel(a) + historyHTML(a) : baseDesignerSummary(a) + statusPanel(a) + lightingLevels(proposedClass(a).className, a) + clearanceSummary(a) + historyHTML(a);
}

function adjustmentSection(a) {
    if (DIRECT[a.type]) return directDecision(a);
    let html = baseAdjustmentSection(a);
    if (proposedClass(a).warnings.length) html = html.replace('<div id="decision-summary">', '<div class="fields">' + field('exceptionBasis', 'Exceptional adjustment basis', 'Explain why a larger adjustment or change of concept is appropriate, and record any project review/approval requirements.', null, true, 'textarea') + '</div><div id="decision-summary">');
    return html;
}

function overview() {
    return baseOverview() + projectBasis() + card('Ready for your next step', 'All areas are included in the project report.', '<div class="actions"><button data-action="selection">Assess road / area</button><button data-action="brief">View project design brief</button></div>');
}

function render() {
    if (syncAllDrafts()) save();
    $('#app').innerHTML = page === 'selection' ? selection() : page === 'brief' ? designBrief() : overview();
    document.querySelectorAll('[data-page]').forEach(link => {
        const current = link.dataset.page === page;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function go(nextPage) {
    page = ['selection', 'brief'].includes(nextPage) ? nextPage : 'overview';
    render();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateOutputs() {
    if (page !== 'selection') return;
    const results = $('#result');
    const section = $('#table-section');
    if (results) results.innerHTML = initialResult(area());
    if (section) section.innerHTML = applicableTable(area());
    const decision = $('#decision-summary');
    if (decision) decision.innerHTML = designerSummary(area());
    const reasons = $('#criteria-generated');
    if (reasons) reasons.innerHTML = generatedReasonsHTML(area());
}

function refreshDraftControls() {
    const a = area();
    for (const r of a.risks)
        for (const key of RISK_FIELDS) {
            const control = document.getElementById(`risk-${r.id}-${key}`);
            if (control && control !== document.activeElement && control.value !== r[key]) control.value = r[key];
        }
    const eco = document.getElementById('area-ecologyMeasures');
    if (eco && eco !== document.activeElement) eco.value = a.params.ecologyMeasures;
}

function setRiskValue(target) {
    const r = area().risks.find(v => v.id === target.dataset.risk);
    if (r && RISK_FIELDS.includes(target.dataset.rkey)) {
        r[target.dataset.rkey] = target.value;
        save();
    }
}

function setValue(target) {
    const key = target.dataset.key;
    if (!key) return;
    if (target.dataset.project) {
        if (!Object.hasOwn(state.project, key)) return;
        state.project[key] = target.value;
    } else if (key === 'name') area().name = target.value;
    else {
        if (!Object.hasOwn(area().params, key)) return;
        area().params[key] = target.value;
        if (key === 'zone') area().params.zoneBasis = ZONES[target.value] || '';
    }
    syncAllDrafts();
    save();
}

function download(name, content, mime) {
    const url = URL.createObjectURL(new Blob([content], {
        type: mime
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function exportProject() {
    download('lumen-annex-a-project-v09.json', JSON.stringify(state, null, 2), 'application/json');
    toast('Project exported.');
}

function loadExample() {
    if (!confirm('Replace this project with three fictional worked examples? Export first if you want to keep your current work.')) return;
    state = fresh();
    Object.assign(state.project, {
        name: 'FICTIONAL EXAMPLE — road, residential area and junction',
        reference: 'DEMO ONLY',
        location: 'Fictional site — replace all observations',
        designer: 'Example only — replace with designer',
        date: new Date().toISOString().slice(0, 10),
        description: 'Demonstration data, not a real street assessment or approved design.',
        authority: 'Example authority',
        policy: 'Demonstration of BS 5489-1:2020 Annex A; not a real authority policy.',
        drawing: 'DEMO drawing: separate residential access, main road and junction'
    });
    const residential = state.areas[0];
    residential.name = 'Example residential access';
    residential.type = 'residential';
    Object.assign(residential.params, {
        speed: '20',
        flow: 'Normal',
        zone: 'E3',
        zoneBasis: ZONES.E3,
        function: 'Estate access / spine road',
        extent: 'DEMO residential boundary',
        operatingPeriod: 'Evening peak during darkness',
        evidence: 'FICTIONAL: use comparable to an estate access road. Replace with site evidence.',
        adjustment: 'Keep the starting class',
        justification: 'Example starting proposal only. Complete the local review.',
        glareMethod: 'TI calculation',
        sourceMode: 'Benchmark white source confirmed',
        criteriaBasis: 'Example P-class assessment; confirm views and all applicable criteria.',
        ecology: 'Unknown / survey needed'
    });
    const main = newArea();
    main.name = 'Example main traffic route';
    main.type = 'traffic';
    Object.assign(main.params, {
        speed: '30',
        tableChoice: 'A.3',
        layout: 'Single carriageway',
        method: 'ADT',
        adt: '20000',
        extent: 'DEMO main-road boundary',
        operatingPeriod: 'Most onerous conditions during darkness',
        evidence: 'FICTIONAL: 20,000 ADT indicator; validate its night-time relevance for any real project.',
        adjustment: 'Keep the starting class',
        justification: 'Fictional M4 table choice recorded to demonstrate a linked conflict area; risk review is still provisional.',
        background: 'Moderate',
        guidance: 'Good',
        ulScope: 'Long uninterrupted section',
        wetScope: 'Not required by project',
        reiScope: 'No separately assessed adjacent traffic areas',
        criteriaBasis: 'Example only: verify geometry, wet-road policy and surrounds.',
        ecology: 'Unknown / survey needed'
    });
    state.areas.push(main);
    addHistory(main);
    main.params.recordedAt = new Date().toLocaleString('en-GB');
    main.params.decisionStamp = reviewSnapshot(main);
    const junction = newArea();
    junction.name = 'Example junction / conflict area';
    junction.type = 'conflict';
    Object.assign(junction.params, {
        confirmed: 'Yes',
        boundary: 'DEMO qualified conflict boundary — replace with actual qualification and drawing',
        approachLinks: main.id,
        speed: '30',
        operatingPeriod: 'Evening peak during darkness',
        evidence: 'FICTIONAL: qualified conflict area linked to the example M4 route.',
        adjustment: 'Keep the starting class',
        justification: 'Example C3 proposal from Table A.4; complete the local assessment.',
        glareMethod: 'TI calculation',
        criteriaBasis: 'Example only: define relevant observer views or suitable installed-intensity control.',
        ecology: 'Unknown / survey needed'
    });
    state.areas.push(junction);
    activeArea = 0;
    save();
    go('selection');
    toast('Three fictional examples loaded. All require a site-specific review.');
}

$('#export').addEventListener('click', exportProject);
document.addEventListener('input', event => {
    const target = event.target;
    if (target.dataset.risk) {
        setRiskValue(target);
        updateOutputs();
        return;
    }
    if (!target.dataset.key) return;
    setValue(target);
    if (target.tagName !== 'SELECT' && target.dataset.key !== 'notes' && target.dataset.key !==
        'name') updateOutputs();
});
document.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.link) {
        const a = area(),
            ids = new Set(a.params.approachLinks.split(',').filter(Boolean));
        if (target.checked) ids.add(target.dataset.link);
        else ids.delete(target.dataset.link);
        a.params.approachLinks = [...ids].join(',');
        save();
        render();
        return;
    }
    if (target.dataset.risk) {
        setRiskValue(target);
        if (target.tagName === 'SELECT') {
            const controlId = target.id;
            render();
            document.getElementById(controlId)?.focus?.();
        } else updateOutputs();
        return;
    }
    if (!target.dataset.key) return;
    setValue(target);
    if (target.tagName === 'SELECT') {
        const controlId = target.id;
        render();
        document.getElementById(controlId)?.focus?.();
    } else {
        updateOutputs();
        refreshDraftControls();
    }
});
document.addEventListener('click', event => {
    const target = event.target.closest(
        '[data-remove-risk], [data-action], [data-type], [data-flow], [data-area], [data-page], [data-table], [data-mband], [data-approach], [data-movement], [data-townflow], [data-zone], [data-usage], [data-enclosure], [data-structure]');
    if (!target) return;
    if (target.dataset.removeRisk) {
        if (confirm('Remove this risk item? Automatic drafts for this factor will stay excluded until restored. Explain the exclusion in the overall risk conclusion.')) {
            const removed = area().risks.find(v => v.id === target.dataset.removeRisk);
            if (removed?.factor) {
                const excluded = new Set(area().params.suppressedRisks.split(',').filter(Boolean));
                excluded.add(removed.factor);
                area().params.suppressedRisks = [...excluded].join(',');
            }
            area().risks = area().risks.filter(v => v.id !== target.dataset.removeRisk);
            save();
            render();
        }
        return;
    }
    for (const key of ['zone', 'usage', 'enclosure', 'structure']) {
        if (target.dataset[key] === undefined) continue;
        const val = target.dataset[key],
            a = area();
        const allowed = key === 'zone' ? (['residential', 'footpath', 'cycle', 'town'].includes(a.type) && Object.hasOwn(ZONES, val) && (a.type !== 'town' || ['E3', 'E4'].includes(val))) : key === 'usage' ? (a.type === 'carpark' && ['Light', 'Medium', 'Heavy'].includes(val)) : key === 'structure' ? (a.type === 'structure' && ['Subway', 'Footbridge', 'Stairway / ramp'].includes(val)) : (['structure', 'arcade'].includes(a.type) && (val === 'Open' || val === (a.type === 'structure' ? 'Enclosed' : 'Enclosed / canopied')));
        if (allowed) {
            a.params[key] = val;
            if (key === 'zone') a.params.zoneBasis = ZONES[val];
            save();
            render();
        }
        return;
    }
    if (target.dataset.page) {
        event.preventDefault();
        go(target.dataset.page);
        return;
    }
    if (target.dataset.type && TYPES[target.dataset.type]) {
        const nextType = target.dataset.type;
        if (area().type && area().type !== nextType && Object.values(area().params).some(Boolean) &&
            !confirm(
                'Change this assessment area type? Its previous parameters will be cleared so they cannot affect the new selection. Export first if you need to keep them.'
            )) return;
        if (area().type !== nextType) {
            area().params = NEW_PARAMS();
            area().risks = [];
        }
        area().type = nextType;
        save();
        render();
        return;
    }
    if (target.dataset.table && ['A.2', 'A.3'].includes(target.dataset.table) && area().type === 'traffic') {
        const p = area().params;
        p.tableChoice = target.dataset.table;
        if (p.speed && (Number(p.speed) > 40 ? 'A.2' : 'A.3') !== p.tableChoice) p.speed = '';
        save();
        render();
        return;
    }
    if (target.dataset.mband && M_BANDS.includes(target.dataset.mband) && ['motorway', 'traffic'].includes(area().type)) {
        area().params.method = 'Designer-selected band';
        area().params.band = target.dataset.mband;
        save();
        render();
        return;
    }
    if (target.dataset.approach && /^M[1-6]$/.test(target.dataset.approach) && area().type === 'conflict') {
        area().params.approach1 = target.dataset.approach;
        save();
        render();
        return;
    }
    if (target.dataset.movement !== undefined && area().type === 'town') {
        const choices = ['Pedestrian thoroughfare', 'Pedestrian-only space', 'Vehicles with separate footways', 'Vehicles and pedestrians sharing a surface'];
        const n = Number(target.dataset.movement);
        if (Number.isInteger(n) && choices[n]) {
            area().params.movement = choices[n];
            save();
            render();
        }
        return;
    }
    if (target.dataset.townflow && ['Normal', 'High'].includes(target.dataset.townflow) && area().type === 'town') {
        area().params.flow = target.dataset.townflow;
        save();
        render();
        return;
    }
    if (target.dataset.flow && FLOW[target.dataset.flow]) {
        area().params.flow = target.dataset.flow;
        save();
        render();
        document.querySelector(`[data-flow="${area().params.flow}"]`)?.focus?.({
            preventScroll: true
        });
        return;
    }
    if (target.dataset.area !== undefined) {
        const number = Number(target.dataset.area);
        if (Number.isInteger(number) && number >= 0 && number < state.areas.length) {
            activeArea = number;
            render();
        }
        return;
    }
    switch (target.dataset.action) {
        case 'print-brief':
            go('brief');
            window.print();
            break;
        case 'brief':
            go('brief');
            break;
        case 'download-brief':
            downloadBrief();
            break;
        case 'restore-risks':
            area().params.suppressedRisks = '';
            syncAllDrafts();
            save();
            render();
            break;
        case 'seed-risks':
            seedRisks();
            break;
        case 'add-risk':
            if (area().risks.length < 100) {
                area().risks.push(newRisk());
                save();
                render();
            }
            break;
        case 'record-direct':
            if (assessment(area()).target && area().params.justification.trim()) {
                addHistory(area());
                area().params.recordedAt = new Date().toLocaleString('en-GB');
                area().params.decisionStamp = reviewSnapshot(area());
                save();
                render();
            }
            break;
        case 'record':
            recordSelection();
            break;
        case 'overview':
            go('overview');
            break;
        case 'selection':
            go('selection');
            break;
        case 'add':
            state.areas.push(newArea());
            activeArea = state.areas.length - 1;
            save();
            render();
            break;
        case 'remove':
            if (state.areas.length > 1 && confirm('Remove this assessment area?')) {
                state.areas.splice(activeArea, 1);
                activeArea = 0;
                save();
                render();
            }
            break;
        case 'print':
            window.print();
            break;
        case 'import':
            $('#import-file').click();
            break;
        case 'example':
            loadExample();
            break;
        case 'reset':
            if (confirm('Start a new focused project? Export your work first if needed.')) {
                state = fresh();
                activeArea = 0;
                save();
                go('overview');
            }
            break;
    }
});
$('#import-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        if (file.size > 2000000) throw Error('File too large');
        const imported = validateProject(JSON.parse(await file.text()));
        if (!confirm('Replace the focused project with this imported project?')) return;
        state = imported;
        activeArea = 0;
        save();
        go('overview');
        toast('Project imported.');
    } catch (error) {
        toast('Choose a valid Lumen 0.9 project JSON. The current project has not changed.');
    } finally {
        event.target.value = '';
    }
});
render();
if (startupWarning) {
    $('#save-status').textContent = 'Saved data needs attention';
    toast(startupWarning);
} else save();
