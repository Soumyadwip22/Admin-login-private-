import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Tournament,
  Team,
  MatchFixture,
  TournamentStandings,
  PaymentReceipt,
  Announcement,
  OrganizerSettings,
  AuditLog,
  TeamMatchResult
} from '../types';

export const DEFAULT_PLACEMENT_POINTS: Record<number, number> = {
  1: 12, // Booyah
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
};

export const DEFAULT_SETTINGS: OrganizerSettings = {
  id: 'general',
  upiId: 'ff.esports.organizer@okaxis',
  payeeName: 'FF Battleground Series Official',
  qrCodeUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
  whatsappGroupUrl: 'https://chat.whatsapp.com/sample-ff-esports-scrims',
  discordServerUrl: 'https://discord.gg/sample-ff-arena',
  supportPhone: '+91 98765 43210',
  contactEmail: 'mondalsoumyadwip1110@gmail.com',
  defaultRules: `1. All players must join the room 10 minutes prior to match schedule.\n2. Team Captain must submit valid in-game UIDs and exact IGN.\n3. Emulators are strictly prohibited unless specified in tournament tier.\n4. Hack/Script usage will result in permanent team ban and prize forfeiture.\n5. Screenshot proof of kills and placement is required in case of dispute.`,
  adminEmails: ['mondalsoumyadwip1110@gmail.com', 'soumyadwipmondal869@gmail.com'],
  pointTableRule: {
    1: 12,
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
    11: 0,
    12: 0,
    killPoint: 1
  }
};

