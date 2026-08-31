import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Edit3,
  Layers,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Team, TeamStatus, Player, Tournament } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface TeamSquadManagerProps {
  teams: Team[];
  tournaments: Tournament[];
  selectedTournamentId: string;
}

export const TeamSquadManager: React.FC<TeamSquadManagerProps> = ({
  teams,
  tournaments,
  selectedTournamentId
}) => {
  const { user } = useAuth();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [selectedTeamForRoster, setSelectedTeamForRoster] = useState<Team | null>(null);
  const [selectedTeamForSlot, setSelectedTeamForSlot] = useState<Team | null>(null);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState<boolean>(false);
  const [isSlotAllocatorOpen, setIsSlotAllocatorOpen] = useState<boolean>(false);

  // Slot Allocator State
  const [targetGroup, setTargetGroup] = useState<'A' | 'B' | 'C' | 'Finals' | 'Unassigned'>('A');
  const [targetSlot, setTargetSlot] = useState<number | null>(1);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newCaptainName, setNewCaptainName] = useState<string>('');
  const [newCaptainPhone, setNewCaptainPhone] = useState<string>('');
  const [newCaptainEmail, setNewCaptainEmail] = useState<string>('');
  const [newPlayers, setNewPlayers] = useState<Player[]>([
    { name: '', uid: '', ign: '', role: 'Captain' },
    { name: '', uid: '', ign: '', role: 'Fragger' },
    { name: '', uid: '', ign: '', role: 'Sniper' },
    { name: '', uid: '', ign: '', role: 'Support' }
  ]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Tournament matching
      if (selectedTournamentId && team.tournamentId && team.tournamentId !== selectedTournamentId) {
        return false;
      }

      // Group matching
      if (filterGroup !== 'all' && team.group !== filterGroup) {
        return false;
      }

      // Status matching
      if (filterStatus !== 'all' && team.status !== filterStatus) {
        return false;
      }

      // Search Query (Team ID, Team Name, Captain Phone, Player UID, or Player IGN)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTeamId = team.id.toLowerCase().includes(query);
        const matchesName = team.teamName.toLowerCase().includes(query);
        const matchesPhone = team.captainPhone.toLowerCase().includes(query);
        const matchesCaptain = team.captainName.toLowerCase().includes(query);
        const matchesPlayers = team.players?.some(
          (p) => p.uid.toLowerCase().includes(query) || p.ign.toLowerCase().includes(query) || p.name.toLowerCase().includes(query)
        );

        return matchesTeamId || matchesName || matchesPhone || matchesCaptain || matchesPlayers;
      }

      return true;
    });
  }, [teams, selectedTournamentId, filterGroup, filterStatus, searchQuery]);

  // Actions
  const handleStatusChange = async (teamId: string, status: TeamStatus, note?: string) => {
    await dbService.updateTeamStatus(teamId, status, user?.email || 'admin@ffesports.in', note);
  };

  const handleSaveSlot = async () => {
    if (!selectedTeamForSlot) return;
    await dbService.allocateTeamSlot(
      selectedTeamForSlot.id,
      targetGroup,
      targetSlot,
      user?.email || 'admin@ffesports.in'
    );
    setSelectedTeamForSlot(null);
    setIsSlotAllocatorOpen(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newCaptainName.trim()) return;

    const teamObj: Team = {
      id: `team-${Date.now()}`,
      tournamentId: selectedTournamentId || 'ff-championship-s4',
      teamName: newTeamName,
      tag: newTeamName.substring(0, 3).toUpperCase(),
      captainName: newCaptainName,
      captainPhone: newCaptainPhone,
      captainEmail: newCaptainEmail,
      players: newPlayers.filter(p => p.ign || p.uid),
      status: 'pending',
      group: 'Unassigned',
      slotNumber: null,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbService.saveTeam(teamObj, user?.email || 'admin@ffesports.in');
    setIsAddTeamModalOpen(false);
    // Reset
    setNewTeamName('');
    setNewCaptainName('');
    setNewCaptainPhone('');
    setNewCaptainEmail('');
  };

  const exportRostersCSV = () => {
    const rows = [
      ['Team ID', 'Team Name', 'Group', 'Slot Number', 'Status', 'Payment Status', 'Captain Name', 'Captain Phone', 'Player 1 UID', 'Player 1 IGN', 'Player 2 UID', 'Player 2 IGN', 'Player 3 UID', 'Player 3 IGN', 'Player 4 UID', 'Player 4 IGN', 'Player 5 UID', 'Player 5 IGN']
    ];

    filteredTeams.forEach((t) => {
      const p1 = t.players?.[0] || { uid: '', ign: '' };
      const p2 = t.players?.[1] || { uid: '', ign: '' };
      const p3 = t.players?.[2] || { uid: '', ign: '' };
      const p4 = t.players?.[3] || { uid: '', ign: '' };
      const p5 = t.players?.[4] || { uid: '', ign: '' };

      rows.push([
        `"${t.id}"`,
        `"${t.teamName}"`,
        `"${t.group}"`,
        `"${t.slotNumber || 'Unassigned'}"`,
        `"${t.status.toUpperCase()}"`,
        `"${t.paymentStatus.toUpperCase()}"`,
        `"${t.captainName}"`,
        `"${t.captainPhone}"`,
        `"${p1.uid}"`,
        `"${p1.ign}"`,
        `"${p2.uid}"`,
        `"${p2.ign}"`,
        `"${p3.uid}"`,
        `"${p3.ign}"`,
        `"${p4.uid}"`,
        `"${p4.ign}"`,
        `"${p5.uid}"`,
        `"${p5.ign}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FF_Esports_Roster_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusPill = (status: TeamStatus) => {
    switch (status) {
      case 'qualified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">QUALIFIED</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">REJECTED</span>;
      case 'waitlisted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">WAITLIST</span>;
      case 'disqualified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">DISQUALIFIED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">PENDING</span>;
    }
  };

  // Group Slot Occupancy Calculator
  const getOccupiedSlots = (group: string) => {
    const map = new Map<number, Team>();
    teams.filter(t => t.group === group && t.slotNumber !== null).forEach(t => {
      if (t.slotNumber) map.set(t.slotNumber, t);
    });
    return map;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF4D00]" />
              <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
                TEAM & SQUAD MANAGEMENT PORTAL
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Live registration sync, squad rosters verification, slot allocation (1-12), and qualification pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportRostersCSV}
              className="flex items-center gap-1.5 bg-[#1A1A22] hover:bg-[#242430] text-zinc-200 border border-zinc-700/80 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Export all team rosters and player UIDs to CSV for custom room referee"
            >
              <Download className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddTeamModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-[#FF4D00]/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Squad</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Team Name, ID, Captain Phone, or Player UID..."
              className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Filter */}
          <div className="md:col-span-3">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All Groups (A, B, C, Unassigned)</option>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
              <option value="C">Group C</option>
              <option value="Finals">Grand Finals</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="pending">Pending</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="rejected">Rejected</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60 text-xs font-mono">
          <span className="text-zinc-400">Total Registered: <strong className="text-white">{filteredTeams.length}</strong></span>
          <span className="text-zinc-600">•</span>
          <span className="text-[#00FF66]">Qualified: <strong>{filteredTeams.filter(t => t.status === 'qualified').length}</strong></span>
          <span className="text-zinc-600">•</span>
          <span className="text-amber-400">Pending: <strong>{filteredTeams.filter(t => t.status === 'pending').length}</strong></span>
          <span className="text-zinc-600">•</span>
          <span className="text-blue-400">Allocated Slots: <strong>{filteredTeams.filter(t => t.slotNumber !== null).length}</strong></span>
        </div>
      </div>

      {/* 12-Slot Visual Room Allocator Overview for Group A/B */}
      <div className="bg-[#14141A] p-4 md:p-5 rounded-2xl border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF4D00]" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              12-Slot Custom Room Grid (Group A)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Max 12 Teams per Match</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((slotNum) => {
            const occupied = getOccupiedSlots('A').get(slotNum);
            return (
              <div
                key={slotNum}
                className={`p-2.5 rounded-xl border transition-all text-xs ${
                  occupied
                    ? 'bg-[#18201A] border-[#00FF66]/40 text-white'
                    : 'bg-[#101015] border-zinc-800/80 border-dashed text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800">
                    Slot #{slotNum}
                  </span>
                  {occupied ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                  ) : (
                    <span className="text-[9px] text-zinc-400 uppercase">Available</span>
                  )}
                </div>
                <div className="truncate font-semibold text-xs text-white">
                  {occupied ? occupied.teamName : 'Vacant Slot'}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {occupied ? `${occupied.players?.length || 4} Players` : 'Unassigned'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Teams Data Table */}
      <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181822] text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Team & ID</th>
                <th className="py-3 px-3">Group / Slot</th>
                <th className="py-3 px-3">Captain Details</th>
                <th className="py-3 px-3 text-center">Roster (UIDs)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-400 text-xs">
                    No teams found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#181820]/70 transition-colors">
                    {/* Team Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-[#FF4D00] text-xs shrink-0">
                          {team.tag || team.teamName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{team.teamName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">ID: {team.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Group & Slot */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs text-zinc-200">
                          Group {team.group}
                        </span>
                        <div>
                          {team.slotNumber ? (
                            <span className="text-[10px] text-[#00FF66] font-mono font-semibold">
                              Slot #{team.slotNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              No slot
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Captain Details */}
                    <td className="py-3.5 px-3">
                      <div className="text-zinc-200 font-medium">{team.captainName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {team.captainPhone}
                      </div>
                    </td>

                    {/* Roster Button */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedTeamForRoster(team)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-[11px] transition-colors"
                      >
                        <Users className="w-3 h-3 text-[#FF4D00]" />
                        <span>{team.players?.length || 4} Players</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusPill(team.status)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        team.paymentStatus === 'verified'
                          ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                          : team.paymentStatus === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {team.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Slot Allocator Button */}
                        <button
                          onClick={() => {
                            setSelectedTeamForSlot(team);
                            setTargetGroup(team.group === 'Unassigned' ? 'A' : team.group);
                            setTargetSlot(team.slotNumber || 1);
                            setIsSlotAllocatorOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-[#FF4D00]/20 hover:text-[#FF4D00] text-zinc-300 text-[11px] font-medium transition-all"
                          title="Assign Group & Slot Number (1-12)"
                        >
                          Slot
                        </button>

                        {/* Quick Status Modifiers */}
                        {team.status !== 'qualified' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'qualified')}
                            className="p-1 rounded-lg bg-[#00FF66]/10 hover:bg-[#00FF66]/20 text-[#00FF66] transition-colors"
                            title="Qualify for Group Stage"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {team.status !== 'waitlisted' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'waitlisted')}
                            className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                            title="Move to Waitlist"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        {team.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'rejected', 'Roster or payment unverified')}
                            className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Reject Team"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {team.status !== 'disqualified' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'disqualified', 'Rule violation')}
                            className="p-1 rounded-lg bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-300 transition-colors"
                            title="Disqualify Team"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Viewer Modal */}
      {selectedTeamForRoster && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF4D00]" />
                <div>
                  <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                    {selectedTeamForRoster.teamName} — SQUAD ROSTER
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Captain: {selectedTeamForRoster.captainName} ({selectedTeamForRoster.captainPhone})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamForRoster(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedTeamForRoster.players?.map((player, idx) => (
                <div
                  key={idx}
                  className="bg-[#0E0E12] p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{player.ign || player.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-[#FF4D00] font-semibold">
                        {player.role || 'Member'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Name: {player.name || 'N/A'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-[#00FF66]">
                      UID: {player.uid || 'Pending'}
                    </div>
                    {player.phone && (
                      <div className="text-[10px] text-zinc-400 font-mono">{player.phone}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTeamForRoster(null)}
                className="px-4 py-2 rounded-xl text-xs bg-zinc-800 text-white hover:bg-zinc-700"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Allocator Modal */}
      {isSlotAllocatorOpen && selectedTeamForSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                  ALLOCATE GROUP & ROOM SLOT
                </h3>
              </div>
              <button
                onClick={() => setIsSlotAllocatorOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-300">
              Allocating slot for team: <strong className="text-[#FF4D00]">{selectedTeamForSlot.teamName}</strong>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Group</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value as any)}
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                  <option value="Finals">Grand Finals</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Custom Room Slot Number (1 - 12)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((sNum) => {
                    const isOccupiedByOther = teams.some(
                      t => t.group === targetGroup && t.slotNumber === sNum && t.id !== selectedTeamForSlot.id
                    );
                    const isSelected = targetSlot === sNum;

                    return (
                      <button
                        type="button"
                        key={sNum}
                        onClick={() => setTargetSlot(sNum)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? 'bg-[#FF4D00] text-white shadow-md shadow-[#FF4D00]/30'
                            : isOccupiedByOther
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-[#0E0E12] text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        Slot {sNum}
                        {isOccupiedByOther && <span className="block text-[8px] font-sans text-red-400">Occupied</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSlotAllocatorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlot}
                className="px-5 py-2 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] font-semibold"
              >
                Confirm Slot Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Squad Registration Modal */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                  MANUAL SQUAD REGISTRATION
                </h3>
              </div>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Squad / Team Name</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Total Gaming Esports"
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Captain Name</label>
                  <input
                    type="text"
                    value={newCaptainName}
                    onChange={(e) => setNewCaptainName(e.target.value)}
                    placeholder="Captain Full Name"
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Captain WhatsApp Phone</label>
                  <input
                    type="tel"
                    value={newCaptainPhone}
                    onChange={(e) => setNewCaptainPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Captain Email</label>
                  <input
                    type="email"
                    value={newCaptainEmail}
                    onChange={(e) => setNewCaptainEmail(e.target.value)}
                    placeholder="captain@email.com"
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-2">4-Player Squad Lineup (UIDs & IGNs)</label>
                <div className="space-y-2">
                  {newPlayers.map((p, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 bg-[#0E0E12] p-2 rounded-xl border border-zinc-800">
                      <input
                        type="text"
                        placeholder={`Player ${index + 1} Name`}
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...newPlayers];
                          updated[index].name = e.target.value;
                          setNewPlayers(updated);
                        }}
                        className="bg-[#14141A] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="In-Game IGN"
                        value={p.ign}
                        onChange={(e) => {
                          const updated = [...newPlayers];
                          updated[index].ign = e.target.value;
                          setNewPlayers(updated);
                        }}
                        className="bg-[#14141A] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Free Fire UID"
                        value={p.uid}
                        onChange={(e) => {
                          const updated = [...newPlayers];
                          updated[index].uid = e.target.value;
                          setNewPlayers(updated);
                        }}
                        className="bg-[#14141A] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] font-semibold"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
