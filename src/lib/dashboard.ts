
'use client';

import { db } from './firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';

// Mirroring the data model from the spec
export interface DashboardStage {
  eventId: string;
  stageId: string;
  eventTitle: string;
  stageName: string;
  startAt: Timestamp;
  location: string;
  distanceKm: number;
  status: 'scheduled' | 'ready' | 'live' | 'closed' | 'completed' | 'upcoming';
}

export interface DashboardAnnouncement {
  eventId: string;
  annId: string;
  title: string;
  eventTitle: string;
  publishedAt: Timestamp;
}

export interface DashboardSummary {
  todayStages: DashboardStage[];
  counters: {
    pendingEntries: number;
    unpaidEntries: number;
  };
  latestAnnouncements: DashboardAnnouncement[];
  updatedAt: Timestamp;
}

/**
 * Sets up a real-time listener for an organizer's dashboard summary document.
 * @param uid The organizer's user ID.
 * @param onUpdate Callback function to handle incoming data.
 * @param onError Callback function to handle errors.
 * @returns An unsubscribe function to detach the listener.
 */
export const getDashboardSummary = (
  uid: string,
  onUpdate: (data: DashboardSummary | null) => void,
  onError: (error: Error) => void
) => {
  const summaryDocRef = doc(db, 'dashboard_summary', uid);

  const unsubscribe = onSnapshot(
    summaryDocRef,
    (doc) => {
      if (doc.exists()) {
        onUpdate(doc.data() as DashboardSummary);
      } else {
        // Document doesn't exist, which is a valid state (e.g., new organizer)
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error listening to dashboard summary:", error);
      onError(error);
    }
  );

  return unsubscribe;
};
