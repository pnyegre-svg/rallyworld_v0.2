
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, addDoc, getFirestore } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';


let env:any;
beforeAll(async () => {
env = await initializeTestEnvironment({
projectId: 'demo-test',
firestore: { rules: (await import('fs/promises')).readFile('firestore.rules','utf8') }
});
});
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });


function userCtx(uid:string){ return env.authenticatedContext(uid); }


test('organizer can write own event', async () => {
const ctx = userCtx('org1');
const db = ctx.firestore();
await assertSucceeds(setDoc(doc(db,'events','e1'),{ organizerId:'org1', title:'t', startDate:new Date(), endDate:new Date(), status:'draft' }));
});


test('non-owner cannot write event data', async () => {
const owner = userCtx('org1').firestore();
await setDoc(doc(owner,'events','e1'),{ organizerId:'org1', title:'t', startDate:new Date(), endDate:new Date(), status:'draft' });


const other = userCtx('org2').firestore();
await assertFails(setDoc(doc(other,'events','e1','stages','s1'),{ name:'SS1' }));
});
