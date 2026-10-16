import { test } from 'node:test';
import assert from 'node:assert/strict';
let activity;
try { activity = await import('../office-activity.js'); } catch {}
test('seated activity is present and offers varied independent actions', () => {
 assert.ok(activity?.sampleActivity, 'Missing seated action timeline');
 const kinds = new Set();
 for(let t=0;t<160;t+=.2) for(let i=0;i<4;i++) kinds.add(activity.sampleActivity(t,i).kind);
 for(const kind of ['typing','sip','phone','scratch']) assert.ok(kinds.has(kind), `Missing ${kind}`);
 assert.notDeepEqual(activity.sampleActivity(6,0),activity.sampleActivity(6,1));
});
test('movement returns to rest and is continuous across action boundaries', () => {
 assert.ok(activity?.sampleActivity, 'Missing seated action timeline');
 for(let i=0;i<4;i++) {
  let previous=activity.sampleActivity(0,i);
  for(let t=.01;t<160;t+=.01) {
   const next=activity.sampleActivity(t,i);
   assert.ok(next.reach>=0 && next.reach<=1);
   assert.ok(Math.abs(next.reach-previous.reach)<.04, `Arm teleports at ${t}`);
   if(next.kind==='typing') assert.equal(next.reach,0);
   previous=next;
  }
 }
});
