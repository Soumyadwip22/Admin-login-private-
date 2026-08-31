import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Swords,
  BarChart3,
  CreditCard,
  Megaphone,
  Settings,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  activeTab?: NavigationTab;
  currentTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  onSelectTab?: (tab: NavigationTab) => void;
  pendingTeamsCount: number;
  pendingPaymentsCount: number;
  activeMatchesCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  currentTab,
  onTabChange,
  onSelectTab,
  pendingTeamsCount,
  pendingPaymentsCount,
  activeMatchesCount,
  isMobileOpen,
  onCloseMobile
}) => {
  const selectedTab = activeTab || currentTab || 'overview';
  const triggerTabChange = (tab: NavigationTab) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
    onCloseMobile();
  };

  const menuItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Control Station',
      description: 'Live Ops & Match Feed',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tournaments' as NavigationTab,
      label: 'Tournaments',
      description: 'Create & Manage Events',
      icon: Trophy,
      badge: null
    },
    {
      id: 'teams' as NavigationTab,
      label: 'Teams & Squads',
      description: 'Rosters & Slot Allocator',
      icon: Users,
      badge: pendingTeamsCount > 0 ? { count: pendingTeamsCount, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' } : null
    },
    {
      id: 'matches' as NavigationTab,
      label: 'Match Scheduler',
      description: '15-Min Room Credential Engine',
      icon: Swords,
      badge: activeMatchesCount > 0 ? { count: activeMatchesCount, color: 'bg-[#FF4D00]/20 text-[#FF4D00] border-[#FF4D00]/40 animate-pulse' } : null
    },
    {
      id: 'standings' as NavigationTab,
      label: 'Point Table & Calculator',
      description: 'FF Esports Standard Scoring',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'payments' as NavigationTab,
      label: 'Payment & UTR Portal',
      description: 'UPI Verification & Approvals',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? { count: pendingPaymentsCount, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' } : null
    },
    {
      id: 'announcements' as NavigationTab,
      label: 'Notice Board',
      description: 'Broadcasts & Rule Updates',
      icon: Megaphone,
      badge: null
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & UPI Config',
      description: 'Organizer Accounts & Links',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-68 bg-[#0E0E12] border-r border-[#222228] flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF4D00]" />
            <span className="font-['Chakra_Petch'] font-bold text-white tracking-wider">COMMAND MENU</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
            COMMAND MODULES
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => triggerTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#FF4D00]/15 text-white border-l-2 border-[#FF4D00] shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#16161C]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#FF4D00] text-white shadow-md shadow-[#FF4D00]/30'
                        : 'bg-[#18181F] text-zinc-400 group-hover:text-zinc-200 group-hover:bg-[#202029]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <div className={`text-xs ${isActive ? 'text-[#FF4D00] font-bold' : 'font-medium'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${item.badge.color}`}
                    >
                      {item.badge.count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FF4D00]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Info */}
        <div className="p-3 m-3 rounded-xl bg-[#14141A] border border-zinc-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF4D00]" /> FF Scrims Mode
            </span>
            <span className="text-[10px] text-[#00FF66] font-mono bg-[#00FF66]/10 px-1.5 py-0.2 rounded border border-[#00FF66]/20">
              Active
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            12-Slot Custom Room rules & automatic 15-min credential unlocks engaged.
          </p>
        </div>
      </aside>
    </>
  );
};
