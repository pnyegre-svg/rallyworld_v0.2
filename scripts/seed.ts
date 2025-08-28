
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { competitors } from '@/lib/data';

initializeApp();
const db = getFirestore();


async function run(){
    console.log('Seeding database...');
    
    // Seed users and events
    const uid = 'demo-organizer-uid';
    await db.doc(`users/${uid}`).set({ displayName:'Demo Org', timezone:'Europe/Bucharest' });
    const ev = await db.collection('events').add({
        title:'Rally Demo', organizerId: uid, status:'draft',
        dates: { from: new Date(), to: new Date() }, country:'RO'
    });
    const st = await ev.collection('stages').add({
        name:'SS1', location:'Bucharest', distance:12.3,
        startAt: new Date(), status:'scheduled'
    });
    await ev.collection('entries').add({ competitorId:'c1', competitorName:'Alice', status:'new', paymentStatus:'unpaid', feeAmount:100, currency:'EUR', createdAt: FieldValue.serverTimestamp() });
    await ev.collection('announcements').add({ title:'Welcome', body:'**Hello organizers!**', audience:'competitors', pinned:true, publishedAt: FieldValue.serverTimestamp(), createdBy: uid });
    
    console.log('Seeded event', ev.id);

    // Seed competitors
    console.log('Seeding competitors...');
    const competitorCollection = db.collection('competitors');
    for (const competitor of competitors) {
        // Use the existing ID or let Firestore generate one
        const docRef = competitor.id ? competitorCollection.doc(competitor.id) : competitorCollection.doc();
        await docRef.set({
            name: competitor.name,
            team: competitor.team,
            country: competitor.country,
            avatar: competitor.avatar,
            vehicle: competitor.vehicle,
        });
    }
    console.log(`Seeded ${competitors.length} competitors.`);
    
    console.log('Seeding complete.');
}
run();
