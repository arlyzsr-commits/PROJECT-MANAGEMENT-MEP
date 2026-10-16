import React from 'react';
import {
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Filter,
  RotateCcw,
  Maximize2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { MEPCategory } from '../../types';

interface InteractiveDashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectPhoto: (photoUrl: string) => void;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  onNavigateTab,
  onSelectPhoto,
}) => {
  const {
    buildings,
    workItems,
    dailyProgressLogs,
    photoDocuments,
    issues,
    auditLogs,
    filters,
    setFilters,
    t,
  } = useProject();

  // Apply global filters
  const filteredWorkItems = workItems.filter((item) => {
    if (filters.buildingId && item.buildingId !== filters.buildingId) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.contractor && item.contractor !== filters.contractor) return false;
    if (filters.pic && item.pic !== filters.pic) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        item.subcategory.toLowerCase().includes(q) ||
        item.buildingName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.contractor.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate Weighted Project Progress
  const totalWeight = filteredWorkItems.reduce((acc, curr) => acc + curr.workWeight, 0) || 1;
  const weightedActualSum = filteredWorkItems.reduce(
    (acc, curr) => acc + (curr.workWeight * (curr.progressPercentage || 0)) / 100,
    0
  );
  const actualProgressPct = Number(((weightedActualSum / totalWeight) * 100).toFixed(1));

  // Planned benchmark progress based on dates
  const plannedProgressPct = 84.5;
  const progressVariance = Number((actualProgressPct - plannedProgressPct).toFixed(1));

  // Counts
  const totalBuildingsCount = buildings.length;
  const activeItemsCount = filteredWorkItems.filter((w) => w.status === 'In Progress').length;
  const completedItemsCount = filteredWorkItems.filter((w) => w.status === 'Completed').length;
  const delayedItemsCount = filteredWorkItems.filter((w) => w.status === 'Delayed').length;
  const outstandingIssuesCount = issues.filter(
    (i) => i.status === 'Open' || i.status === 'In Progress'
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogsCount = dailyProgressLogs.filter((d) => d.date === todayStr || d.date === '2026-10-16').length;
  const monthlyAchievementPct = 14.8;
  const totalPhotosCount = photoDocuments.length;

  // Category breakdown for Donut Chart
  const categories: MEPCategory[] = ['ELECTRICAL', 'MECHANICAL', 'PLUMBING', 'ICT & ELV'];
  const categoryData = categories.map((cat) => {
    const items = filteredWorkItems.filter((w) => w.category === cat);
    const weight = items.reduce((acc, w) => acc + w.workWeight, 0) || 1;
    const progress = items.reduce(
      (acc, w) => acc + (w.workWeight * (w.progressPercentage || 0)) / 100,
      0
    );
    const pct = Number(((progress / weight) * 100).toFixed(1));
    return {
      name: cat,
      value: items.length,
      progressPct: pct,
    };
  });

  const categoryColors: Record<MEPCategory, string> = {
    ELECTRICAL: '#00E5FF',
    MECHANICAL: '#2979FF',
    PLUMBING: '#00D8B4',
    'ICT & ELV': '#FFB74D',
  };

  // Building Progress for Bar Chart
  const buildingBarData = buildings.slice(0, 8).map((b) => {
    const bItems = workItems.filter((w) => w.buildingId === b.id);
    const bWeight = bItems.reduce((acc, w) => acc + w.workWeight, 0) || 1;
    const bProg = bItems.reduce(
      (acc, w) => acc + (w.workWeight * (w.progressPercentage || 0)) / 100,
      0
    );
    return {
      name: b.name.replace('Villa Bukit ', 'VB ').replace('Villa Air ', 'VA ').replace('Marine Sport Center', 'MSC'),
      actual: Number(((bProg / bWeight) * 100).toFixed(1)),
      planned: 85,
    };
  });

  // S-Curve Monthly Data
  const scurveData = [
    { month: 'Feb 2026', planned: 12, actual: 11 },
    { month: 'Mar 2026', planned: 26, actual: 28 },
    { month: 'Apr 2026', planned: 42, actual: 44 },
    { month: 'May 2026', planned: 58, actual: 56 },
    { month: 'Jun 2026', planned: 70, actual: 69 },
    { month: 'Jul 2026', planned: 78, actual: 75 },
    { month: 'Aug 2026', planned: 83, actual: 80.5 },
    { month: 'Sep 2026', planned: 88, actual: 83.2 },
    { month: 'Oct 2026', planned: 92, actual: actualProgressPct },
    { month: 'Nov 2026 (Plan)', planned: 96, actual: null },
    { month: 'Dec 2026 (Plan)', planned: 100, actual: null },
  ];

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Global Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1f3556]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-xs font-bold text-[#F3F7FF] uppercase tracking-wider">
              Global Filter & Drill-down
            </h3>
          </div>
          {(filters.buildingId ||
            filters.category ||
            filters.status ||
            filters.searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#FF526B] hover:bg-[#FF526B]/15 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('action_reset')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-3">
          {/* Building Filter */}
          <div>
            <label className="block text-[10px] text-[#94A8C2] font-semibold mb-1">
              {t('field_building')}
            </label>
            <select
              value={filters.buildingId || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, buildingId: e.target.value || undefined }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] text-[#94A8C2] font-semibold mb-1">
              {t('field_category')}
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value || undefined }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] text-[#94A8C2] font-semibold mb-1">
              {t('field_status')}
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value || undefined }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* Contractor Filter */}
          <div>
            <label className="block text-[10px] text-[#94A8C2] font-semibold mb-1">
              {t('field_contractor')}
            </label>
            <select
              value={filters.contractor || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, contractor: e.target.value || undefined }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="">All Contractors</option>
              <option value="PT. Mandiri Mega Elektrik">PT. Mandiri Mega Elektrik</option>
              <option value="PT. Nusa Cipta Pendingin">PT. Nusa Cipta Pendingin</option>
              <option value="PT. Tirta Surya Teknik">PT. Tirta Surya Teknik</option>
              <option value="PT. Telematika Samudera">PT. Telematika Samudera</option>
            </select>
          </div>

          {/* PIC Filter */}
          <div>
            <label className="block text-[10px] text-[#94A8C2] font-semibold mb-1">
              {t('field_pic')}
            </label>
            <select
              value={filters.pic || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, pic: e.target.value || undefined }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="">All PICs</option>
              <option value="Hendra Wijaya">Hendra Wijaya</option>
              <option value="Rudi Hartono, ST">Rudi Hartono, ST</option>
              <option value="Dedi Kurniawan">Dedi Kurniawan</option>
              <option value="Bambang S., ST">Bambang S., ST</option>
            </select>
          </div>

          {/* Quick Active Items Jump */}
          <div className="flex items-end">
            <button
              onClick={() => onNavigateTab('work-items')}
              className="w-full py-1.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#080F1D] text-xs font-semibold transition"
            >
              View Work BOQ ({filteredWorkItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (12 Cards with electric accents) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Overall MEP Progress */}
        <div
          onClick={() => onNavigateTab('monthly-progress')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#00E5FF]/30 hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_overall_progress')}</span>
            <Activity className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{actualProgressPct}%</span>
            <span className="text-[10px] font-bold text-[#00D8B4]">Weighted</span>
          </div>
          <div className="w-full bg-[#101B2E] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00E5FF] to-[#00D8B4] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, actualProgressPct)}%` }}
            />
          </div>
        </div>

        {/* 2. Planned Progress */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#2979FF]/30 hover:border-[#2979FF] transition">
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_planned_progress')}</span>
            <TrendingUp className="w-4 h-4 text-[#2979FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{plannedProgressPct}%</span>
            <span className="text-[10px] font-bold text-[#94A8C2]">Target</span>
          </div>
          <div className="w-full bg-[#101B2E] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#2979FF] h-full rounded-full"
              style={{ width: `${plannedProgressPct}%` }}
            />
          </div>
        </div>

        {/* 3. Variance */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] transition">
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_variance')}</span>
            {progressVariance >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-[#00D8B4]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[#FF526B]" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black ${
                progressVariance >= 0 ? 'text-[#00D8B4]' : 'text-[#FF526B]'
              }`}
            >
              {progressVariance > 0 ? `+${progressVariance}` : progressVariance}%
            </span>
            <span className="text-[10px] text-[#94A8C2]">
              {progressVariance >= 0 ? 'Ahead' : 'Deviation'}
            </span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Planned vs Actual Delta</p>
        </div>

        {/* 4. Total Buildings */}
        <div
          onClick={() => onNavigateTab('locations')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_total_buildings')}</span>
            <Building2 className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{totalBuildingsCount}</span>
            <span className="text-[10px] text-[#00D8B4]">Facilities</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">15 Bukit, 5 Air, BoH, Clubs</p>
        </div>

        {/* 5. Active Work Items */}
        <div
          onClick={() => onNavigateTab('work-items')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_active_items')}</span>
            <Zap className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{activeItemsCount}</span>
            <span className="text-[10px] text-[#94A8C2]">of {filteredWorkItems.length}</span>
          </div>
          <p className="text-[10px] text-[#00E5FF] mt-2">Active Field Execution</p>
        </div>

        {/* 6. Completed Work Items */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#00D8B4]/25 transition">
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_completed_items')}</span>
            <CheckCircle2 className="w-4 h-4 text-[#00D8B4]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#00D8B4]">{completedItemsCount}</span>
            <span className="text-[10px] text-[#94A8C2]">Verified</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">100% BOQ Fulfilled</p>
        </div>

        {/* 7. Outstanding Issues */}
        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#FF526B]/30 hover:border-[#FF526B] hover:shadow-[0_0_15px_rgba(255,82,107,0.25)] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_outstanding_items')}</span>
            <AlertTriangle className="w-4 h-4 text-[#FF526B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#FF526B]">{outstandingIssuesCount}</span>
            <span className="text-[10px] font-bold text-[#FF526B]">Open Issues</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Requires site action</p>
        </div>

        {/* 8. Delayed Work Items */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#FFB74D]/30 transition">
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_delayed_items')}</span>
            <Clock className="w-4 h-4 text-[#FFB74D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#FFB74D]">{delayedItemsCount}</span>
            <span className="text-[10px] text-[#94A8C2]">Items</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Over target finish date</p>
        </div>

        {/* 9. Today's Activities */}
        <div
          onClick={() => onNavigateTab('daily-progress')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_today_activities')}</span>
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{todayLogsCount}</span>
            <span className="text-[10px] text-[#00D8B4]">Entries</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Daily Progress Reports</p>
        </div>

        {/* 10. Monthly Achievement */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] transition">
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_monthly_achievement')}</span>
            <TrendingUp className="w-4 h-4 text-[#00D8B4]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#00D8B4]">+{monthlyAchievementPct}%</span>
            <span className="text-[10px] text-[#94A8C2]">Oct 2026</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Monthly delta</p>
        </div>

        {/* 11. Uploaded Photos */}
        <div
          onClick={() => onNavigateTab('photos')}
          className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] hover:border-[#00E5FF]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('kpi_uploaded_photos')}</span>
            <Camera className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F3F7FF]">{totalPhotosCount}</span>
            <span className="text-[10px] text-[#00E5FF]">Files</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-2">Watermarked Evidence</p>
        </div>

        {/* 12. Quick Report Center */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#142238] to-[#101B2E] border border-[#00E5FF]/40 hover:border-[#00E5FF] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#94A8C2] text-xs">
            <span className="font-semibold truncate">{t('nav_reports')}</span>
            <Maximize2 className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-[#00E5FF]">Export Reports</span>
            <p className="text-[10px] text-[#94A8C2] mt-1">PDF & Excel Available</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Row 1: Planned vs Actual S-Curve + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* S-Curve Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                {t('chart_scurve_title')}
              </h3>
              <p className="text-xs text-[#94A8C2]">
                Cumulative planned progress timeline vs verified site actual execution
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#2979FF] font-semibold">
                <span className="w-3 h-1 bg-[#2979FF] rounded" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
                <span className="w-3 h-1 bg-[#00E5FF] rounded" /> Actual
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#00E5FF" stopOpacity={0.3} />
                    <stop offset="95%" stop-color="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#2979FF" stopOpacity={0.2} />
                    <stop offset="95%" stop-color="#2979FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3556" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94A8C2" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A8C2" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B2E',
                    borderColor: '#00E5FF',
                    borderRadius: '12px',
                    color: '#F3F7FF',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="planned"
                  stroke="#2979FF"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPlanned)"
                  name="Planned (%)"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#00E5FF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="Actual (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MEP Category Donut Breakdown (1 col) */}
        <div className="p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00E5FF]" />
              {t('chart_category_progress')}
            </h3>
            <p className="text-xs text-[#94A8C2]">Discipline breakdown & achievements</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.name as MEPCategory] || '#00E5FF'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B2E',
                    borderColor: '#00E5FF',
                    borderRadius: '12px',
                    color: '#F3F7FF',
                    fontSize: '12px',
                  }}
                  formatter={(val, name, item: any) => [
                    `${val} Work Items (${item.payload.progressPct}% Progress)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f3556]">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setFilters((p) => ({ ...p, category: cat.name }))}
                className="p-2 rounded-xl bg-[#101B2E] border border-[#1f3556] hover:border-[#00E5FF]/40 cursor-pointer transition"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: categoryColors[cat.name as MEPCategory] }}
                  />
                  <span className="text-[11px] font-bold text-[#F3F7FF] truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[10px]">
                  <span className="text-[#94A8C2]">{cat.value} items</span>
                  <span className="font-bold text-[#00E5FF]">{cat.progressPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Charts Row 2: Building Bar Chart + Critical Issues Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Progress Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                {t('chart_building_progress')}
              </h3>
              <p className="text-xs text-[#94A8C2]">
                Key building progress comparison against target schedule
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('locations')}
              className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              All Buildings ({buildings.length}) →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3556" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94A8C2" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A8C2" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B2E',
                    borderColor: '#00E5FF',
                    borderRadius: '12px',
                    color: '#F3F7FF',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="actual" fill="#00E5FF" radius={[4, 4, 0, 0]} name="Actual Progress (%)" />
                <Bar dataKey="planned" fill="#1f3556" stroke="#2979FF" strokeWidth={1} radius={[4, 4, 0, 0]} name="Planned Target (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Issues & Constraints (1 col) */}
        <div className="p-5 rounded-2xl bg-[#142238] border border-[#FF526B]/30 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF526B]" />
              Critical Site Issues ({issues.length})
            </h3>
            <button
              onClick={() => onNavigateTab('issues')}
              className="text-xs text-[#00E5FF] hover:underline"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 max-h-64 pr-1">
            {issues.slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                className="p-3 rounded-xl bg-[#101B2E] border border-[#1f3556] hover:border-[#FF526B]/50 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-[#F3F7FF] truncate">
                    {issue.buildingName} - {issue.room}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      issue.priority === 'Critical'
                        ? 'bg-[#FF526B]/20 text-[#FF526B] border border-[#FF526B]/40'
                        : 'bg-[#FFB74D]/20 text-[#FFB74D] border border-[#FFB74D]/40'
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A8C2] line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1f3556] text-[10px] text-[#94A8C2]">
                  <span>PIC: {issue.responsiblePic}</span>
                  <span className="text-[#00E5FF]">Due: {issue.targetCompletion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Field Photo Gallery Preview */}
      <div className="p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#00E5FF]" />
              Recent Field Evidence & Documentation
            </h3>
            <p className="text-xs text-[#94A8C2]">
              Live watermarked photos captured by field MEP supervisors
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('photos')}
            className="text-xs text-[#00E5FF] hover:underline"
          >
            Open Photo Gallery ({photoDocuments.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoDocuments.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPhoto(p.photoUrl)}
              className="group relative rounded-xl overflow-hidden bg-[#101B2E] border border-[#1f3556] hover:border-[#00E5FF] transition cursor-pointer"
            >
              <div className="aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={p.photoUrl}
                  alt={p.workDescription}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 text-left">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#00E5FF] mb-1">
                  <span>{p.buildingName}</span>
                  <span className="text-[#94A8C2]">{p.category}</span>
                </div>
                <p className="text-xs font-semibold text-[#F3F7FF] line-clamp-1">
                  {p.workDescription}
                </p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-[#94A8C2]">
                  <span>{p.photographer}</span>
                  <span>{p.date.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
