

export type UserRole = 
  | 'organizer' 
  | 'competitor' 
  | 'stage_commander' 
  | 'timekeeper' 
  | 'scrutineer' 
  | 'event_secretary' 
  | 'communications_officer'
  | 'competitor_relations_officer'
  | 'fan';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: UserRole[];
  currentRole: UserRole;
};

export type Competitor = {
  id: string;
  name: string;
  team: string;
  country: string;
  avatar: string;
  vehicle: string;
};

export type Stage = {
  id: string;
  name: string;
  location: string;
  distance: number;
  status: 'upcoming' | 'live' | 'completed';
};

export type NewsPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'event' | 'system';
};

export type LeaderboardEntry = {
    rank: number;
    competitor: Competitor;
    totalTime: string;
    stageTimes: { stageId: string; time: string }[];
};

export const users: User[] = [
  { id: 'usr_001', name: 'Rally Club Admin', email: 'admin@rally.world', avatar: '/avatars/01.png', roles: ['organizer', 'fan'], currentRole: 'organizer' },
  { id: 'usr_002', name: 'Maria Garcia', email: 'maria.g@example.com', avatar: '/avatars/02.png', roles: ['timekeeper', 'fan'], currentRole: 'timekeeper' },
  { id: 'usr_003', name: 'Kenji Tanaka', email: 'kenji.t@example.com', avatar: '/avatars/03.png', roles: ['competitor', 'fan'], currentRole: 'competitor' },
  { id: 'usr_004', name: 'Chloe Dubois', email: 'chloe.d@example.com', avatar: '/avatars/04.png', roles: ['fan'], currentRole: 'fan' },
  { id: 'usr_005', name: 'Ben Carter', email: 'ben.c@example.com', avatar: '/avatars/05.png', roles: ['fan'], currentRole: 'fan' },
];

export const competitors: Competitor[] = [
  { id: 'comp_001', name: 'Sébastien Loeb', team: 'M-Sport Ford', country: 'FR', avatar: 'https://i.pravatar.cc/150?u=sebastienloeb', vehicle: 'Ford Puma Rally1' },
  { id: 'comp_002', name: 'Kalle Rovanperä', team: 'Toyota Gazoo Racing', country: 'FI', avatar: 'https://i.pravatar.cc/150?u=kallerovanpera', vehicle: 'Toyota GR Yaris Rally1' },
  { id: 'comp_003', name: 'Ott Tänak', team: 'Hyundai Motorsport', country: 'EE', avatar: 'https://i.pravatar.cc/150?u=otttanak', vehicle: 'Hyundai i20 N Rally1' },
  { id: 'comp_004', name: 'Thierry Neuville', team: 'Hyundai Motorsport', country: 'BE', avatar: 'https://i.pravatar.cc/150?u=thierryneuville', vehicle: 'Hyundai i20 N Rally1' },
  { id: 'comp_005', name: 'Elfyn Evans', team: 'Toyota Gazoo Racing', country: 'GB', avatar: 'https://i.pravatar.cc/150?u=elfynevans', vehicle: 'Toyota GR Yaris Rally1' },
  { id: 'comp_006', name: 'Takamoto Katsuta', team: 'Toyota Gazoo Racing NG', country: 'JP', avatar: 'https://i.pravatar.cc/150?u=takamotokatsuta', vehicle: 'Toyota GR Yaris Rally1' },
];

export const stages: Stage[] = [
  { id: 'stg_01', name: 'Col de Turini', location: 'Monte Carlo', distance: 15.31, status: 'completed' },
  { id: 'stg_02', name: 'Ouninpohja', location: 'Finland', distance: 33.00, status: 'completed' },
  { id: 'stg_03', name: 'El Chocolate', location: 'Mexico', distance: 31.45, status: 'live' },
  { id: 'stg_04', name: 'Myherin', location: 'Wales', distance: 29.13, status: 'upcoming' },
  { id: 'stg_05', 'name': 'Fafe', 'location': 'Portugal', 'distance': 11.18, 'status': 'upcoming' },
];

export const newsPosts: NewsPost[] = [
  { id: 'post_01', title: 'Rally Starts Tomorrow!', content: 'The first stage kicks off tomorrow morning at 8:00 AM sharp. Get ready for an adrenaline-fueled weekend!', author: 'Rally Control', timestamp: '2024-07-19T18:00:00Z', type: 'event' },
  { id: 'post_02', title: 'System Maintenance', content: 'The live timing system will be undergoing scheduled maintenance tonight from 1:00 AM to 2:00 AM.', author: 'Admin', timestamp: '2024-07-19T14:30:00Z', type: 'system' },
  { id: 'post_03', title: 'Stage 2 Results Are In', content: 'Kalle Rovanperä takes the lead after a blistering run through the legendary Ouninpohja stage. Full results are now on the leaderboard.', author: 'Rally Control', timestamp: '2024-07-20T12:00:00Z', type: 'event' },
];

export const leaderboard: LeaderboardEntry[] = [
    { rank: 1, competitor: competitors[1], totalTime: "1:15:34.2", stageTimes: [{ stageId: 'stg_01', time: '08:12.5' }, { stageId: 'stg_02', time: '15:30.1' }] },
    { rank: 2, competitor: competitors[0], totalTime: "1:15:45.8", stageTimes: [{ stageId: 'stg_01', time: '08:10.1' }, { stageId: 'stg_02', time: '15:42.2' }] },
    { rank: 3, competitor: competitors[2], totalTime: "1:16:01.0", stageTimes: [{ stageId: 'stg_01', time: '08:20.3' }, { stageId: 'stg_02', time: '15:35.5' }] },
    { rank: 4, competitor: competitors[3], totalTime: "1:16:12.5", stageTimes: [{ stageId: 'stg_01', time: '08:25.0' }, { stageId: 'stg_02', time: '15:40.3' }] },
];
