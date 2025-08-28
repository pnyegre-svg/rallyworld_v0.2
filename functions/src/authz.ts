
import * as functions from 'firebase-functions';
import { db } from './admin';

export function assertAuthed(context: functions.https.CallableContext): string {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign-in required');
    }
    return context.auth.uid;
}

export async function assertEventOwner(eventId: string, uid: string): Promise<void> {
    const ev = await db.doc(`events/${eventId}`).get();
    if (!ev.exists) {
        throw new functions.https.HttpsError('not-found', 'Event not found');
    }
    if (ev.get('organizerId') !== uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not event owner');
    }
}
