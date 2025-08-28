
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
