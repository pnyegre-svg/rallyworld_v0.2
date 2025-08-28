
import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';

/**
 * Checks if the user is authenticated and has the 'organizer' or 'admin' role.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {string} The user's UID.
 * @throws Will throw an error if the user is not authenticated or not an organizer/admin.
 */
function assertOrganizer(context: functions.https.CallableContext): string {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const role = context.auth.token.role;
    if (role !== 'organizer' && role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'The function must be called by an organizer or admin.');
    }
    return context.auth.uid;
}

export const approveEntry = async (data: any, context: functions.https.CallableContext) => {
    const uid = assertOrganizer(context);
    const { eventId, entryId } = data;

    if (!eventId || !entryId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "eventId" and "entryId" arguments.');
    }

    const ref = db.doc(`events/${eventId}/entries/${entryId}`);
    
    await ref.update({ status: 'approved' });
    
    await db.collection('audit_logs').add({
        at: FieldValue.serverTimestamp(),
        action: 'approveEntry',
        by: uid,
        eventId,
        entryId
    });

    return { success: true };
};

export const markEntryPaid = async (data: any, context: functions.https.CallableContext) => {
    const uid = assertOrganizer(context);
    const { eventId, entryId } = data;

    if (!eventId || !entryId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "eventId" and "entryId" arguments.');
    }

    const ref = db.doc(`events/${eventId}/entries/${entryId}`);
    
    await ref.update({ paymentStatus: 'paid' });
    
    await db.collection('audit_logs').add({
        at: FieldValue.serverTimestamp(),
        action: 'markEntryPaid',
        by: uid,
        eventId,
        entryId
    });

    return { success: true };
};
