import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { TournamentManager } from './components/tournaments/TournamentManager';
import { TeamSquadManager } from './components/teams/TeamSquadManager';
import { MatchScheduler } from './components/matches/MatchScheduler';
import { PointTableCalculator } from './components/standings/PointTableCalculator';
import { PaymentVerificationPortal } from './components/payments/PaymentVerificationPortal';
import { NoticeBoardManager } from './components/announcements/NoticeBoardManager';
import { SettingsConfigurator } from './components/settings/SettingsConfigurator';
import { dbService } from './services/db';
import {
  Tournament,
  Team,
  MatchFixture,
  TournamentStandings,
  PaymentReceipt,
  Announcement,
  OrganizerSettings,
  AuditLog,
  NavigationTab
} from './types';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Firestore Real-Time State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchFixture[]>([]);
  const [standings, setStandings] = useState<TournamentStandings[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<OrganizerSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Subscriptions
  useEffect(() => {
    const unsubTournaments = dbService.subscribeTournaments((data) => {
      setTournaments(data);
      if (data.length > 0) {
        if (!selectedTournamentId || !data.some(t => t.id === selectedTournamentId)) {
          setSelectedTournamentId(data[0].id);
        }
      } else {
        setSelectedTournamentId('');
      }
    });

    const unsubTeams = dbService.subscribeTeams(selectedTournamentId || null, setTeams);
    const unsubMatches = dbService.subscribeMatches(selectedTournamentId || null, setMatches);
    const unsubStandings = dbService.subscribeStandings(selectedTournamentId || null, setStandings);
    const unsubPayments = dbService.subscribePayments(selectedTournamentId || null, setPayments);
    const unsubAnnouncements = dbService.subscribeAnnouncements(setAnnouncements);
    const unsubSettings = dbService.subscribeSettings(setSettings);
    const unsubAuditLogs = dbService.subscribeAuditLogs(setAuditLogs);

    return () => {
      unsubTournaments();
      unsubTeams();
      unsubMatches();
      unsubStandings();
      unsubPayments();
      unsubAnnouncements();
      unsubSettings();
      unsubAuditLogs();
    };
  }, [selectedTournamentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4D00] to-amber-500 animate-spin flex items-center justify-center p-2">
          <div className="w-full h-full bg-[#0A0A0C] rounded-xl" />
        </div>
        <p className="text-xs font-mono text-zinc-400">CONNECTING TO FIREBASE FIRESTORE...</p>
      </div>
    );
  }

  // Not logged in or unauthorized
  if (!user) {
    return <LoginView />;
  }

  // Active Tournament Object
  const currentTournament =
    tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0] || null;

  // Counts for sidebar badges
  const pendingTeamsCount = teams.filter((t) => t.status === 'pending').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const activeMatchesCount = matches.filter((m) => m.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 flex flex-col antialiased selection:bg-[#FF4D00] selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        activeTournamentId={selectedTournamentId}
        tournaments={tournaments}
        onSelectTournament={setSelectedTournamentId}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingTeamsCount={pendingTeamsCount}
          pendingPaymentsCount={pendingPaymentsCount}
          activeMatchesCount={activeMatchesCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Stage Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <OverviewView
              currentTournament={currentTournament}
              teams={teams}
              matches={matches}
              payments={payments}
              announcements={announcements}
              onNavigate={setActiveTab}
              onSelectTournament={setSelectedTournamentId}
            />
          )}

          {activeTab === 'tournaments' && (
            <TournamentManager
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
              onSelectTournament={setSelectedTournamentId}
            />
          )}

          {activeTab === 'teams' && (
            <TeamSquadManager
              teams={teams}
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
            />
          )}

          {activeTab === 'matches' && (
            <MatchScheduler
              matches={matches}
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
            />
          )}

          {activeTab === 'standings' && (
            <PointTableCalculator
              standings={standings}
              teams={teams}
              matches={matches}
              selectedTournamentId={selectedTournamentId}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentVerificationPortal
              payments={payments}
              teams={teams}
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
            />
          )}

          {activeTab === 'announcements' && (
            <NoticeBoardManager
              announcements={announcements}
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsConfigurator settings={settings} auditLogs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