// Default initial states (Clean, zero demo lists)
export const INITIAL_TOURNAMENTS: Tournament[] = [];
export const INITIAL_TEAMS: Team[] = [];
export const INITIAL_MATCHES: MatchFixture[] = [];
export const INITIAL_PAYMENTS: PaymentReceipt[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_STANDINGS: TournamentStandings = {
  id: 'standings-general',
  tournamentId: '',
  stage: 'overall',
  group: 'A',
  results: [],
  isPublished: false,
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Helper: Local fallback store so UI is always responsive even if network is throttled
const LOCAL_STORAGE_KEY_PREFIX = 'ff_esports_admin_';

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// -------------------------------------------------------------
// FIRESTORE SYNC & CRUD OPERATIONS
// -------------------------------------------------------------

export const dbService = {
  // --- AUDIT LOGS ---
  async logAdminAction(adminEmail: string, action: string, module: AuditLog['module'], details: string, targetId?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      adminEmail,
      action,
      module,
      details,
      targetId: targetId || '',
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'audit_logs', log.id), log);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'audit_logs');
    }
    const current = getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    setLocalData('audit_logs', [log, ...current]);
  },

  subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
          setLocalData('audit_logs', logs);
          callback(logs);
        } else {
          callback(getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'audit_logs');
        callback(getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS));
      });
    } catch (e) {
      callback(getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS));
      return () => {};
    }
  },

  // --- TOURNAMENTS ---
  subscribeTournaments(callback: (tournaments: Tournament[]) => void) {
    try {
      return onSnapshot(collection(db, 'tournaments'), (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament));
          setLocalData('tournaments', items);
          callback(items);
        } else {
          // Initialize with seed data if empty
          this.seedInitialDataIfEmpty();
          callback(getLocalData<Tournament[]>('tournaments', INITIAL_TOURNAMENTS));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tournaments');
        callback(getLocalData<Tournament[]>('tournaments', INITIAL_TOURNAMENTS));
      });
    } catch (e) {
      callback(getLocalData<Tournament[]>('tournaments', INITIAL_TOURNAMENTS));
      return () => {};
    }
  },

  async saveTournament(tournament: Tournament, adminEmail: string) {
    const updated = {
      ...tournament,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'tournaments', tournament.id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tournaments/${tournament.id}`);
    }
    const current = getLocalData<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
    const index = current.findIndex(t => t.id === tournament.id);
    if (index >= 0) current[index] = updated;
    else current.unshift(updated);
    setLocalData('tournaments', current);

    await this.logAdminAction(adminEmail, 'Save Tournament', 'Tournaments', `Saved tournament ${tournament.title} (${tournament.id})`, tournament.id);
    return updated;
  },

  async deleteTournament(tournamentId: string, adminEmail: string) {
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tournaments/${tournamentId}`);
    }
    const current = getLocalData<Tournament[]>('tournaments', INITIAL_TOURNAMENTS).filter(t => t.id !== tournamentId);
    setLocalData('tournaments', current);
    await this.logAdminAction(adminEmail, 'Delete Tournament', 'Tournaments', `Deleted tournament ID ${tournamentId}`, tournamentId);
  },

  // --- TEAMS ---
  subscribeTeams(tournamentId: string | null, callback: (teams: Team[]) => void) {
    try {
      const colRef = collection(db, 'teams');
      const q = tournamentId ? query(colRef, where('tournamentId', '==', tournamentId)) : colRef;

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
          setLocalData('teams', items);
          callback(items);
        } else {
          const localTeams = getLocalData<Team[]>('teams', INITIAL_TEAMS);
          const filtered = tournamentId ? localTeams.filter(t => t.tournamentId === tournamentId) : localTeams;
          callback(filtered);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'teams');
        const localTeams = getLocalData<Team[]>('teams', INITIAL_TEAMS);
        callback(tournamentId ? localTeams.filter(t => t.tournamentId === tournamentId) : localTeams);
      });
    } catch (e) {
      const localTeams = getLocalData<Team[]>('teams', INITIAL_TEAMS);
      callback(tournamentId ? localTeams.filter(t => t.tournamentId === tournamentId) : localTeams);
      return () => {};
    }
  },

  async saveTeam(team: Team, adminEmail: string) {
    const updated = {
      ...team,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'teams', team.id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teams/${team.id}`);
    }
    const current = getLocalData<Team[]>('teams', INITIAL_TEAMS);
    const idx = current.findIndex(t => t.id === team.id);
    if (idx >= 0) current[idx] = updated;
    else current.unshift(updated);
    setLocalData('teams', current);

    await this.logAdminAction(adminEmail, 'Update Team', 'Teams', `Updated team ${team.teamName} status=${team.status}, group=${team.group}, slot=${team.slotNumber}`, team.id);
    return updated;
  },

  async updateTeamStatus(teamId: string, status: Team['status'], adminEmail: string, note?: string) {
    const updates: Partial<Team> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (note) updates.notes = note;

    try {
      await updateDoc(doc(db, 'teams', teamId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    }
    const current = getLocalData<Team[]>('teams', INITIAL_TEAMS);
    const team = current.find(t => t.id === teamId);
    if (team) {
      team.status = status;
      if (note) team.notes = note;
      team.updatedAt = new Date().toISOString();
      setLocalData('teams', current);
    }
    await this.logAdminAction(adminEmail, 'Change Team Status', 'Teams', `Changed team ${team?.teamName || teamId} status to ${status.toUpperCase()}`, teamId);
  },

  async allocateTeamSlot(teamId: string, group: Team['group'], slotNumber: number | null, adminEmail: string) {
    const updates: Partial<Team> = {
      group,
      slotNumber,
      updatedAt: new Date().toISOString()
    };
    try {
      await updateDoc(doc(db, 'teams', teamId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    }
    const current = getLocalData<Team[]>('teams', INITIAL_TEAMS);
    const team = current.find(t => t.id === teamId);
    if (team) {
      team.group = group;
      team.slotNumber = slotNumber;
      team.updatedAt = new Date().toISOString();
      setLocalData('teams', current);
    }
    await this.logAdminAction(adminEmail, 'Allocate Slot', 'Teams', `Allocated team ${team?.teamName || teamId} to Group ${group}, Slot #${slotNumber || 'None'}`, teamId);
  },

  async deleteTeam(teamId: string, adminEmail: string) {
    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teams/${teamId}`);
    }
    const current = getLocalData<Team[]>('teams', INITIAL_TEAMS).filter(t => t.id !== teamId);
    setLocalData('teams', current);
    await this.logAdminAction(adminEmail, 'Delete Team', 'Teams', `Deleted team ID ${teamId}`, teamId);
  },

  // --- MATCH FIXTURES & CREDENTIALS ---
  subscribeMatches(tournamentId: string | null, callback: (matches: MatchFixture[]) => void) {
    try {
      const colRef = collection(db, 'matches');
      const q = tournamentId ? query(colRef, where('tournamentId', '==', tournamentId)) : colRef;

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MatchFixture));
          setLocalData('matches', items);
          callback(items);
        } else {
          const local = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
          callback(tournamentId ? local.filter(m => m.tournamentId === tournamentId) : local);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'matches');
        const local = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
        callback(tournamentId ? local.filter(m => m.tournamentId === tournamentId) : local);
      });
    } catch (e) {
      const local = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
      callback(tournamentId ? local.filter(m => m.tournamentId === tournamentId) : local);
      return () => {};
    }
  },

  async saveMatch(match: MatchFixture, adminEmail: string) {
    try {
      await setDoc(doc(db, 'matches', match.id), match);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `matches/${match.id}`);
    }
    const current = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
    const idx = current.findIndex(m => m.id === match.id);
    if (idx >= 0) current[idx] = match;
    else current.push(match);
    setLocalData('matches', current);

    await this.logAdminAction(adminEmail, 'Save Match Fixture', 'Matches', `Saved match #${match.matchNumber} (${match.title}) Map: ${match.map}`, match.id);
    return match;
  },

  async updateMatchStatus(matchId: string, status: MatchFixture['status'], adminEmail: string) {
    try {
      await updateDoc(doc(db, 'matches', matchId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }
    const current = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
    const match = current.find(m => m.id === matchId);
    if (match) {
      match.status = status;
      setLocalData('matches', current);
    }
    await this.logAdminAction(adminEmail, 'Update Match Status', 'Matches', `Updated match status to ${status.toUpperCase()}`, matchId);
  },

  async publishRoomCredentials(matchId: string, isPublished: boolean, adminEmail: string) {
    try {
      await updateDoc(doc(db, 'matches', matchId), { isCredentialsPublished: isPublished });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }
    const current = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES);
    const match = current.find(m => m.id === matchId);
    if (match) {
      match.isCredentialsPublished = isPublished;
      setLocalData('matches', current);
    }
    await this.logAdminAction(adminEmail, isPublished ? 'Publish Credentials' : 'Hide Credentials', 'Matches', `${isPublished ? 'Published' : 'Hidden'} Room ID & Password for match ID ${matchId}`, matchId);
  },

  async deleteMatch(matchId: string, adminEmail: string) {
    try {
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `matches/${matchId}`);
    }
    const current = getLocalData<MatchFixture[]>('matches', INITIAL_MATCHES).filter(m => m.id !== matchId);
    setLocalData('matches', current);
    await this.logAdminAction(adminEmail, 'Delete Match', 'Matches', `Deleted match ID ${matchId}`, matchId);
  },

  // --- STANDINGS & POINT TABLE ---
  subscribeStandings(tournamentId: string | null, callback: (standings: TournamentStandings[]) => void) {
    try {
      const colRef = collection(db, 'standings');
      const q = tournamentId ? query(colRef, where('tournamentId', '==', tournamentId)) : colRef;

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TournamentStandings));
          setLocalData('standings', items);
          callback(items);
        } else {
          callback([getLocalData<TournamentStandings>('standings_s4', INITIAL_STANDINGS)]);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'standings');
        callback([getLocalData<TournamentStandings>('standings_s4', INITIAL_STANDINGS)]);
      });
    } catch (e) {
      callback([getLocalData<TournamentStandings>('standings_s4', INITIAL_STANDINGS)]);
      return () => {};
    }
  },

  async saveStandings(standings: TournamentStandings, adminEmail: string) {
    const updated = {
      ...standings,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'standings', standings.id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `standings/${standings.id}`);
    }
    setLocalData('standings_s4', updated);
    await this.logAdminAction(adminEmail, 'Save Standings Table', 'Standings', `Calculated and saved standings table (${standings.stage}) with ${standings.results.length} teams. Published: ${standings.isPublished}`, standings.id);
    return updated;
  },

  async publishStandings(standingsId: string, isPublished: boolean, adminEmail: string) {
    const updates = {
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString()
    };
    try {
      await updateDoc(doc(db, 'standings', standingsId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `standings/${standingsId}`);
    }
    const current = getLocalData<TournamentStandings>('standings_s4', INITIAL_STANDINGS);
    if (current.id === standingsId) {
      current.isPublished = isPublished;
      current.publishedAt = updates.publishedAt;
      setLocalData('standings_s4', current);
    }
    await this.logAdminAction(adminEmail, isPublished ? 'Publish Standings Publicly' : 'Unpublish Standings', 'Standings', `${isPublished ? 'Published' : 'Unpublished'} live leaderboard for standings ID ${standingsId}`, standingsId);
  },

  // --- PAYMENTS & UTR VERIFICATION ---
  subscribePayments(tournamentId: string | null, callback: (payments: PaymentReceipt[]) => void) {
    try {
      const colRef = collection(db, 'payments');
      const q = tournamentId ? query(colRef, where('tournamentId', '==', tournamentId)) : colRef;

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PaymentReceipt));
          setLocalData('payments', items);
          callback(items);
        } else {
          callback(getLocalData<PaymentReceipt[]>('payments', INITIAL_PAYMENTS));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'payments');
        callback(getLocalData<PaymentReceipt[]>('payments', INITIAL_PAYMENTS));
      });
    } catch (e) {
      callback(getLocalData<PaymentReceipt[]>('payments', INITIAL_PAYMENTS));
      return () => {};
    }
  },

  async verifyPayment(paymentId: string, status: PaymentReceipt['status'], adminNote: string, adminEmail: string) {
    const updates: Partial<PaymentReceipt> = {
      status,
      adminNote,
      verifiedAt: status === 'verified' ? new Date().toISOString() : undefined
    };
    try {
      await updateDoc(doc(db, 'payments', paymentId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
    }
    const payments = getLocalData<PaymentReceipt[]>('payments', INITIAL_PAYMENTS);
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = status;
      payment.adminNote = adminNote;
      payment.verifiedAt = updates.verifiedAt;
      setLocalData('payments', payments);

      // Auto sync with team paymentStatus
      if (payment.teamId) {
        await this.updateTeamStatus(payment.teamId, status === 'verified' ? 'qualified' : 'pending', adminEmail, `Payment ${status.toUpperCase()} - UTR ${payment.utrNumber}`);
        try {
          await updateDoc(doc(db, 'teams', payment.teamId), {
            paymentStatus: status,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          // ignore
        }
      }
    }

    await this.logAdminAction(adminEmail, 'Verify Payment Receipt', 'Payments', `Marked payment ${paymentId} (UTR: ${payment?.utrNumber}) as ${status.toUpperCase()}. Note: ${adminNote}`, paymentId);
  },

  // --- ANNOUNCEMENTS & NOTICES ---
  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
          setLocalData('announcements', items);
          callback(items);
        } else {
          callback(getLocalData<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
        callback(getLocalData<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS));
      });
    } catch (e) {
      callback(getLocalData<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS));
      return () => {};
    }
  },

  async saveAnnouncement(announcement: Announcement, adminEmail: string) {
    try {
      await setDoc(doc(db, 'announcements', announcement.id), announcement);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `announcements/${announcement.id}`);
    }
    const current = getLocalData<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    const idx = current.findIndex(a => a.id === announcement.id);
    if (idx >= 0) current[idx] = announcement;
    else current.unshift(announcement);
    setLocalData('announcements', current);

    await this.logAdminAction(adminEmail, 'Post Notice', 'Announcements', `Broadcasted notice: "${announcement.title}" (${announcement.type})`, announcement.id);
    return announcement;
  },

  async deleteAnnouncement(announcementId: string, adminEmail: string) {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${announcementId}`);
    }
    const current = getLocalData<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS).filter(a => a.id !== announcementId);
    setLocalData('announcements', current);
    await this.logAdminAction(adminEmail, 'Delete Notice', 'Announcements', `Removed notice ID ${announcementId}`, announcementId);
  },

  // --- ORGANIZER SETTINGS ---
  subscribeSettings(callback: (settings: OrganizerSettings) => void) {
    try {
      return onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as OrganizerSettings;
          setLocalData('settings', data);
          callback(data);
        } else {
          callback(getLocalData<OrganizerSettings>('settings', DEFAULT_SETTINGS));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/general');
        callback(getLocalData<OrganizerSettings>('settings', DEFAULT_SETTINGS));
      });
    } catch (e) {
      callback(getLocalData<OrganizerSettings>('settings', DEFAULT_SETTINGS));
      return () => {};
    }
  },

  async saveSettings(settings: OrganizerSettings, adminEmail: string) {
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    }
    setLocalData('settings', settings);
    await this.logAdminAction(adminEmail, 'Update Organizer Settings', 'Settings', `Updated UPI ID: ${settings.upiId}, Payee: ${settings.payeeName}`);
    return settings;
  },

  // --- SEEDING & CLEARING METHODS ---
  async clearAllLists(adminEmail: string) {
    try {
      // Clear Firestore collections
      const collectionsToClear = ['tournaments', 'teams', 'matches', 'payments', 'announcements', 'standings'];
      for (const colName of collectionsToClear) {
        try {
          const snap = await getDocs(collection(db, colName));
          for (const d of snap.docs) {
            await deleteDoc(doc(db, colName, d.id));
          }
        } catch (e) {
          // ignore individual delete failure
        }
      }
    } catch (e) {
      console.warn('Firestore purge error:', e);
    }

    // Clear local storage buffers
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'tournaments');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'teams');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'matches');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'payments');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'announcements');
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'standings');
    } catch (e) {
      // ignore
    }

    await this.logAdminAction(adminEmail, 'Purge All Database Records', 'Settings', 'Cleared all demo tournament, team, match, and payment lists.');
  },

  async seedInitialDataIfEmpty() {
    // Keep clean - do not inject demo items automatically
  }
};
