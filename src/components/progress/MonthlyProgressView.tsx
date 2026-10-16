import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';

export const MonthlyProgressView: React.FC = () => {
  const { workItems, buildings, dailyProgressLogs, t } = useProject();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [filterBuilding, setFilterBuilding] = useState('ALL');

  // Filter items
  const filteredWorkItems = workItems.filter(
    (w) => filterBuilding === 'ALL' || w.buildingId === filterBuilding
  );

  // Weighted Progress Calculation
  const sumWorkWeight = filteredWorkItems.reduce((acc, w) => acc + w.workWeight, 0) || 1;
  const sumWeightedProgress = filteredWorkItems.reduce((acc, w) => {
    const itemProg = Math.min(100, (w.completedQuantity / w.boqQuantity) * 100);
    return acc + (w.workWeight * itemProg) / 100;
  }, 0);

  const totalCumulativeActual = Number(((sumWeightedProgress / sumWorkWeight) * 100).toFixed(1));
  const plannedProgressPct = 84.5;
  const progressVariance = Number((totalCumulativeActual - plannedProgressPct).toFixed(1));

  // Outstanding quantity summary
  const totalBOQUnits = filteredWorkItems.reduce((acc, w) => acc + w.boqQuantity, 0);
  const totalCompletedUnits = filteredWorkItems.reduce((acc, w) => acc + w.completedQuantity, 0);
  const totalOutstandingUnits = Math.max(0, totalBOQUnits - totalCompletedUnits);

  // Monthly S-Curve
  const monthlyTimelineData = [
    { month: 'Feb 2026', planned: 12.0, actual: 11.0, monthlyGain: 11.0 },
    { month: 'Mar 2026', planned: 26.0, actual: 28.0, monthlyGain: 17.0 },
    { month: 'Apr 2026', planned: 42.0, actual: 44.0, monthlyGain: 16.0 },
    { month: 'May 2026', planned: 58.0, actual: 56.0, monthlyGain: 12.0 },
    { month: 'Jun 2026', planned: 70.0, actual: 69.0, monthlyGain: 13.0 },
    { month: 'Jul 2026', planned: 78.0, actual: 75.0, monthlyGain: 6.0 },
    { month: 'Aug 2026', planned: 83.0, actual: 80.5, monthlyGain: 5.5 },
    { month: 'Sep 2026', planned: 88.0, actual: 83.2, monthlyGain: 2.7 },
    { month: 'Oct 2026 (Current)', planned: 92.0, actual: totalCumulativeActual, monthlyGain: 1.3 },
    { month: 'Nov 2026 (Target)', planned: 96.0, actual: null, monthlyGain: null },
    { month: 'Dec 2026 (Handover)', planned: 100.0, actual: null, monthlyGain: null },
  ];

  // Building Progress
  const buildingPerformanceData = buildings.slice(0, 10).map((b) => {
    const items = workItems.filter((w) => w.buildingId === b.id);
    const weight = items.reduce((acc, w) => acc + w.workWeight, 0) || 1;
    const progSum = items.reduce(
      (acc, w) => acc + (w.workWeight * (w.progressPercentage || 0)) / 100,
      0
    );
    const actual = Number(((progSum / weight) * 100).toFixed(1));
    return {
      name: b.name.replace('Villa Bukit ', 'VB ').replace('Villa Air ', 'VA '),
      actual,
      planned: 86.0,
      variance: Number((actual - 86.0).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_monthly_progress')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Weighted S-Curve Progress Engine & Discipline Completion Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Resort Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Planned */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#2979FF]/30 shadow-md">
          <span className="text-[11px] font-semibold text-[#94A8C2] block">
            Monthly Planned Progress
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F3F7FF]">{plannedProgressPct}%</span>
            <span className="text-[10px] text-[#2979FF] font-bold">Benchmark</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-1">October 2026 Schedule Target</p>
        </div>

        {/* Actual */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
          <span className="text-[11px] font-semibold text-[#94A8C2] block">
            Total Cumulative Actual
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00E5FF]">{totalCumulativeActual}%</span>
            <span className="text-[10px] text-[#00D8B4] font-bold">Normalized</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-1">Σ(Weight × Progress) / ΣWeight</p>
        </div>

        {/* Variance */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] shadow-md">
          <span className="text-[11px] font-semibold text-[#94A8C2] block">
            Progress Variance
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                progressVariance >= 0 ? 'text-[#00D8B4]' : 'text-[#FF526B]'
              }`}
            >
              {progressVariance > 0 ? `+${progressVariance}` : progressVariance}%
            </span>
            {progressVariance >= 0 ? (
              <span className="text-[10px] text-[#00D8B4] font-bold">Ahead</span>
            ) : (
              <span className="text-[10px] text-[#FF526B] font-bold">Behind Plan</span>
            )}
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-1">Scheduled vs Field Delta</p>
        </div>

        {/* Outstanding Qty */}
        <div className="p-4 rounded-2xl bg-[#142238] border border-[#FFB74D]/30 shadow-md">
          <span className="text-[11px] font-semibold text-[#94A8C2] block">
            Outstanding Quantity
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#FFB74D]">
              {Math.round(totalOutstandingUnits)}
            </span>
            <span className="text-[10px] text-[#94A8C2]">Remaining Units</span>
          </div>
          <p className="text-[10px] text-[#94A8C2] mt-1">Pending site installation</p>
        </div>
      </div>

      {/* S-Curve Chart (Full Width) */}
      <div className="p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
              Official MEP S-Curve (Planned vs Actual Cumulative)
            </h3>
            <p className="text-xs text-[#94A8C2]">
              Standard civil/MEP project S-Curve weighted by Bill of Quantities schedule
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#2979FF] font-semibold">
              <span className="w-3 h-1 bg-[#2979FF] rounded" /> Planned Target
            </span>
            <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
              <span className="w-3 h-1 bg-[#00E5FF] rounded" /> Verified Actual
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyTimelineData}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scurveActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#00E5FF" stopOpacity={0.4} />
                  <stop offset="95%" stop-color="#00E5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scurvePlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#2979FF" stopOpacity={0.25} />
                  <stop offset="95%" stop-color="#2979FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3556" opacity={0.6} />
              <XAxis dataKey="month" stroke="#94A8C2" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A8C2"
                fontSize={11}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
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
                fill="url(#scurvePlanned)"
                name="Planned (%)"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#00E5FF"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#scurveActual)"
                name="Actual (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Building Breakdown Performance */}
      <div className="p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F3F7FF] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00E5FF]" />
              Progress Breakdown by Resort Building
            </h3>
            <p className="text-xs text-[#94A8C2]">
              Building-level comparison against baseline target
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buildingPerformanceData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="actual" fill="#00E5FF" radius={[4, 4, 0, 0]} name="Actual (%)" />
              <Bar dataKey="planned" fill="#1f3556" stroke="#2979FF" strokeWidth={1} radius={[4, 4, 0, 0]} name="Planned (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
