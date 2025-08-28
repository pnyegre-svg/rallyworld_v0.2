import * as functions from 'firebase-functions';
import { onEntryWrite, onStageWrite, onAnnouncementWrite, onEventWrite, refreshAllForToday } from './triggers';
import { approveEntry, markEntryPaid } from './callables';


export const entryChanged = functions.firestore
.document('events/{eventId}/entries/{entryId}')
.onWrite(onEntryWrite);


export const stageChanged = functions.firestore
.document('events/{eventId}/stages/{stageId}')
.onWrite(onStageWrite);


export const announcementChanged = functions.firestore
.document('events/{eventId}/announcements/{annId}')
.onWrite(onAnnouncementWrite);


export const eventChanged = functions.firestore
.document('events/{eventId}')
.onWrite(onEventWrite);


export { approveEntry, markEntryPaid };


export const scheduledRefresh = functions.pubsub
.schedule('every 15 minutes')
.onRun(refreshAllForToday);


export const midnightRebuild = functions.pubsub
.schedule('0 3 * * *')
.timeZone('Etc/UTC')
.onRun(refreshAllForToday);
