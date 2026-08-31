import React, { useState, useEffect } from 'react';
import {
  Swords,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  ExternalLink,
  MapPin,
  Calendar,
  Share2,
  Flame,
  Layers,
  Edit2,
  Trash2
} from 'lucide-react';
import { MatchFixture, GameMap, MatchStatus, Tournament } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface MatchSchedulerProps {
  matches: MatchFixture[];
  tournaments: Tournament[];
  selectedTournamentId: string;
}

export const MatchScheduler: React.FC<MatchSchedulerProps> = ({
  matches,
  tournaments,
  selectedTournamentId
}) => {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<MatchFixture | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('Group A - Match 1 (Bermuda)');
  const [map, setMap] = useState<GameMap>('Bermuda');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('19:00');
  const [group, setGroup] = useState<string>('A');
  const [status, setStatus] = useState<MatchStatus>('scheduled');
  const [roomId, setRoomId] = useState<string>('89201948');
  const [roomPassword] = useState<string>('FFPRO99');
  const [customPass, setCustomPass] = useState<string>('FFPRO99');
  const [autoPublish15Min, setAutoPublish15Min] = useState<boolean>(true);
  const [streamUrl, setStreamUrl] = useState<string>('');

  // Countdown timer calculation
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const openCreateModal = () => {
    setEditingMatch(null);
    const nextNum = matches.length + 1;
    setMatchNumber(nextNum);
    setTitle(`Group A - Match ${nextNum} (${map})`);
    setMap('Bermuda');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('19:30');
    setGroup('A');
    setStatus('scheduled');
    setRoomId(Math.floor(10000000 + Math.random() * 90000000).toString());
    setCustomPass('FF' + Math.floor(100 + Math.random() * 900));
    setAutoPublish15Min(true);
    setStreamUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: MatchFixture) => {
    setEditingMatch(m);
    setMatchNumber(m.matchNumber);
    setTitle(m.title);
    setMap(m.map);
    setDate(m.date);
    setTime(m.time);
    setGroup(m.group);
    setStatus(m.status);
    setRoomId(m.roomId);
    setCustomPass(m.roomPassword);
    setAutoPublish15Min(m.autoPublish15Min);
    setStreamUrl(m.streamUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate release time 15-min before match scheduled time
    const scheduledDateTime = new Date(`${date}T${time}:00`);
    const releaseTime = new Date(scheduledDateTime.getTime() - 15 * 60 * 1000).toISOString();

    const matchObj: MatchFixture = {
      id: editingMatch?.id || `match-${Date.now()}`,
      tournamentId: selectedTournamentId || 'ff-championship-s4',
      matchNumber: Number(matchNumber),
      title,
      map,
      date,
      time,
      group,
      status,
      roomId,
      roomPassword: customPass,
      credentialsReleaseTime: releaseTime,
      isCredentialsPublished: editingMatch ? editingMatch.isCredentialsPublished : false,
      autoPublish15Min,
      streamUrl: streamUrl.trim() ? streamUrl : undefined,
      createdAt: editingMatch?.createdAt || new Date().toISOString()
    };

    await dbService.saveMatch(matchObj, user?.email || 'admin@ffesports.in');
    setIsModalOpen(false);
  };

  const handleTogglePublish = async (m: MatchFixture) => {
    await dbService.publishRoomCredentials(m.id, !m.isCredentialsPublished, user?.email || 'admin@ffesports.in');
  };

  const handleStatusChange = async (m: MatchFixture, newStatus: MatchStatus) => {
    await dbService.updateMatchStatus(m.id, newStatus, user?.email || 'admin@ffesports.in');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete match fixture "${name}"?`)) {
      await dbService.deleteMatch(id, user?.email || 'admin@ffesports.in');
    }
  };

  const copyCredentials = (m: MatchFixture) => {
    const text = `🔥 FREE FIRE ESPORTS ROOM CREDENTIALS 🔥\n🏆 Match: ${m.title}\n🗺️ Map: ${m.map}\n⏰ Time: ${m.time}\n🔑 Room ID: ${m.roomId}\n🔒 Password: ${m.roomPassword}\n⚠️ Join your assigned Slot only!`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getMapBadge = (mapName: GameMap) => {
    const colorMap: Record<GameMap, { bg: string; text: string; border: string }> = {
      Bermuda: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      Purgatory: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      Kalahari: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      Alpine: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      NexTerra: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' }
    };
    const c = colorMap[mapName] || colorMap.Bermuda;
    return <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>{mapName}</span>;
  };

  const getStatusBadge = (st: MatchStatus) => {
    switch (st) {
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FF4D00]/15 text-[#FF4D00] border border-[#FF4D00]/40 flex items-center gap-1.5 animate-pulse"><Flame className="w-3 h-3 text-[#FF4D00]" /> LIVE NOW</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> FINISHED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> SCHEDULED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#FF4D00]" />
            <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
              MATCH FIXTURES & 15-MIN ROOM CREDENTIAL ENGINE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated 15-minute countdown unlock, live Room ID & Password broadcasting, and match progression status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-[#FF4D00]/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Match</span>
        </button>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {matches.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#14141A] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
            No matches scheduled yet for this tournament. Click &ldquo;Schedule New Match&rdquo; above.
          </div>
        ) : (
          matches.map((m) => {
            const scheduledTarget = new Date(`${m.date}T${m.time}:00`).getTime();
            const releaseTarget = new Date(m.credentialsReleaseTime || scheduledTarget - 15 * 60 * 1000).getTime();
            const msUntilRelease = releaseTarget - now;
            const isReleaseTimePassed = msUntilRelease <= 0;
            const isCurrentlyPublished = m.isCredentialsPublished || (m.autoPublish15Min && isReleaseTimePassed);

            // Format countdown
            const minutesLeft = Math.max(0, Math.floor(msUntilRelease / 60000));
            const secondsLeft = Math.max(0, Math.floor((msUntilRelease % 60000) / 1000));

            return (
              <div
                key={m.id}
                className="bg-[#14141A] rounded-2xl border border-zinc-800/90 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Top Match Info Bar */}
                <div className="p-4 bg-[#181822] border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-zinc-900 px-2 py-1 rounded text-[#FF4D00] border border-zinc-800">
                      M#{m.matchNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-xs font-['Chakra_Petch']">{m.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span>Group {m.group}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {m.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-white font-semibold"><Clock className="w-2.5 h-2.5 text-[#FF4D00]" /> {m.time} IST</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getMapBadge(m.map)}
                    {getStatusBadge(m.status)}
                  </div>
                </div>

                {/* Credentials & 15-Min Engine Card */}
                <div className="p-4 space-y-4">
                  {/* Room Details Block */}
                  <div className="bg-[#0E0E14] p-3.5 rounded-xl border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-[#FF4D00]" />
                        <span className="text-xs font-bold text-zinc-200 uppercase font-mono">
                          Room Access Credentials
                        </span>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center gap-1.5">
                        {isCurrentlyPublished ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                            UNLOCKED & LIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            LOCKED (15-MIN UNLOCK)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#14141C] p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">ROOM ID</span>
                        <span className="text-sm font-mono font-bold text-white tracking-wider">
                          {m.roomId || 'Not Set'}
                        </span>
                      </div>

                      <div className="bg-[#14141C] p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">PASSWORD</span>
                        <span className="text-sm font-mono font-bold text-[#FF4D00] tracking-wider">
                          {m.roomPassword || 'Not Set'}
                        </span>
                      </div>
                    </div>

                    {/* 15-Minute Countdown Engine Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                      <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#FF4D00]" />
                        {!isReleaseTimePassed ? (
                          <span>
                            Auto-Unlocks in: <strong className="text-amber-400">{minutesLeft}m {secondsLeft}s</strong>
                          </span>
                        ) : (
                          <span className="text-[#00FF66] font-semibold">
                            15-Min Window Reached (Credentials Active)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyCredentials(m)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Copy Full Credentials template to clipboard"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#00FF66]" />
                              <span className="text-[#00FF66]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleTogglePublish(m)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            m.isCredentialsPublished
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                              : 'bg-gradient-to-r from-[#00FF66] to-[#00CC52] text-black hover:opacity-90 font-bold shadow-md shadow-[#00FF66]/20'
                          }`}
                        >
                          {m.isCredentialsPublished ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Publish Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Match Live Status Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[11px] text-zinc-400 font-mono mr-1">Status:</span>
                      <button
                        onClick={() => handleStatusChange(m, 'scheduled')}
                        className={`px-2 py-0.8 rounded text-[10px] font-bold ${
                          m.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Scheduled
                      </button>
                      <button
                        onClick={() => handleStatusChange(m, 'in_progress')}
                        className={`px-2 py-0.8 rounded text-[10px] font-bold ${
                          m.status === 'in_progress' ? 'bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40 animate-pulse' : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(m, 'completed')}
                        className={`px-2 py-0.8 rounded text-[10px] font-bold ${
                          m.status === 'completed' ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40' : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => handleStatusChange(m, 'cancelled')}
                        className={`px-2 py-0.8 rounded text-[10px] font-bold ${
                          m.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="Edit Match"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule / Edit Match Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                  {editingMatch ? 'EDIT MATCH FIXTURE' : 'SCHEDULE ESPORTS MATCH'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Match Number</label>
                  <input
                    type="number"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Match Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Map</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as GameMap)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Group</label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="A">Group A</option>
                    <option value="B">Group B</option>
                    <option value="C">Group C</option>
                    <option value="Finals">Grand Finals</option>
                    <option value="All">All Groups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MatchStatus)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Match Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Match Time (IST)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>

              {/* Room ID & Pass Generator */}
              <div className="p-3 bg-[#0E0E12] rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF4D00]" /> Room ID & Password Configuration
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomId(Math.floor(10000000 + Math.random() * 90000000).toString());
                      setCustomPass('FF' + Math.floor(100 + Math.random() * 900));
                    }}
                    className="text-[10px] text-[#FF4D00] hover:underline font-mono"
                  >
                    Auto Generate Random
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Custom Room ID</label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="e.g. 88392019"
                      required
                      className="w-full bg-[#14141A] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Room Password</label>
                    <input
                      type="text"
                      value={customPass}
                      onChange={(e) => setCustomPass(e.target.value)}
                      placeholder="e.g. FFPRO"
                      required
                      className="w-full bg-[#14141A] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="auto15min"
                    checked={autoPublish15Min}
                    onChange={(e) => setAutoPublish15Min(e.target.checked)}
                    className="rounded bg-[#14141A] border-zinc-700 text-[#FF4D00] focus:ring-0"
                  />
                  <label htmlFor="auto15min" className="text-xs text-zinc-300 cursor-pointer">
                    Enable Automatic 15-Minute Countdown Unlock (Players see room credentials 15-min prior)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Live Stream URL (Optional)</label>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://youtube.com/live/..."
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] font-semibold"
                >
                  {editingMatch ? 'Update Fixture' : 'Schedule Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
