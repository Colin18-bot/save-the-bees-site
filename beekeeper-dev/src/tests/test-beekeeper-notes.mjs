import assert from 'node:assert/strict';
import { buildBeekeeperNotes, buildBeekeeperNotesStructured } from '../utils/buildBeekeeperNotes.js';
const now = new Date('2026-10-18T12:00:00Z');
const unix = iso => Date.parse(iso) / 1000;
const daily = {time: ['2026-10-18','2026-10-19','2026-10-20'].map(s => unix(s+'T12:00:00Z')), temperature_2m_max:[12,16,11], temperature_2m_min:[5,7,6], wind_speed_10m_max:[15,16,43], precipitation_sum:[0,1,16]};
const hourly = {time:['2026-10-19T13:00:00Z','2026-10-19T14:00:00Z'].map(unix), temperature_2m:[16,16], wind_speed_10m:[15,15], precipitation_probability:[10,90], weather_code:[1,61]};
const x = buildBeekeeperNotesStructured({daily,hourly,now,latitude:51.5,timezone:'Europe/London',warnings:[{severity:'red',event:'Wind warning'}]});
assert.equal(x.month,'October');
assert.equal(x.hasSignificantWarning,true);
assert.equal(x.sections.priorities.notes.length,3);
assert.equal(x.sections.jobs.notes.length,4);
assert(x.sections.weather.notes.some(n=>n.id==='inspection-opportunity'));
assert(x.sections.weather.notes.some(n=>n.id==='wind-upcoming'&&n.text.includes('20 Oct')));
assert(x.sections.weather.notes.some(n=>n.id==='heavy-rain-upcoming'));
assert.equal(x.dashboardPreview[0].id,'official-major-warning');
assert.equal(buildBeekeeperNotes({daily,hourly,now,latitude:51.5}).every(n=>typeof n.icon==='string'&&typeof n.text==='string'),true);
const without = buildBeekeeperNotesStructured({daily,now,latitude:51.5});
assert(!without.sections.weather.notes.some(n=>n.id==='inspection-opportunity'));
const tropical = buildBeekeeperNotesStructured({now,latitude:0});
assert.equal(tropical.profile,'tropical');
const noCoord = buildBeekeeperNotesStructured({now});
assert.equal(noCoord.profile,'northern_temperate');
for(let month=0;month<12;month++){
 const m = buildBeekeeperNotesStructured({now:new Date(Date.UTC(2026,month,18)), latitude:51.5});
 assert(m.sections.priorities.notes.length>=3);
 assert(m.sections.jobs.notes.length>=3);
 assert(m.sections.knowledge.notes.length>=1);
}
console.log('PASS: structured & legacy exports, 12 months, severe-warning priority, day-specific wind/rain, simultaneous hourly inspection conditions, location profiles and missing-data safeguard');
