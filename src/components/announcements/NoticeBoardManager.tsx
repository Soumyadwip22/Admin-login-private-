import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Send,
  AlertTriangle,
  Info,
  Calendar,
  Share2,
  Check,
  Trash2,
  Eye,
  Flame,
  Radio,
  Clock
} from 'lucide-react';
import { Announcement, AnnouncementPriority, Tournament } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface NoticeBoardManagerProps {
  announcements: Announcement[];
  tournaments: Tournament[];
  selectedTournamentId: string;
}

export const NoticeBoardManager: React.FC<NoticeBoardManagerProps> = ({
  announcements,
  tournaments,
  selectedTournamentId
}) => {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [priority, setPriority] = useState<AnnouncementPriority>('urgent');
  const [targetAudience, setTargetAudience] = useState<string>('All Players');
  const [isPinned, setIsPinned] = useState<boolean>(true);

  const openCreateModal = () => {
    setTitle('Match Schedule Update for Group A');
    setContent('All team captains of Group A please note: Room credentials will unlock at 19:15 IST today on the portal. Be ready in your allocated slots.');
    setPriority('urgent');
    setTargetAudience('Group A');
    setIsPinned(true);
    setIsModalOpen(true);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const annObj: Announcement = {
      id: `ann-${Date.now()}`,
      tournamentId: selectedTournamentId || 'ff-championship-s4',
      title,
      content,
      priority,
      targetAudience,
      isPinned,
      createdAt: new Date().toISOString(),
      author: user?.displayName || 'Tournament Admin'
    };

    await dbService.saveAnnouncement(annObj, user?.email || 'admin@ffesports.in');
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (window.confirm(`Delete announcement "${annTitle}"?`)) {
      await dbService.deleteAnnouncement(id, user?.email || 'admin@ffesports.in');
    }
  };

  const copyWhatsAppBroadcast = (ann: Announcement) => {
    const priorityEmoji = ann.priority === 'urgent' ? '🚨 [URGENT NOTICE]' : ann.priority === 'rule_change' ? '⚖️ [RULE UPDATE]' : '📢 [OFFICIAL ANNOUNCEMENT]';
    const text = `🔥 FREE FIRE ESPORTS — ${priorityEmoji} 🔥\n\n📌 *${ann.title.toUpperCase()}*\n🎯 Target: *${ann.targetAudience}*\n\n${ann.content}\n\n━━━━━━━━━━━━━━━━━━━━\n🕒 Posted: ${new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST | FF Esports Admin Station`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getPriorityBadge = (pr: AnnouncementPriority) => {
    switch (pr) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> URGENT</span>;
      case 'rule_change':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">RULE CHANGE</span>;
      case 'schedule_update':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">SCHEDULE</span>;
      case 'disqualification':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-zinc-800 text-red-400 border border-red-900/50">DISQUALIFICATION</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#FF4D00]" />
            <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
              NOTICE BOARD & LIVE BROADCASTER
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Broadcast urgent slot alerts, rule changes, schedule modifications, and generate instant WhatsApp templates for squad captains.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-[#FF4D00]/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#14141A] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
            No notices posted yet. Click &ldquo;Broadcast Notice&rdquo; above to publish an announcement.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-[#14141A] rounded-2xl border p-5 space-y-3.5 flex flex-col justify-between transition-all ${
                ann.isPinned ? 'border-[#FF4D00]/50 bg-[#161418] shadow-lg shadow-[#FF4D00]/5' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ann.priority)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      🎯 {ann.targetAudience}
                    </span>
                  </div>

                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#FF4D00]">
                      <Pin className="w-3 h-3 rotate-45" /> PINNED
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                    {ann.content}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} • By {ann.author || 'Admin'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyWhatsAppBroadcast(ann)}
                    className="flex items-center gap-1 bg-[#1A1A24] hover:bg-[#252535] text-zinc-200 border border-zinc-700/80 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                    title="Copy announcement formatted for WhatsApp group broadcast"
                  >
                    {copiedId === ann.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#00FF66]" />
                        <span className="text-[#00FF66]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3 text-zinc-400" />
                        <span>Copy Broadcast</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#FF4D00]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                  BROADCAST TOURNAMENT NOTICE
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Room Check-in for Group A"
                  required
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="urgent">🚨 Urgent Attention</option>
                    <option value="schedule_update">📅 Schedule Update</option>
                    <option value="rule_change">⚖️ Rule Change</option>
                    <option value="info">ℹ️ General Info</option>
                    <option value="disqualification">⛔ Disqualification Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  >
                    <option value="All Players">All Registered Players</option>
                    <option value="Group A">Group A Teams Only</option>
                    <option value="Group B">Group B Teams Only</option>
                    <option value="Group C">Group C Teams Only</option>
                    <option value="Finals">Grand Finalists</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Announcement Body Message</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter notice details, room entry guidelines, timing modifications..."
                  required
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-[#FF4D00] outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded bg-[#14141A] border-zinc-700 text-[#FF4D00] focus:ring-0"
                />
                <label htmlFor="pinNotice" className="text-xs text-zinc-300 cursor-pointer">
                  Pin to Top of Notices and Player Dashboard
                </label>
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
                  className="px-5 py-2 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
