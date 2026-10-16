import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useProject } from '../../context/ProjectContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useProject();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#142238] border border-[#FFB74D] px-4 py-2.5 text-xs font-medium text-[#FFB74D] shadow-[0_0_20px_rgba(255,183,77,0.3)] backdrop-blur-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <div>
        <p className="font-semibold">{t('offline_msg')}</p>
      </div>
      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FFB74D] ml-2" />
    </div>
  );
};
