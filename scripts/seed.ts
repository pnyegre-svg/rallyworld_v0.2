
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';


initializeApp();
const db = getFirestore();


async function run(){
    const uid = 'demo-organizer-uid';
    await db.doc(`users/${uid}`).set({ displayName:'Demo Org', timezone:'Europe/Bucharest' });
    const ev = await db.collection('events').add({
        title:'Rally Demo', organizerId: uid, status:'draft',
        startDate: new Date(), endDate: new Date(), country:'RO'
    });
    const st = await ev.collection('stages').add({
        name:'SS1', location:'Bucharest', distanceKm:12.3,
        startAt: new Date(), status:'scheduled'
    });
    await ev.collection('entries').add({ competitorId:'c1', competitorName:'Alice', status:'new', paymentStatus:'unpaid', feeAmount:100, currency:'EUR', createdAt: FieldValue.serverTimestamp() });
    await ev.collection('announcements').add({ title:'Welcome', body:'**Hello organizers!**', audience:'competitors', pinned:true, publishedAt: FieldValue.serverTimestamp(), createdBy: uid });
    console.log('Seeded', ev.id, st.id);
}
run();
