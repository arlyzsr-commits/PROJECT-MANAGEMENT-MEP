import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useProject } from '../../context/ProjectContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t } = useProject();

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:opacity-95 transition-all cursor-pointer"
        title="Install MEP Project Control as PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t('install_pwa')}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#142238] text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#142238]/80 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#142238] border border-[#00E5FF]/40 p-6 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f3556]">
                <h3 className="text-base font-semibold text-[#F3F7FF] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00E5FF]" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#94A8C2] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 text-xs space-y-3 text-[#94A8C2]">
                <p className="leading-relaxed">
                  1. Tap the <strong className="text-white">Share</strong> button in the Safari bottom toolbar.
                </p>
                <p className="leading-relaxed">
                  2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.
                </p>
                <p className="leading-relaxed">
                  3. Tap <strong className="text-white">Add</strong> in top right to launch full-screen with offline capabilities.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 rounded-xl bg-[#00E5FF] text-[#080F1D] text-xs font-bold hover:bg-[#00D8B4] transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
