import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  CloudSun,
  Users,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Edit3,
  X,
  FileCheck,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { DailyProgress, WeatherType, WorkItem } from '../../types';

export const DailyProgressView: React.FC = () => {
  const {
    dailyProgressLogs,
    workItems,
    buildings,
    addDailyProgress,
    updateDailyProgress,
    deleteDailyProgress,
    approveDailyProgress,
    isManager,
    isSupervisor,
    t,
  } = useProject();
  const { currentUser, role } = useAuth();

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyProgress | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const initialWorkItem = workItems[0] || null;

  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string>(
    initialWorkItem?.id || ''
  );
  const [formData, setFormData] = useState({
    date: todayStr,
    dailyCompletedQuantity: 10,
    manpower: 4,
    equipment: 'Hand tools, Multimeter, PPE',
    weather: 'Sunny' as WeatherType,
    workDescription: '',
    issues: '',
    nextAction: '',
    targetDate: todayStr,
  });

  const selectedWorkItem = workItems.find((w) => w.id === selectedWorkItemId);

  // Auto calculate previous cumulative quantity for this item
  const existingItemLogs = dailyProgressLogs.filter(
    (l) => l.workItemId === selectedWorkItemId && l.status === 'Approved'
  );
  const previousCumulative = existingItemLogs.reduce(
    (max, curr) => Math.max(max, curr.currentCumulativeQuantity),
    selectedWorkItem?.completedQuantity || 0
  );

  const dailyQty = Number(formData.dailyCompletedQuantity) || 0;
  const currentCumulative = previousCumulative + dailyQty;
  const boqQty = selectedWorkItem?.boqQuantity || 1;
  const computedProgressPct = Number(
    Math.min(100, (currentCumulative / boqQty) * 100).toFixed(1)
  );

  const filteredLogs = dailyProgressLogs.filter((log) => {
    const matchSearch =
      log.reportId.toLowerCase().includes(search.toLowerCase()) ||
      log.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      log.contractor.toLowerCase().includes(search.toLowerCase()) ||
      log.workDescription.toLowerCase().includes(search.toLowerCase());
    const matchDate = !filterDate || log.date === filterDate;
    const matchBld = filterBuilding === 'ALL' || log.buildingId === filterBuilding;
    const matchStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchSearch && matchDate && matchBld && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingLog(null);
    const item = workItems[0];
    if (item) setSelectedWorkItemId(item.id);
    setFormData({
      date: todayStr,
      dailyCompletedQuantity: 10,
      manpower: 4,
      equipment: 'Testing equipment, ladder, safety gear',
      weather: 'Sunny',
      workDescription: '',
      issues: '',
      nextAction: '',
      targetDate: todayStr,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: DailyProgress) => {
    if (!isManager) return alert(t('access_restricted'));
    setEditingLog(log);
    setSelectedWorkItemId(log.workItemId);
    setFormData({
      date: log.date,
      dailyCompletedQuantity: log.dailyCompletedQuantity,
      manpower: log.manpower,
      equipment: log.equipment,
      weather: log.weather,
      workDescription: log.workDescription,
      issues: log.issues,
      nextAction: log.nextAction,
      targetDate: log.targetDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkItem) return;

    if (editingLog) {
      const newCurrent = editingLog.previousCumulativeQuantity + dailyQty;
      const newPct = Number(
        Math.min(100, (newCurrent / selectedWorkItem.boqQuantity) * 100).toFixed(1)
      );

      await updateDailyProgress(editingLog.id, {
        date: formData.date,
        dailyCompletedQuantity: dailyQty,
        currentCumulativeQuantity: newCurrent,
        progressPercentage: newPct,
        manpower: Number(formData.manpower),
        equipment: formData.equipment,
        weather: formData.weather,
        workDescription: formData.workDescription,
        issues: formData.issues,
        nextAction: formData.nextAction,
        targetDate: formData.targetDate,
      });
    } else {
      const reportNum = String(dailyProgressLogs.length + 1).padStart(3, '0');
      const cleanDate = formData.date.replace(/-/g, '');
      const reportId = `DPR-${cleanDate}-${reportNum}`;

      await addDailyProgress({
        reportId,
        workItemId: selectedWorkItem.id,
        date: formData.date,
        buildingId: selectedWorkItem.buildingId,
        buildingName: selectedWorkItem.buildingName,
        area: selectedWorkItem.area,
        room: selectedWorkItem.room,
        category: selectedWorkItem.category,
        subcategory: selectedWorkItem.subcategory,
        contractor: selectedWorkItem.contractor,
        pic: selectedWorkItem.pic,
        plannedQuantity: selectedWorkItem.boqQuantity,
        previousCumulativeQuantity: previousCumulative,
        dailyCompletedQuantity: dailyQty,
        currentCumulativeQuantity: currentCumulative,
        progressPercentage: computedProgressPct,
        manpower: Number(formData.manpower),
        equipment: formData.equipment,
        weather: formData.weather,
        workDescription: formData.workDescription,
        issues: formData.issues,
        nextAction: formData.nextAction,
        targetDate: formData.targetDate,
        status: isManager ? 'Approved' : 'Submitted',
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#142238] border border-[#00E5FF]/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-lg font-bold text-[#F3F7FF]">{t('nav_daily_progress')}</h2>
          </div>
          <p className="text-xs text-[#94A8C2] mt-1">
            Site Progress Logs with Automated BOQ Cumulative Calculation & Approval Workflow
          </p>
        </div>

        {(isManager || isSupervisor) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManager ? 'Direct Log Progress' : 'Submit Daily Progress'}</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#142238] border border-[#1f3556] flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
          <input
            type="text"
            placeholder="Search report ID, work, contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          />

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Submitted">Submitted (Pending Review)</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="rounded-2xl bg-[#142238] border border-[#1f3556] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101B2E] text-[#94A8C2] uppercase text-[10px] tracking-wider border-b border-[#1f3556]">
              <tr>
                <th className="py-3 px-4">Report ID & Date</th>
                <th className="py-3 px-4">Work Item & Location</th>
                <th className="py-3 px-4 text-right">Daily Vol</th>
                <th className="py-3 px-4 text-right">Cumul. Vol</th>
                <th className="py-3 px-4 text-center">Progress %</th>
                <th className="py-3 px-4">Site Conditions</th>
                <th className="py-3 px-4">Description & Constraints</th>
                <th className="py-3 px-4">Status & Submitter</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f3556]/60">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-[#101B2E]/50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#00E5FF] block">
                        {log.reportId}
                      </span>
                      <span className="text-[11px] text-[#94A8C2]">{log.date}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-[#F3F7FF] block truncate">
                        {log.subcategory}
                      </span>
                      <span className="text-[10px] text-[#00D8B4] block">
                        {log.buildingName} • {log.room}
                      </span>
                      <span className="text-[10px] text-[#94A8C2]">
                        {log.contractor}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-[#00E5FF]">
                      +{log.dailyCompletedQuantity}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[#F3F7FF]">
                      {log.currentCumulativeQuantity} / {log.plannedQuantity}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-[#00D8B4]">
                        {log.progressPercentage}%
                      </span>
                      <div className="w-16 bg-[#101B2E] h-1 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="bg-[#00D8B4] h-full"
                          style={{ width: `${Math.min(100, log.progressPercentage)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#94A8C2]">
                      <div className="flex items-center gap-1 text-[#F3F7FF]">
                        <CloudSun className="w-3.5 h-3.5 text-[#FFB74D]" />
                        <span>{log.weather}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#94A8C2] mt-0.5">
                        <Users className="w-3 h-3 text-[#00E5FF]" />
                        <span>{log.manpower} Manpower</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-[#F3F7FF] line-clamp-2">
                        {log.workDescription}
                      </p>
                      {log.issues && (
                        <p className="text-[10px] text-[#FF526B] line-clamp-1 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{log.issues}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'Approved'
                            ? 'bg-[#00D8B4]/20 text-[#00D8B4] border border-[#00D8B4]/40'
                            : log.status === 'Submitted'
                            ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 animate-pulse'
                            : log.status === 'Rejected'
                            ? 'bg-[#FF526B]/20 text-[#FF526B] border border-[#FF526B]/40'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-[#94A8C2] mt-0.5 truncate max-w-[110px]">
                        By: {log.submittedBy || 'Supervisor'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {/* Approval buttons for Manager */}
                      {isManager && log.status === 'Submitted' && (
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <button
                            onClick={() => approveDailyProgress(log.id, true)}
                            className="p-1 rounded bg-[#00D8B4]/20 text-[#00D8B4] hover:bg-[#00D8B4] hover:text-[#080F1D] transition"
                            title="Approve Progress"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => approveDailyProgress(log.id, false)}
                            className="p-1 rounded bg-[#FF526B]/20 text-[#FF526B] hover:bg-[#FF526B] hover:text-white transition"
                            title="Reject Submission"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isManager && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(log)}
                            className="p-1 text-[#94A8C2] hover:text-[#00E5FF]"
                            title="Edit Log"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete log ${log.reportId}?`)) {
                                deleteDailyProgress(log.id);
                              }
                            }}
                            className="p-1 text-[#94A8C2] hover:text-[#FF526B]"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#142238] border border-[#00E5FF]/40 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A8C2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#F3F7FF] mb-1">
              {editingLog ? 'Edit Daily Progress Record' : 'Record Daily Site Progress'}
            </h3>
            <p className="text-xs text-[#94A8C2] mb-4">
              Cumulative progress is verified against Master BOQ specifications.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Select Work Item */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Select Master Work Item *
                </label>
                <select
                  disabled={!!editingLog}
                  value={selectedWorkItemId}
                  onChange={(e) => setSelectedWorkItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none disabled:opacity-60"
                >
                  {workItems.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.category}] {w.buildingName} - {w.subcategory} (BOQ:{' '}
                      {w.boqQuantity} {w.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Calculation Live Box */}
              {selectedWorkItem && (
                <div className="p-3.5 rounded-xl bg-[#101B2E] border border-[#00E5FF]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A8C2]">Target BOQ:</span>
                    <span className="font-bold text-[#F3F7FF]">
                      {selectedWorkItem.boqQuantity} {selectedWorkItem.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A8C2]">Previous Cumulative Completed:</span>
                    <span className="font-bold text-[#94A8C2]">
                      {previousCumulative} {selectedWorkItem.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-[#1f3556] pt-1.5">
                    <span className="text-[#00E5FF] font-semibold">New Cumulative Progress:</span>
                    <span className="font-bold text-[#00E5FF]">
                      {currentCumulative} {selectedWorkItem.unit} ({computedProgressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#142238] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00E5FF] to-[#00D8B4] h-full"
                      style={{ width: `${computedProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Date of Work *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Daily Completed Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.dailyCompletedQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyCompletedQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Weather
                  </label>
                  <select
                    value={formData.weather}
                    onChange={(e) =>
                      setFormData({ ...formData, weather: e.target.value as WeatherType })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Heavy Rain">Heavy Rain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Manpower (People)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.manpower}
                    onChange={(e) =>
                      setFormData({ ...formData, manpower: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Equipment Used
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scaffolding, fusion welder, pressure test gauge"
                  value={formData.equipment}
                  onChange={(e) =>
                    setFormData({ ...formData, equipment: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                  Work Description & Specific Locations Handled *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail daily progress, jointing, pulling, or mounting..."
                  value={formData.workDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, workDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Issues / Constraints (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Material shortage, access delay"
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A8C2] mb-1">
                    Next Action Plan
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hydro-testing, insulation wrapping"
                    value={formData.nextAction}
                    onChange={(e) =>
                      setFormData({ ...formData, nextAction: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f3556] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#101B2E] text-xs font-semibold text-[#94A8C2] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:opacity-95 transition cursor-pointer"
                >
                  {editingLog
                    ? 'Save Changes'
                    : isManager
                    ? 'Approve & Save Progress'
                    : 'Submit for Manager Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
