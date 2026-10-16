import React from 'react';
import {
  Shield,
  Globe,
  History,
  User as UserIcon,
  Search,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenAudit }) => {
  const { currentUser, role } = useAuth();
  const { project, language, setLanguage, filters, setFilters, t } = useProject();
  const isOnline = useOnlineStatus();

  return (
    <header className="h-16 bg-[#101B2E] border-b border-[#00E5FF]/20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00E5FF] via-[#2979FF] to-[#00D8B4] p-[1.5px] shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center justify-center">
          <div className="w-full h-full bg-[#080F1D] rounded-[10px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#00E5FF]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-wider text-[#F3F7FF] flex items-center gap-1.5">
              <span>{t('app_title')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                PRO
              </span>
            </h1>
          </div>
          <p className="hidden sm:block text-[10.5px] font-medium text-[#94A8C2]">
            {project.name} • <span className="text-[#00D8B4]">{project.company}</span>
          </p>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-4 h-4 absolute left-3 text-[#94A8C2]" />
        <input
          type="text"
          placeholder={t('action_search')}
          value={filters.searchQuery || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#080F1D] border border-[#1f3556] text-xs text-[#F3F7FF] placeholder-[#94A8C2]/60 focus:border-[#00E5FF] focus:outline-none transition"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
            className="absolute right-2.5 text-[10px] text-[#94A8C2] hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Audit Log Trigger */}
        <button
          onClick={onOpenAudit}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#142238] border border-[#1f3556] text-[#94A8C2] hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition cursor-pointer"
          title="System Audit Logs"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('nav_audit')}</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center rounded-lg bg-[#080F1D] border border-[#1f3556] p-0.5">
          <Globe className="w-3.5 h-3.5 text-[#94A8C2] ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${
              language === 'en'
                ? 'bg-[#00E5FF] text-[#080F1D]'
                : 'text-[#94A8C2] hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('id')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${
              language === 'id'
                ? 'bg-[#00D8B4] text-[#080F1D]'
                : 'text-[#94A8C2] hover:text-white'
            }`}
          >
            ID
          </button>
        </div>

        {/* Online Status Indicator */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#080F1D] border border-[#1f3556]"
          title={isOnline ? 'Cloud Synced' : 'Offline Mode'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-[#00D8B4] shadow-[0_0_6px_#00D8B4]' : 'bg-[#FFB74D] animate-ping'
            }`}
          />
          <span className="hidden xl:inline text-[10px] font-medium text-[#94A8C2]">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Role & Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#2979FF] flex items-center justify-center text-[#080F1D] font-bold text-xs">
            {currentUser ? (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold text-[#F3F7FF] leading-tight truncate max-w-[100px]">
              {currentUser ? currentUser.displayName || currentUser.email?.split('@')[0] : 'Sign In'}
            </p>
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-[#00E5FF]">
              <Shield className="w-2.5 h-2.5" />
              <span>{role}</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
