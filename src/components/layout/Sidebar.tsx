import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Cpu,
  CalendarCheck,
  TrendingUp,
  Camera,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'locations'
  | 'work-items'
  | 'daily-progress'
  | 'monthly-progress'
  | 'photos'
  | 'issues'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const { t, issues, dailyProgressLogs } = useProject();
  const { role } = useAuth();

  const openIssuesCount = issues.filter(
    (i) => i.status === 'Open' || i.status === 'In Progress'
  ).length;

  const pendingApprovalsCount = dailyProgressLogs.filter(
    (dp) => dp.status === 'Submitted'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: t('nav_dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'locations' as NavTab,
      label: t('nav_locations'),
      icon: Building2,
    },
    {
      id: 'work-items' as NavTab,
      label: t('nav_work_items'),
      icon: Cpu,
    },
    {
      id: 'daily-progress' as NavTab,
      label: t('nav_daily_progress'),
      icon: CalendarCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-[#00E5FF] text-[#080F1D]',
    },
    {
      id: 'monthly-progress' as NavTab,
      label: t('nav_monthly_progress'),
      icon: TrendingUp,
    },
    {
      id: 'photos' as NavTab,
      label: t('nav_photos'),
      icon: Camera,
    },
    {
      id: 'issues' as NavTab,
      label: t('nav_issues'),
      icon: AlertTriangle,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
      badgeColor: 'bg-[#FF526B] text-white',
    },
    {
      id: 'reports' as NavTab,
      label: t('nav_reports'),
      icon: FileSpreadsheet,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#101B2E] border-r border-[#1f3556] transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Project Tag */}
      <div className="p-4 border-b border-[#1f3556] flex items-center justify-between">
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block">
              BALAK RESORT
            </span>
            <span className="text-xs font-semibold text-[#F3F7FF] truncate block">
              Villa & Resort MEP
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-[#142238] border border-[#1f3556] text-[#94A8C2] hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition mx-auto cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-[#142238] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'text-[#94A8C2] hover:text-[#F3F7FF] hover:bg-[#142238]/60 border border-transparent'
              }`}
            >
              {/* Active neon strip */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#00E5FF] rounded-r shadow-[0_0_8px_#00E5FF]" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#00E5FF]' : 'text-[#94A8C2] group-hover:text-[#F3F7FF]'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badge indicator */}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed hover tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#142238] border border-[#00E5FF]/40 text-[#F3F7FF] text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {item.label}
                  {item.badge !== undefined && ` (${item.badge})`}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Footer Card */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-[#080F1D] border border-[#1f3556]">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[11px] font-bold text-[#F3F7FF]">Access: {role}</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] leading-tight">
            {role === 'MANAGER'
              ? 'Full admin, budget & approval rights.'
              : role === 'SUPERVISOR'
              ? 'Progress submission workflow active.'
              : 'Viewer mode (read-only analytical view).'}
          </p>
        </div>
      )}
    </aside>
  );
};
