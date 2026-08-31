export type GameMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'NexTerra';

export type TeamStatus = 'pending' | 'qualified' | 'rejected' | 'waitlisted' | 'disqualified';
export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'exempt';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AnnouncementType = 'urgent' | 'rule_update' | 'schedule' | 'general';
export type AnnouncementPriority = 'urgent' | 'rule_change' | 'schedule_update' | 'info' | 'disqualification';
export type TournamentStatus = 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed';
export type NavigationTab = 'overview' | 'tournaments' | 'teams' | 'matches' | 'standings' | 'payments' | 'announcements' | 'settings';

export interface Player {
  name: string;
  uid: string; // Free Fire Player UID
  ign: string; // In Game Name
  role: 'Captain' | 'Fragger' | 'Sniper' | 'Support' | 'Rusher' | 'Substitute' | string;
  phone?: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  teamName: string;
  tag?: string;
  captainName: string;
  captainPhone: string;
  captainEmail?: string;
  captainDiscord?: string;
  logoUrl?: string;
  players: Player[];
  status: TeamStatus;
  group: 'A' | 'B' | 'C' | 'Finals' | 'Unassigned' | string;
  slotNumber: number | null; // 1 to 12
  paymentId?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  format: 'Squad' | 'Duo' | 'Solo';
  prizePool: number;
  currency: string;
  entryFee: number;
  totalSlots: number;
  registeredCount: number;
  registrationDeadline: string;
  startDate: string;
  endDate?: string;
  bannerUrl: string;
  rules: string;
  status: TournamentStatus;
  groups: string[]; // e.g. ['A', 'B', 'C', 'Finals']
  createdAt: string;
  updatedAt: string;
}

export interface MatchFixture {
  id: string;
  tournamentId: string;
  matchNumber: number;
  title: string;
  map: GameMap;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  group: string; // 'A', 'B', 'C', 'Finals', 'All'
  status: MatchStatus;
  roomId: string;
  roomPassword: string;
  credentialsReleaseTime: string; // ISO date string
  isCredentialsPublished: boolean;
  autoPublish15Min: boolean;
  streamUrl?: string;
  createdAt: string;
}

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  slotNumber: number;
  placement: number; // 1 to 12
  placementPoints: number; // Auto: 1st=12, 2nd=9, 3rd=8, 4th=7, 5th=6, 6th=5, 7th=4, 8th=3, 9th=2, 10th=1, 11th=0, 12th=0
  kills: number;
  killPoints: number; // kills * 1
  totalPoints: number; // placementPoints + killPoints
  isBooyah: boolean;
}

export interface TournamentStandings {
  id: string;
  tournamentId: string;
  matchId?: string; // specific match or cumulative overall
  stage: 'overall' | 'group_stage' | 'finals' | 'match_result';
  group?: string;
  results: TeamMatchResult[];
  isPublished: boolean;
  publishedAt?: string;
  updatedAt: string;
}

export interface PaymentReceipt {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  amount: number;
  upiId: string;
  utrNumber: string;
  screenshotUrl: string;
  status: PaymentStatus;
  adminNote?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface Announcement {
  id: string;
  tournamentId?: string;
  title: string;
  content: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  targetAudience?: string;
  pinned?: boolean;
  isPinned?: boolean;
  author: string;
  createdAt: string;
}

export interface OrganizerSettings {
  id?: string;
  upiId: string;
  payeeName: string;
  qrCodeUrl: string;
  whatsappGroupUrl?: string;
  whatsappSupportNumber?: string;
  discordServerUrl?: string;
  discordInviteUrl?: string;
  supportPhone?: string;
  contactEmail?: string;
  defaultRules?: string;
  adminEmails?: string[];
  authorizedAdminEmails?: string[];
  pointTableRule?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
    11: number;
    12: number;
    killPoint: number;
  };
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  module: 'Tournaments' | 'Teams' | 'Matches' | 'Standings' | 'Payments' | 'Announcements' | 'Settings' | 'Auth';
  details: string;
  targetId?: string;
  timestamp: string;
}

export interface AdminUser {
  email: string;
  displayName: string;
  role: 'Super Admin' | 'Match Admin' | 'Scorekeeper';
  isAuthorized: boolean;
  avatarUrl?: string;
}
