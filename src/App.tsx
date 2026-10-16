import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { AuthModal } from './components/auth/AuthModal';
import { AuditLogModal } from './components/common/AuditLogModal';
import { InteractiveDashboard } from './components/dashboard/InteractiveDashboard';
import { LocationManagement } from './components/locations/LocationManagement';
import { WorkItemManagement } from './components/workItems/WorkItemManagement';
import { DailyProgressView } from './components/progress/DailyProgressView';
import { MonthlyProgressView } from './components/progress/MonthlyProgressView';
import { PhotoDocumentManagement } from './components/photos/PhotoDocumentManagement';
import { OutstandingIssuesView } from './components/issues/OutstandingIssuesView';
import { ReportCenter } from './components/reports/ReportCenter';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const handlePhotoSelectFromDashboard = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl);
    setCurrentTab('photos');
  };

  return (
    <div className="min-h-screen bg-[#080F1D] text-[#F3F7FF] flex flex-col font-sans selection:bg-[#00E5FF] selection:text-[#080F1D]">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar (Desktop & Tablet) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <InteractiveDashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onSelectPhoto={handlePhotoSelectFromDashboard}
              />
            )}

            {currentTab === 'locations' && <LocationManagement />}

            {currentTab === 'work-items' && <WorkItemManagement />}

            {currentTab === 'daily-progress' && <DailyProgressView />}

            {currentTab === 'monthly-progress' && <MonthlyProgressView />}

            {currentTab === 'photos' && (
              <PhotoDocumentManagement
                initialSelectedPhotoUrl={selectedPhotoUrl}
                onClearSelectedPhoto={() => setSelectedPhotoUrl(null)}
              />
            )}

            {currentTab === 'issues' && <OutstandingIssuesView />}

            {currentTab === 'reports' && <ReportCenter />}
          </div>
        </main>
      </div>

      {/* Smartphone Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Network Connectivity Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AuditLogModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainApp />
      </ProjectProvider>
    </AuthProvider>
  );
}
