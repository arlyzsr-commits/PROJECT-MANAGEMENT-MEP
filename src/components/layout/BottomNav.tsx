import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Camera,
  AlertTriangle,
  MoreHorizontal,
  Cpu,
  TrendingUp,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useProject } from '../../context/ProjectContext';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t, issues, dailyProgressLogs } = useProject();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const openIssuesCount = issues.filter(
    (i) => i.status === 'Open' || i.status === 'In Progress'
  ).length;

  const pendingApprovalsCount = dailyProgressLogs.filter(
    (dp) => dp.status === 'Submitted'
  ).length;

  const primaryItems = [
    { id: 'dashboard' as NavTab, label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'locations' as NavTab, label: 'Locations', icon: Building2 },
    {
      id: 'daily-progress' as NavTab,
      label: 'Daily',
      icon: CalendarCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'photos' as NavTab, label: 'Photos', icon: Camera },
    {
      id: 'issues' as NavTab,
      label: 'Issues',
      icon: AlertTriangle,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
    },
  ];

  const moreItems = [
    { id: 'work-items' as NavTab, label: t('nav_work_items'), icon: Cpu },
    { id: 'monthly-progress' as NavTab, label: t('nav_monthly_progress'), icon: TrendingUp },
    { id: 'reports' as NavTab, label: t('nav_reports'), icon: FileSpreadsheet },
  ];

  const handleSelect = (id: NavTab) => {
    onSelectTab(id);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#142238] border-t border-[#00E5FF]/30 p-5 rounded-t-3xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f3556] mb-4">
              <h3 className="text-sm font-bold text-[#F3F7FF]">More Navigation</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="text-[#94A8C2] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                      isActive
                        ? 'bg-[#101B2E] border-[#00E5FF] text-[#00E5FF]'
                        : 'bg-[#101B2E] border-[#1f3556] text-[#94A8C2] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] font-semibold text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#101B2E]/95 backdrop-blur-md border-t border-[#00E5FF]/20 px-2 flex items-center justify-around z-40">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl relative transition-all ${
                isActive ? 'text-[#00E5FF]' : 'text-[#94A8C2]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_#00E5FF]' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-[#FF526B] text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#00E5FF] mt-0.5 shadow-[0_0_5px_#00E5FF]" />
              )}
            </button>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 text-[#94A8C2] hover:text-white`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
