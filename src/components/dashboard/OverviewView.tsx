import React from 'react';
import {
  Trophy,
  Users,
  Swords,
  CreditCard,
  Flame,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  IndianRupee,
  Megaphone,
  Layers,
  KeyRound,
  ExternalLink,
  Activity
} from 'lucide-react';
import {
  Tournament,
  Team,
  MatchFixture,
  PaymentReceipt,
  Announcement,
  NavigationTab
} from '../../types';

interface OverviewViewProps {
  currentTournament: Tournament | null;
  teams: Team[];
  matches: MatchFixture[];
  payments: PaymentReceipt[];
  announcements: Announcement[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectTournament: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentTournament,
  teams,
  matches,
  payments,
  announcements,
  onNavigate,
  onSelectTournament
}) => {
  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const totalRevenue = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const qualifiedTeams = teams.filter(t => t.status === 'qualified');
  const pendingTeams = teams.filter(t => t.status === 'pending');
  const liveMatches = matches.filter(m => m.status === 'in_progress');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');

  const slotFillPercent = currentTournament
    ? Math.round(((currentTournament.registeredCount || teams.length) / (currentTournament.totalSlots || 36)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Tournament Highlight Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14141A] border border-zinc-800/90 p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#FF4D00]/10 via-[#FF4D00]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#FF4D00]" /> FREE FIRE ESPORTS COMMAND STATION
              </span>
              <span className="text-zinc-400 text-xs font-mono">• Active Season 4</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Chakra_Petch'] tracking-wide">
              {currentTournament?.title || 'Free Fire Pro Scrims Championship'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Control room credentials, verify team rosters and UPI UTR payments, orchestrate custom room 12-slot lobbies, and calculate auto-ranked esports standings.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('matches')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#FF4D00]/25 transition-all cursor-pointer hover:scale-102"
            >
              <KeyRound className="w-4 h-4" />
              <span>Manage Room IDs</span>
            </button>

            <button
              onClick={() => onNavigate('standings')}
              className="flex items-center gap-2 bg-[#1A1A24] hover:bg-[#252535] text-zinc-200 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#00FF66]" />
              <span>Standings Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams Card */}
        <div
          onClick={() => onNavigate('teams')}
          className="p-5 rounded-2xl bg-[#14141A] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 font-mono">REGISTERED SQUADS</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{teams.length}</span>
            <span className="text-xs font-mono text-[#00FF66] font-semibold">{qualifiedTeams.length} Qualified</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {pendingTeams.length} pending review
          </div>
        </div>

        {/* Slot Capacity Card */}
        <div
          onClick={() => onNavigate('tournaments')}
          className="p-5 rounded-2xl bg-[#14141A] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 font-mono">SLOT CAPACITY</span>
            <div className="p-2 rounded-xl bg-[#FF4D00]/10 text-[#FF4D00] group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">
              {currentTournament?.registeredCount || teams.length} / {currentTournament?.totalSlots || 36}
            </span>
            <span className="text-xs font-mono text-[#FF4D00] font-bold">{slotFillPercent}%</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF4D00] to-[#00FF66]" style={{ width: `${Math.min(100, slotFillPercent)}%` }} />
          </div>
        </div>

        {/* Verified Revenue Card */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-5 rounded-2xl bg-[#14141A] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 font-mono">COLLECTED FEES</span>
            <div className="p-2 rounded-xl bg-[#00FF66]/10 text-[#00FF66] group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-xs font-mono text-zinc-400">{verifiedPayments.length} verified</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {payments.filter(p => p.status === 'pending').length} pending UTR checks
          </div>
        </div>

        {/* Matches Status Card */}
        <div
          onClick={() => onNavigate('matches')}
          className="p-5 rounded-2xl bg-[#14141A] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 font-mono">MATCH FIXTURES</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{matches.length}</span>
            {liveMatches.length > 0 ? (
              <span className="text-xs font-mono text-[#FF4D00] font-bold animate-pulse flex items-center gap-1">
                <Flame className="w-3 h-3" /> {liveMatches.length} Live
              </span>
            ) : (
              <span className="text-xs font-mono text-zinc-400">{upcomingMatches.length} Scheduled</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            15-min auto unlock enabled
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Live Fixture + Recent Team Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Match Fixtures Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#FF4D00]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Upcoming & Active Fixtures
                </h3>
              </div>
              <button
                onClick={() => onNavigate('matches')}
                className="text-[11px] text-[#FF4D00] hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({matches.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {matches.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-[#0E0E14] border border-dashed border-zinc-800/80 p-4">
                  <Swords className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">No matches scheduled yet</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">Create match fixtures with 12-slot custom rooms</p>
                  <button
                    onClick={() => onNavigate('matches')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#FF4D00]/15 hover:bg-[#FF4D00]/25 text-[#FF4D00] text-xs font-semibold font-mono cursor-pointer transition-colors"
                  >
                    + Schedule First Match
                  </button>
                </div>
              ) : (
                matches.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#0E0E14] border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-[#FF4D00] text-xs">
                        #{m.matchNumber}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{m.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {m.map} • {m.date} at {m.time} IST
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400 font-mono">Room ID</div>
                        <div className="text-xs font-mono font-bold text-white">{m.roomId}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        m.status === 'in_progress' ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Notice Board Stream */}
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#FF4D00]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Live Broadcast Notices
                </h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-[11px] text-[#FF4D00] hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Broadcast Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {announcements.length === 0 ? (
                <div className="text-center py-6 rounded-xl bg-[#0E0E14] border border-dashed border-zinc-800/80 p-4">
                  <Megaphone className="w-5 h-5 text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-400 font-medium">No live announcements posted</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">Broadcast room rules & schedule updates</p>
                </div>
              ) : (
                announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-[#0E0E14] border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#FF4D00] font-mono uppercase">{ann.type || 'Notice'}</span>
                      <span className="text-zinc-400 font-mono">{ann.author || 'Admin'}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{ann.title}</div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Squads Needing Review */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Latest Team Registrations
                </h3>
              </div>
              <button
                onClick={() => onNavigate('teams')}
                className="text-[11px] text-[#FF4D00] hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>All Squads ({teams.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {teams.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-[#0E0E14] border border-dashed border-zinc-800/80 p-4">
                  <Users className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">No teams registered yet</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">Teams will appear here upon registration</p>
                  <button
                    onClick={() => onNavigate('teams')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#00FF66]/15 hover:bg-[#00FF66]/25 text-[#00FF66] text-xs font-semibold font-mono cursor-pointer transition-colors"
                  >
                    + Register First Squad
                  </button>
                </div>
              ) : (
                teams.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#0E0E14] border border-zinc-800/80 flex items-center justify-between gap-2 hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{t.teamName}</span>
                        <span className="text-[9px] font-mono px-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {t.group}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Captain: {t.captainName} ({t.captainPhone})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        t.status === 'qualified'
                          ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                          : t.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                      <div className="text-[9px] text-zinc-400 font-mono mt-1">
                        Slot: {t.slotNumber ? `#${t.slotNumber}` : 'None'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Organizer Quick Guide / Room Rules Reference */}
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-200 font-bold font-['Chakra_Petch']">
              <ShieldCheck className="w-4 h-4 text-[#FF4D00]" />
              <span>TOURNAMENT ORGANIZER PROTOCOL</span>
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
              <li>Custom Room 12-Slot allocation must follow Group stage matrix.</li>
              <li>Always check 12-digit UTR in bank account before clicking Verify.</li>
              <li>Standings engine calculates points automatically per official FF matrix.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
