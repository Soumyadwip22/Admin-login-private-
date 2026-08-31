import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Tournament, TournamentStatus } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface TournamentManagerProps {
  tournaments: Tournament[];
  selectedTournamentId: string;
  onSelectTournament: (id: string) => void;
}

export const TournamentManager: React.FC<TournamentManagerProps> = ({
  tournaments,
  selectedTournamentId,
  onSelectTournament
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [format, setFormat] = useState<'Squad' | 'Duo' | 'Solo'>('Squad');
  const [prizePool, setPrizePool] = useState<number>(25000);
  const [entryFee, setEntryFee] = useState<number>(100);
  const [totalSlots, setTotalSlots] = useState<number>(36);
  const [registrationDeadline, setRegistrationDeadline] = useState<string>('2026-09-05T20:00');
  const [startDate, setStartDate] = useState<string>('2026-09-07T18:00');
  const [bannerUrl, setBannerUrl] = useState<string>('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
  const [rules, setRules] = useState<string>(
    '1. 12-Slot Custom Room FF Esports Scoring.\n2. Emulator banned.\n3. Room credentials unlock 15-min prior to match.'
  );
  const [status, setStatus] = useState<TournamentStatus>('registration_open');
  const [groups, setGroups] = useState<string>('A, B, C, Finals');

  const openCreateModal = () => {
    setEditingTournament(null);
    setTitle('Free Fire Pro Scrims Season ' + (tournaments.length + 1));
    setFormat('Squad');
    setPrizePool(20000);
    setEntryFee(100);
    setTotalSlots(36);
    setRegistrationDeadline(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16));
    setStartDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
    setBannerUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
    setRules('Standard Free Fire Battle Royale 12-team custom room rules. Top teams qualify to finals.');
    setStatus('registration_open');
    setGroups('A, B, C, Finals');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Tournament) => {
    setEditingTournament(t);
    setTitle(t.title);
    setFormat(t.format);
    setPrizePool(t.prizePool);
    setEntryFee(t.entryFee);
    setTotalSlots(t.totalSlots);
    setRegistrationDeadline(t.registrationDeadline ? t.registrationDeadline.slice(0, 16) : '');
    setStartDate(t.startDate ? t.startDate.slice(0, 16) : '');
    setBannerUrl(t.bannerUrl);
    setRules(t.rules);
    setStatus(t.status);
    setGroups(t.groups?.join(', ') || 'A, B, C, Finals');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const groupList = groups.split(',').map(g => g.trim()).filter(Boolean);
    const tournamentObj: Tournament = {
      id: editingTournament?.id || `ff-tourney-${Date.now()}`,
      title,
      game: 'Free Fire MAX',
      format,
      prizePool: Number(prizePool),
      currency: '₹',
      entryFee: Number(entryFee),
      totalSlots: Number(totalSlots),
      registeredCount: editingTournament?.registeredCount || 0,
      registrationDeadline,
      startDate,
      bannerUrl,
      rules,
      status,
      groups: groupList.length ? groupList : ['A', 'B', 'C', 'Finals'],
      createdAt: editingTournament?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbService.saveTournament(tournamentObj, user?.email || 'admin@ffesports.in');
    setIsModalOpen(false);
    onSelectTournament(tournamentObj.id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete tournament "${name}"?`)) {
      await dbService.deleteTournament(id, user?.email || 'admin@ffesports.in');
    }
  };

  const getStatusBadge = (st: TournamentStatus) => {
    switch (st) {
      case 'registration_open':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" /> Registration Open</span>;
      case 'ongoing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30 flex items-center gap-1"><Flame className="w-3 h-3 text-[#FF4D00]" /> Ongoing Live</span>;
      case 'registration_closed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Registration Closed</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-700/20 text-zinc-400 border border-zinc-700">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Upcoming</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FF4D00]" />
            <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
              TOURNAMENT HUB & EVENT MANAGER
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure prize distribution, slot limits, registration deadlines, and event rules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-[#FF4D00]/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tournament</span>
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tournaments.map((t) => {
          const isSelected = t.id === selectedTournamentId;
          const fillPercentage = Math.round(((t.registeredCount || 0) / (t.totalSlots || 1)) * 100);

          return (
            <div
              key={t.id}
              onClick={() => onSelectTournament(t.id)}
              className={`rounded-2xl bg-[#14141A] border transition-all cursor-pointer overflow-hidden flex flex-col group ${
                isSelected
                  ? 'border-[#FF4D00] ring-1 ring-[#FF4D00]/50 shadow-xl shadow-[#FF4D00]/10'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Banner Image */}
              <div className="h-36 relative overflow-hidden bg-zinc-900">
                <img
                  src={t.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141A] via-[#14141A]/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  {getStatusBadge(t.status)}
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-300 border border-zinc-700/50">
                  {t.format}
                </div>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-sm font-bold text-white truncate font-['Chakra_Petch']">
                    {t.title}
                  </h3>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1A1A22] p-2.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                      <Trophy className="w-3 h-3 text-[#FF4D00]" /> Prize Pool
                    </span>
                    <span className="text-sm font-bold text-[#00FF66] font-mono mt-0.5 block">
                      ₹{t.prizePool?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>

                  <div className="bg-[#1A1A22] p-2.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                      <IndianRupee className="w-3 h-3 text-amber-400" /> Entry Fee
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
                    </span>
                  </div>
                </div>

                {/* Slot Capacity Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-400" /> Slot Fill
                    </span>
                    <span className="text-zinc-200 font-mono font-semibold">
                      {t.registeredCount || 0} / {t.totalSlots} ({fillPercentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        fillPercentage >= 100 ? 'bg-red-500' : fillPercentage > 75 ? 'bg-amber-500' : 'bg-[#00FF66]'
                      }`}
                      style={{ width: `${Math.min(100, fillPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Deadlines */}
                <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" /> Registration Ends:
                    </span>
                    <span className="text-zinc-300 font-mono text-[10px]">
                      {t.registrationDeadline ? new Date(t.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 gap-2">
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Groups: {t.groups?.join(', ') || 'A, B'}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Edit Tournament"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {tournaments.length > 1 && (
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                  {editingTournament ? 'EDIT TOURNAMENT' : 'CREATE NEW TOURNAMENT'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Tournament Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Fire All-Stars Pro League Season 4"
                  required
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-400 focus:border-[#FF4D00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="Squad">Squad (4 Players + 1 Sub)</option>
                    <option value="Duo">Duo (2 Players)</option>
                    <option value="Solo">Solo (1 Player)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Prize Pool (₹)</label>
                  <input
                    type="number"
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Entry Fee (₹ / Team)</label>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Total Team Slots</label>
                  <input
                    type="number"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(Number(e.target.value))}
                    min={12}
                    max={120}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="registration_open">Registration Open</option>
                    <option value="registration_closed">Registration Closed</option>
                    <option value="ongoing">Ongoing (Matches Live)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Groups (comma separated)</label>
                  <input
                    type="text"
                    value={groups}
                    onChange={(e) => setGroups(e.target.value)}
                    placeholder="A, B, C, Finals"
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tournament Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Rules & Guidelines</label>
                <textarea
                  rows={3}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Enter tournament rules..."
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] font-semibold shadow-lg shadow-[#FF4D00]/20"
                >
                  {editingTournament ? 'Update Tournament' : 'Publish Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
