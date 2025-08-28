import * as functions from 'firebase-functions';
import { onEntryWrite, onStageWrite, onAnnouncementWrite, refreshAllForToday } from './recompute';
import { approveEntry, markEntryPaid } from './callable';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const entryChanged = functions.firestore
.document('events/{eventId}/entries/{entryId}')
.onWrite(onEntryWrite);


export const stageChanged = functions.firestore
.document('events/{eventId}/stages/{stageId}')
.onWrite(onStageWrite);


export const announcementChanged = functions.firestore
.document('events/{eventId}/announcements/{annId}')
.onWrite(onAnnouncementWrite);


export const approveEntryFn = functions.https.onCall(approveEntry);
export const markEntryPaidFn = functions.https.onCall(markEntryPaid);


export const scheduledSummaryRefresh = functions.pubsub
.schedule('every 15 minutes').onRun(refreshAllForToday);
