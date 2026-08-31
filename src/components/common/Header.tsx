import React from 'react';
import { Flame, LogOut, Eye, Database, Clock, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Tournament } from '../../types';

interface HeaderProps {
  tournaments: Tournament[];
  selectedTournamentId?: string;
  activeTournamentId?: string;
  onSelectTournament: (id: string) => void;
  onOpenPublicPreview?: () => void;
  onOpenMobileMenu?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  tournaments,
  selectedTournamentId,
  activeTournamentId,
  onSelectTournament,
  onOpenPublicPreview,
  onOpenMobileMenu,
  isSyncing
}) => {
  const { user, logout } = useAuth();
  const currentSelectedId = activeTournamentId || selectedTournamentId || tournaments[0]?.id || '';
  const [currentTime, setCurrentTime] = React.useState<string>('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#121216] border-b border-[#27272A] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Brand & Database Status */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg bg-[#18181B] border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5 text-[#FF4D00]" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF4D00] to-[#B32400] flex items-center justify-center shadow-lg shadow-[#FF4D00]/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Chakra_Petch'] font-bold text-white tracking-wider text-base md:text-lg flex items-center gap-1.5">
                FF ESPORTS <span className="text-[#FF4D00] text-xs font-semibold px-1.5 py-0.5 rounded bg-[#FF4D00]/10 border border-[#FF4D00]/30">HQ ADMIN</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">Tournament Control Station & Room Engine</p>
          </div>
        </div>

        {/* Database Real-time Sync Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181B] border border-zinc-800 text-xs">
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[140px]">encoded-constant-8lcf1</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]"></span>
          </span>
          <span className="text-[10px] text-[#00FF66] font-medium font-mono">LIVE SYNC</span>
        </div>
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Tournament Switcher */}
        {tournaments.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-[#18181B] border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Active Event:</span>
            <select
              value={currentSelectedId}
              onChange={(e) => onSelectTournament(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[160px] md:max-w-[220px] truncate"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#18181B] text-white">
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] border border-zinc-800/80 text-xs text-zinc-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-[#FF4D00]" />
          <span>{currentTime}</span>
        </div>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div className="flex items-center gap-2">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'admin'}`}
              alt="Admin avatar"
              className="w-8 h-8 rounded-full border border-[#FF4D00]/40 bg-zinc-900 object-cover"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[130px]">{user?.displayName || 'Organizer Admin'}</div>
              <div className="text-[10px] text-[#FF4D00] font-mono leading-none">{user?.role || 'Super Admin'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
